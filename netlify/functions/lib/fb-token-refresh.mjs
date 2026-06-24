import { getServerFacebookAppId } from "./fb-app-id.mjs";
import { loadTokenBundle, saveTokenBundle } from "./fb-token-store.mjs";

const GRAPH_VERSION = "v21.0";
const REFRESH_BUFFER_SEC = 24 * 60 * 60;

function getAppSecret() {
  return (process.env.FACEBOOK_APP_KEY || process.env.FACEBOOK_APP_SECRET || "").trim();
}

function getPageId() {
  return (process.env.FACEBOOK_PAGE_ID || "").trim();
}

function envUserToken() {
  return (process.env.FACEBOOK_USER_ACCESS_TOKEN || "").trim();
}

function envPageToken() {
  return (process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "").trim();
}

function appAccessToken() {
  const appId = getServerFacebookAppId();
  const secret = getAppSecret();
  if (!appId || !secret) return null;
  return `${appId}|${secret}`;
}

function isTokenExpired(expiresAt, bufferSec = 0) {
  if (expiresAt == null || expiresAt === 0) return false;
  return expiresAt <= Math.floor(Date.now() / 1000) + bufferSec;
}

async function graphGet(path, params) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") url.searchParams.set(key, String(value));
  }

  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || data.error) {
    const message = data.error?.message || `Graph API error (${response.status})`;
    const err = new Error(message);
    err.code = data.error?.code;
    throw err;
  }
  return data;
}

async function debugToken(inputToken) {
  const appToken = appAccessToken();
  if (!appToken) {
    throw new Error("FACEBOOK_APP_KEY is required for token refresh");
  }

  const payload = await graphGet("debug_token", {
    input_token: inputToken,
    access_token: appToken,
  });
  return payload.data;
}

async function validateAccessToken(token) {
  try {
    const debug = await debugToken(token);
    if (!debug.is_valid) {
      return { valid: false, reason: "debug_invalid", expiresAt: debug.expires_at ?? null };
    }
    if (isTokenExpired(debug.expires_at)) {
      return { valid: false, reason: "debug_expired", expiresAt: debug.expires_at ?? null };
    }
    return { valid: true, expiresAt: debug.expires_at ?? 0 };
  } catch (error) {
    return {
      valid: false,
      reason: "debug_failed",
      message: error instanceof Error ? error.message : "Token validation failed",
    };
  }
}

async function exchangeLongLivedUserToken(shortToken) {
  const appId = getServerFacebookAppId();
  const secret = getAppSecret();
  if (!appId) {
    throw new Error("FACEBOOK_APP_ID must be set to your Business app ID for token refresh");
  }

  const data = await graphGet("oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: secret,
    fb_exchange_token: shortToken,
  });

  const expiresIn = typeof data.expires_in === "number" ? data.expires_in : null;
  return {
    accessToken: data.access_token,
    expiresAt: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : null,
  };
}

async function fetchPageAccessToken(userToken, pageId) {
  const data = await graphGet(pageId, {
    fields: "access_token",
    access_token: userToken,
  });

  if (!data.access_token) {
    throw new Error("Could not obtain a Page access token for this Page ID");
  }
  return data.access_token;
}

function emptyBundle(pageId) {
  return {
    pageId,
    userAccessToken: null,
    userExpiresAt: null,
    pageAccessToken: null,
    pageExpiresAt: null,
    refreshedAt: null,
  };
}

function isSessionExpiredError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    error?.code === 190 ||
    /session has expired/i.test(message) ||
    /error validating access token/i.test(message)
  );
}

async function ensureUserToken(bundle, event) {
  const userFromEnv = envUserToken();

  if (bundle.userAccessToken) {
    const validation = await validateAccessToken(bundle.userAccessToken);
    if (validation.valid && !isTokenExpired(validation.expiresAt, 7 * 24 * 60 * 60)) {
      bundle.userExpiresAt = validation.expiresAt ?? bundle.userExpiresAt;
      return bundle;
    }
    bundle.userAccessToken = null;
    bundle.userExpiresAt = null;
  }

  if (!userFromEnv) {
    return bundle;
  }

  const exchanged = await exchangeLongLivedUserToken(userFromEnv);
  bundle.userAccessToken = exchanged.accessToken;
  bundle.userExpiresAt = exchanged.expiresAt;
  await saveTokenBundle(event, bundle);
  return bundle;
}

async function refreshPageToken(bundle, event) {
  if (!bundle.userAccessToken) {
    return { ok: false, reason: "no_user_token" };
  }

  bundle.pageAccessToken = await fetchPageAccessToken(bundle.userAccessToken, bundle.pageId);
  const pageDebug = await debugToken(bundle.pageAccessToken);
  if (!pageDebug.is_valid) {
    return { ok: false, reason: "invalid_page_token", message: "Fetched Page token is not valid" };
  }

  bundle.pageExpiresAt = pageDebug.expires_at ?? 0;
  bundle.refreshedAt = new Date().toISOString();
  await saveTokenBundle(event, bundle);
  return { ok: true, source: "refreshed_page", refreshedAt: bundle.refreshedAt };
}

