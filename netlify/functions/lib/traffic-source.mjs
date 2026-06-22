const SOURCE_RULES = [
  { key: "facebook", hosts: ["facebook.com", "fb.com", "m.facebook.com", "l.facebook.com", "lm.facebook.com"], utm: ["facebook", "fb"] },
  { key: "instagram", hosts: ["instagram.com", "l.instagram.com"], utm: ["instagram", "ig"] },
  { key: "google", hosts: ["google.com", "google.mk", "google.de", "google.fr"], utm: ["google", "gclid"] },
  { key: "bing", hosts: ["bing.com"], utm: ["bing", "msclkid"] },
  { key: "yahoo", hosts: ["yahoo.com", "search.yahoo.com"], utm: ["yahoo"] },
  { key: "duckduckgo", hosts: ["duckduckgo.com"], utm: ["duckduckgo", "ddg"] },
  { key: "twitter", hosts: ["twitter.com", "x.com", "t.co", "mobile.twitter.com"], utm: ["twitter", "x"] },
  { key: "linkedin", hosts: ["linkedin.com", "lnkd.in"], utm: ["linkedin"] },
  { key: "tiktok", hosts: ["tiktok.com", "vm.tiktok.com"], utm: ["tiktok"] },
  { key: "whatsapp", hosts: ["whatsapp.com", "web.whatsapp.com", "api.whatsapp.com"], utm: ["whatsapp", "wa"] },
  { key: "telegram", hosts: ["telegram.org", "t.me"], utm: ["telegram", "tg"] },
  { key: "pinterest", hosts: ["pinterest.com", "pin.it"], utm: ["pinterest"] },
  { key: "reddit", hosts: ["reddit.com", "old.reddit.com"], utm: ["reddit"] },
  { key: "youtube", hosts: ["youtube.com", "youtu.be", "m.youtube.com"], utm: ["youtube", "yt"] },
  { key: "snapchat", hosts: ["snapchat.com"], utm: ["snapchat"] },
  { key: "messenger", hosts: ["messenger.com"], utm: ["messenger"] },
  { key: "viber", hosts: ["viber.com"], utm: ["viber"] },
];

export const TRAFFIC_SOURCE_LABELS = {
  direct: "Direct / bookmark",
  facebook: "Facebook",
  instagram: "Instagram",
  google: "Google",
  bing: "Bing",
  yahoo: "Yahoo",
  duckduckgo: "DuckDuckGo",
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  pinterest: "Pinterest",
  reddit: "Reddit",
  youtube: "YouTube",
  snapchat: "Snapchat",
  messenger: "Messenger",
  viber: "Viber",
  email: "Email",
  other: "Other websites",
};

function hostMatches(hostname, pattern) {
  return hostname === pattern || hostname.endsWith(`.${pattern}`);
}

function matchUtmToken(token) {
  const value = String(token || "").trim().toLowerCase();
  if (!value) return null;

  if (value.includes("email") || value === "newsletter" || value === "mail") return "email";

  for (const rule of SOURCE_RULES) {
    if (rule.utm?.some((part) => value.includes(part))) return rule.key;
  }

  return null;
}

function matchReferrerHost(hostname) {
  for (const rule of SOURCE_RULES) {
    if (rule.hosts.some((host) => hostMatches(hostname, host))) return rule.key;
  }
  return null;
}

function pageHostFromUrl(pageUrl) {
  if (!pageUrl) return null;
  try {
    return new URL(pageUrl).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Classify where a visit came from using referrer + UTM tags. */
export function classifyTrafficSource(input = {}) {
  const utmSource = matchUtmToken(input.utmSource);
  if (utmSource) return utmSource;

  const utmMedium = matchUtmToken(input.utmMedium);
  if (utmMedium === "email") return "email";

  const referrer = String(input.referrer || "").trim();
  if (!referrer) return "direct";

  try {
    const refHost = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    const pageHost = pageHostFromUrl(input.pageUrl);
    if (pageHost && refHost === pageHost) return "direct";

    return matchReferrerHost(refHost) || "other";
  } catch {
    return "direct";
  }
}

export function sourceLabel(key) {
  return TRAFFIC_SOURCE_LABELS[key] || key;
}
