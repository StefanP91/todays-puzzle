const BOT_RE =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|Googlebot|bingbot/i;

const SKIP_PREFIXES = ["/assets/", "/api/", "/.netlify/", "/admin"];
const SKIP_EXT = /\.(js|css|svg|png|jpg|jpeg|webp|ico|woff2?|map|json)$/i;

export default async (request, context) => {
  try {
    const url = new URL(request.url);

    if (
      url.pathname === "/admin" ||
      url.pathname.startsWith("/admin/") ||
      SKIP_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
      SKIP_EXT.test(url.pathname)
    ) {
      return context.next();
    }

    const ua = request.headers.get("user-agent") ?? "";
    if (!BOT_RE.test(ua)) {
      return context.next();
    }

    const lang = url.searchParams.get("lang") ?? "en";
    const fnUrl = new URL("/.netlify/functions/home-og", url.origin);
    fnUrl.searchParams.set("lang", lang);

    return fetch(fnUrl.toString());
  } catch (error) {
    console.error("og-meta edge function failed:", error);
    return context.next();
  }
};
