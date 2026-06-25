import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { isAuthorizedAdmin, unauthorizedResponse } from "./lib/auth.mjs";
import { VALID_LANGS } from "./lib/share-content.mjs";

const LANG_ORDER = [...VALID_LANGS].sort();

function resolvePromoRoot() {
  const candidates = [
    join(process.cwd(), "public", "promo", "tiktok"),
    join(process.cwd(), "dist", "promo", "tiktok"),
  ];

  if (typeof import.meta !== "undefined" && import.meta.url) {
    candidates.unshift(
      join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public", "promo", "tiktok"),
    );
  }

  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }

  return candidates[0];
}

const promoRoot = resolvePromoRoot();

function buildManifest() {
  const available = existsSync(promoRoot);
  const languages = LANG_ORDER.map((lang) => {
    const postFile = join(promoRoot, "posts", `post-${lang}.txt`);
    const videoFile = join(promoRoot, "videos", `slideshow-${lang}.mp4`);
    const hasPost = existsSync(postFile);
    const hasVideo = existsSync(videoFile);
    return {
      lang,
      hasPost,
      hasVideo,
      postText: hasPost ? readFileSync(postFile, "utf8") : null,
      videoUrl: `/promo/tiktok/videos/slideshow-${lang}.mp4`,
    };
  });

  const readyCount = languages.filter((item) => item.hasVideo && item.hasPost).length;

  return {
    available,
    readyCount,
    totalLanguages: languages.length,
    languages,
    generateHint: "npm run promo:tiktok:all",
    note: available
      ? "Promo files are read from public/promo/tiktok/. Videos play when that folder is available on this server."
      : "Promo folder not found on server. Run npm run promo:tiktok:all locally, or deploy public/promo/tiktok/.",
  };
}

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { Allow: "GET" },
      body: "Method not allowed",
    };
  }

  if (!isAuthorizedAdmin(event)) {
    return unauthorizedResponse();
  }

  try {
    const manifest = buildManifest();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify(manifest),
    };
  } catch (error) {
    console.error("admin-tiktok-promo failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to load TikTok promo" }),
    };
  }
}
