const BOT_RE =
  /facebookexternalhit|Facebot|meta-externalagent|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|Googlebot|bingbot/i;

const SKIP_PREFIXES = ["/assets/", "/api/", "/.netlify/", "/admin"];
const SKIP_PATHS = new Set(["/sitemap.xml", "/robots.txt", "/manifest.json", "/icon.svg", "/share", "/share.png"]);
const SKIP_EXT = /\.(js|css|svg|png|jpg|jpeg|webp|ico|woff2?|map|json|xml|txt)$/i;

export default async (request, context) => {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/$/, "") || "/";

    if (
      pathname === "/admin" ||
      pathname.startsWith("/admin/") ||
      SKIP_PATHS.has(pathname) ||
      SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
      SKIP_EXT.test(pathname)
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
