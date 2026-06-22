export function getFacebookAppId() {
  const id = (process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID || "").trim();
  return /^\d+$/.test(id) ? id : "";
}

export function fbAppIdMeta(escapeAttr = (value) => value) {
  const id = getFacebookAppId();
  if (!id) return "";
  return `  <meta property="fb:app_id" content="${escapeAttr(id)}" />\n`;
}
