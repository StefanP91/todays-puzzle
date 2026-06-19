import type { Cell } from "../types";
import { generateShareImage, blobToObjectUrl } from "./shareImage";
import { buildSharePayload, encodeShareParam, isLocalDev } from "./shareEncode";

export const GAME_SITE_URL = "https://deneshnazagatka.mk";

export function getShareUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return GAME_SITE_URL;
}

export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getTwitterShareUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function getFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function openFacebook(): void {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  openShareWindow(isMobile ? "https://m.facebook.com/" : "https://www.facebook.com/");
}

export function openShareWindow(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function copyShareText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback below
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function getTelegramShareUrl(text: string, url: string): string {
  const params = new URLSearchParams({
    url,
    text,
  });
  return `https://t.me/share/url?${params.toString()}`;
}

export function getViberShareUrl(text: string): string {
  return `viber://forward?text=${encodeURIComponent(text)}`;
}

export async function nativeShareWithImage(options: {
  shareText: string;
  puzzleNumber: number;
  guesses: Cell[][];
  won: boolean;
  url: string;
}): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    const blob = await generateShareImage({
      puzzleNumber: options.puzzleNumber,
      guesses: options.guesses,
      won: options.won,
    });
    const file = new File([blob], "deneshna-zagatka.png", { type: "image/png" });
    const shareData: ShareData = {
      files: [file],
      text: options.shareText,
      title: "Денешна Загатка",
      url: options.url,
    };

    if (navigator.canShare?.(shareData)) {
      await navigator.share(shareData);
      return true;
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return true;
    }
  }

  return nativeShare(options.shareText, options.url);
}

export async function nativeShare(text: string, url: string): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    await navigator.share({ text, url });
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return false;
    }
    return false;
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard?.write) return false;

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}

export type FacebookShareResult =
  | {
      method: "dialog";
      imageCopied: boolean;
      textCopied: boolean;
      imageUrl: string;
    }
  | {
      method: "clipboard";
      imageCopied: boolean;
      textCopied: boolean;
    }
  | { method: "manual"; imageUrl: string };


function openFacebookDialog(url: string): void {
  const popup = window.open(
    url,
    "facebook-share",
    "width=640,height=720,menubar=no,toolbar=no,status=no,scrollbars=yes,resizable=yes"
  );
  if (!popup) {
    window.location.href = url;
  }
}

function openFacebookComposer(sharePageUrl: string, imageUrl: string): void {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const params = new URLSearchParams({
    display: "popup",
    u: sharePageUrl,
    picture: imageUrl,
  });
  const base = isMobile
    ? "https://m.facebook.com/sharer/sharer.php"
    : "https://www.facebook.com/sharer/sharer.php";
  openFacebookDialog(`${base}?${params.toString()}`);
}

async function tryNativeFacebookImageShare(blob: Blob): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    const file = new File([blob], "todays-puzzle.png", { type: "image/png" });
    const shareData: ShareData = {
      files: [file],
      title: "Денешна Загатка",
    };

    if (!navigator.canShare?.(shareData)) return false;

    await navigator.share(shareData);
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return true;
    }
    return false;
  }
}

export async function shareToFacebook(options: {
  shareText: string;
  puzzleNumber: number;
  guesses: Cell[][];
  won: boolean;
}): Promise<FacebookShareResult> {
  const site = getShareUrl();
  const payload = buildSharePayload(
    options.puzzleNumber,
    options.guesses,
    options.won
  );
  const encoded = encodeShareParam(payload);
  const sharePageUrl = `${site}/api/share?d=${encoded}`;
  const imageUrl = `${site}/api/share.png?d=${encoded}`;

  if (!isLocalDev()) {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      const blob = await generateShareImage({
        puzzleNumber: options.puzzleNumber,
        guesses: options.guesses,
        won: options.won,
      });
      const shared = await tryNativeFacebookImageShare(blob);
      if (shared) {
        return { method: "dialog", imageCopied: true, textCopied: false, imageUrl: "" };
      }
    }

    openFacebookComposer(sharePageUrl, imageUrl);
    return { method: "dialog", imageCopied: true, textCopied: false, imageUrl: "" };
  }

  const blob = await generateShareImage({
    puzzleNumber: options.puzzleNumber,
    guesses: options.guesses,
    won: options.won,
  });
  const localImageUrl = blobToObjectUrl(blob);
  return { method: "manual", imageUrl: localImageUrl };
}
