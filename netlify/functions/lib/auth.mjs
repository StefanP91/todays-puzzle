import crypto from "node:crypto";

const COOKIE_NAME = "admin_session";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret() {
  return process.env.ADMIN_JWT_SECRET || "";
}

function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export function isAdminConfigured() {
  return Boolean(getSecret() && getAdminEmail() && getAdminPassword());
}

export function verifyAdminCredentials(email, password) {
  if (!isAdminConfigured()) return false;
  const normalized = String(email || "").trim().toLowerCase();
  if (normalized !== getAdminEmail()) return false;
  return String(password || "") === getAdminPassword();
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createSessionToken() {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ exp: expiresAt })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || !getSecret()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (sign(payload) !== signature) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function readSessionCookie(event) {
  const raw = event.headers.cookie || event.headers.Cookie || "";
  const match = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function isAuthorizedAdmin(event) {
  const token = readSessionCookie(event);
  return verifySessionToken(token);
}

function cookieAttributes(maxAge) {
  const secure =
    process.env.NETLIFY_DEV === "true" || process.env.CONTEXT === "dev" ? "" : " Secure;";
  return `Path=/; HttpOnly;${secure} SameSite=Strict; Max-Age=${maxAge}`;
}

export function sessionCookieHeader(token) {
  const maxAge = Math.floor(TOKEN_TTL_MS / 1000);
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieAttributes(maxAge)}`;
}

export function clearSessionCookieHeader() {
  return `${COOKIE_NAME}=; ${cookieAttributes(0)}`;
}

export function unauthorizedResponse() {
  return {
    statusCode: 401,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Unauthorized" }),
  };
}
