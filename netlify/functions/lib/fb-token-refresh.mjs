import { getFacebookAppId } from "./fb-app-id.mjs";
import { loadTokenBundle, saveTokenBundle } from "./fb-token-store.mjs";

const GRAPH_VERSION = "v21.0";
const REFRESH_BUFFER_SEC = 24 * 60 * 60;

function getAppSecret() {
  return (process.env.FACEBOOK_APP_SECRET || "").trim();
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
  const appId = getFacebookAppId();
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
    throw new Error("FACEBOOK_APP_SECRET is required for token refresh");
  }

  const payload = await graphGet("debug_token", {
    input_token: inputToken,
    access_token: appToken,
  });
  return payload.data;
}

async function exchangeLongLivedUserToken(shortToken) {
  const appId = getFacebookAppId();
  const secret = getAppSecret();
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

  if (bundle.userAccessToken && !isTokenExpired(bundle.userExpiresAt)) {
    try {
      const debug = await debugToken(bundle.userAccessToken);
      if (debug.is_valid && !isTokenExpired(debug.expires_at, 7 * 24 * 60 * 60)) {
        bundle.userExpiresAt = debug.expires_at ?? bundle.userExpiresAt;
        return bundle;
      }
    } catch {
      // fall through to env/bootstrap
    }
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
  bundle.pageExpiresAt = pageDebug.expires_at ?? 0;
  bundle.refreshedAt = new Date().toISOString();
  await saveTokenBundle(event, bundle);
  return { ok: true, source: "refreshed_page", refreshedAt: bundle.refreshedAt };
}

/**
 * Refresh Page token using a long-lived User token stored in Netlify Blobs.
 * @param {import("@netlify/blobs").NetlifyFunctionEvent} event
 * @param {{ force?: boolean }} [options]
 */
export async function refreshFbTokens(event, options = {}) {
  const pageId = getPageId();
  const appId = getFacebookAppId();
  const appSecret = getAppSecret();

  if (!pageId || !appId) {
    return { ok: false, reason: "missing_page_or_app_id" };
  }

  if (!appSecret) {
    return {
      ok: false,
      reason: "missing_app_secret",
      message: "Set FACEBOOK_APP_SECRET in Netlify for automatic token refresh.",
    };
  }

  let bundle = (await loadTokenBundle(event)) || emptyBundle(pageId);
  if (bundle.pageId !== pageId) {
    bundle = emptyBundle(pageId);
  }

  const pageValid =
    bundle.pageAccessToken && !isTokenExpired(bundle.pageExpiresAt, REFRESH_BUFFER_SEC);

  if (pageValid && !options.force) {
    return { ok: true, source: "cached", refreshedAt: bundle.refreshedAt };
  }

  bundle = await ensureUserToken(bundle, event);

  if (!bundle.userAccessToken) {
    const fallback = envPageToken();
    if (fallback) {
      bundle.pageAccessToken = fallback;
      try {
        const debug = await debugToken(fallback);
        bundle.pageExpiresAt = debug.expires_at ?? null;
        bundle.refreshedAt = new Date().toISOString();
        await saveTokenBundle(event, bundle);
      } catch {
        await saveTokenBundle(event, bundle);
      }

      return {
        ok: true,
        source: "env_page_only",
        warning:
          "Add FACEBOOK_USER_ACCESS_TOKEN (User token from Graph API Explorer) for automatic refresh.",
        refreshedAt: bundle.refreshedAt,
      };
    }

    return {
      ok: false,
      reason: "no_user_token",
      message:
        "Set FACEBOOK_USER_ACCESS_TOKEN in Netlify (generate a User access token in Graph API Explorer).",
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
    return { token: null, pageId: "", tokenMeta: null };
  }

  await refreshFbTokens(event);

  let bundle = await loadTokenBundle(event);
  let token = bundle?.pageAccessToken || envPageToken() || null;

  if (token && bundle?.pageAccessToken && isTokenExpired(bundle.pageExpiresAt)) {
    const retry = await refreshFbTokens(event, { force: true });
    if (retry.ok) {
      bundle = await loadTokenBundle(event);
      token = bundle?.pageAccessToken || token;
    }
  }

  return {
    token,
    pageId,
    tokenMeta: bundle
      ? {
          refreshedAt: bundle.refreshedAt,
          pageExpiresAt: bundle.pageExpiresAt,
          userExpiresAt: bundle.userExpiresAt,
          hasUserToken: Boolean(bundle.userAccessToken),
        }
      : null,
  };
}

export function isFbTokenConfigured() {
  return Boolean(getPageId() && (getFacebookAppId() || envPageToken() || envUserToken()));
}

/** @param {import("@netlify/blobs").NetlifyFunctionEvent} event */
export async function getPageAccessTokenWithRetry(event) {
  const first = await getPageAccessToken(event);
  if (!first.token) return first;

  try {
    const pageId = first.pageId;
    await graphGet(pageId, { fields: "name", access_token: first.token });
    return first;
  } catch (error) {
    if (!isSessionExpiredError(error)) throw error;

    const refresh = await refreshFbTokens(event, { force: true });
    if (!refresh.ok) throw error;

    return getPageAccessToken(event);
  }
}

export { isSessionExpiredError };
