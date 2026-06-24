export function getFacebookAppId() {
  const id = (process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID || "").trim();
  return /^\d+$/.test(id) ? id : "";
}

/** Business app ID for server-side token exchange — never fall back to the public share app. */
export function getServerFacebookAppId() {
  const id = (process.env.FACEBOOK_APP_ID || "").trim();
  return /^\d+$/.test(id) ? id : "";
}

export function fbAppIdMeta(escapeAttr = (value) => value) {
  const id = getFacebookAppId();
  if (!id) return "";
  return `  <meta property="fb:app_id" content="${escapeAttr(id)}" />\n`;
}