async function isCachedPageTokenUsable(bundle) {
  if (!bundle.pageAccessToken) return false;
  if (isTokenExpired(bundle.pageExpiresAt, REFRESH_BUFFER_SEC)) return false;

  const validation = await validateAccessToken(bundle.pageAccessToken);
  if (!validation.valid) return false;

  bundle.pageExpiresAt = validation.expiresAt ?? bundle.pageExpiresAt;
  return true;
}

/**
 * Refresh Page token using a long-lived User token stored in Netlify Blobs.
 * @param {import("@netlify/blobs").NetlifyFunctionEvent} event
 * @param {{ force?: boolean }} [options]
 */
export async function refreshFbTokens(event, options = {}) {
  const pageId = getPageId();
  const appId = getServerFacebookAppId();
  const appSecret = getAppSecret();

  if (!pageId) {
    return { ok: false, reason: "missing_page_id" };
  }

  if (!appId) {
    return {
      ok: false,
      reason: "missing_app_id",
      message: "Set FACEBOOK_APP_ID to your Business app ID (Today's Puzzle F Page).",
    };
  }

  if (!appSecret) {
    return {
      ok: false,
      reason: "missing_app_secret",
      message: "Set FACEBOOK_APP_KEY in Netlify for automatic token refresh.",
    };
  }

  let bundle = (await loadTokenBundle(event)) || emptyBundle(pageId);
  if (bundle.pageId !== pageId) {
    bundle = emptyBundle(pageId);
  }

  const hasEnvUserToken = Boolean(envUserToken());
  const pageUsable = !options.force && (await isCachedPageTokenUsable(bundle));

  if (pageUsable && !hasEnvUserToken) {
    await saveTokenBundle(event, bundle);
    return { ok: true, source: "cached", refreshedAt: bundle.refreshedAt };
  }

  try {
    bundle = await ensureUserToken(bundle, event);
  } catch (error) {
    return {
      ok: false,
      reason: "user_exchange_failed",
      message: error instanceof Error ? error.message : "Failed to exchange user token",
    };
  }

  if (!bundle.userAccessToken) {
    if (!hasEnvUserToken) {
      const fallback = envPageToken();
      if (fallback) {
        const validation = await validateAccessToken(fallback);
        if (validation.valid) {
          bundle.pageAccessToken = fallback;
          bundle.pageExpiresAt = validation.expiresAt ?? null;
          bundle.refreshedAt = new Date().toISOString();
          await saveTokenBundle(event, bundle);
          return { ok: true, source: "env_page_only", refreshedAt: bundle.refreshedAt };
        }
      }
    }

    return {
      ok: false,
      reason: "no_user_token",
      message:
        "Set FACEBOOK_USER_ACCESS_TOKEN in Netlify (User access token from Graph API Explorer, not a Page token).",
    };
  }

  try {
    return await refreshPageToken(bundle, event);
  } catch (error) {
    return {
      ok: false,
      reason: "refresh_failed",
      message: error instanceof Error ? error.message : "Token refresh failed",
    };
  }
}

/**
 * @param {import("@netlify/blobs").NetlifyFunctionEvent} event
 */
export async function getPageAccessToken(event) {
  const pageId = getPageId();
  if (!pageId) {
    return { token: null, pageId: "", tokenMeta: null, refreshResult: null };
  }

  const refreshResult = await refreshFbTokens(event);
  const bundle = await loadTokenBundle(event);

  if (!refreshResult.ok) {
    return {
      token: null,
      pageId,
      tokenMeta: bundle
        ? {
            refreshedAt: bundle.refreshedAt,
            pageExpiresAt: bundle.pageExpiresAt,
            userExpiresAt: bundle.userExpiresAt,
            hasUserToken: Boolean(bundle.userAccessToken),
          }
        : null,
      refreshResult,
    };
  }

  const token = bundle?.pageAccessToken || null;
  if (!token) {
    return {
      token: null,
      pageId,
      tokenMeta: null,
      refreshResult: { ok: false, reason: "no_page_token", message: "No page token available after refresh" },
    };
  }

  return {
    token,
    pageId,
    tokenMeta: {
      refreshedAt: bundle.refreshedAt,
      pageExpiresAt: bundle.pageExpiresAt,
      userExpiresAt: bundle.userExpiresAt,
      hasUserToken: Boolean(bundle.userAccessToken),
    },
    refreshResult,
  };
}

export function isFbTokenConfigured() {
  return Boolean(
    getPageId() &&
      (getServerFacebookAppId() || envPageToken() || envUserToken()),
  );
}

/** @param {import("@netlify/blobs").NetlifyFunctionEvent} event */
export async function getPageAccessTokenWithRetry(event) {
  const first = await getPageAccessToken(event);
  if (!first.token) return first;

  try {
    await graphGet(first.pageId, { fields: "name", access_token: first.token });
    return first;
  } catch (error) {
    if (!isSessionExpiredError(error)) throw error;

    const refresh = await refreshFbTokens(event, { force: true });
    if (!refresh.ok) {
      return {
        token: null,
        pageId: first.pageId,
        tokenMeta: first.tokenMeta,
        refreshResult: refresh,
      };
    }

    return getPageAccessToken(event);
  }
}

export { isSessionExpiredError };
