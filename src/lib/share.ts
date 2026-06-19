import type { Cell } from "../types";
import { generateShareImage, blobToObjectUrl } from "./shareImage";
import {
  buildSharePayload,
  encodeShareParam,
  isLocalDev,
} from "./shareEncode";

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

function getFacebookAppId(): string | undefined {
  return import.meta.env.VITE_FACEBOOK_APP_ID?.trim() || undefined;
}

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

function openFacebookShareDialog(options: {
  appId: string;
  sharePageUrl: string;
  redirectUri: string;
}): void {
  const params = new URLSearchParams({
    app_id: options.appId,
    display: "popup",
    href: options.sharePageUrl,
    redirect_uri: options.redirectUri,
  });
  openFacebookDialog(`https://www.facebook.com/dialog/share?${params.toString()}`);
}

function openFacebookSharer(sharePageUrl: string): void {
  const params = new URLSearchParams({ u: sharePageUrl });
  openFacebookDialog(`https://www.facebook.com/sharer/sharer.php?${params.toString()}`);
}

export async function shareToFacebook(options: {
  shareText: string;
  puzzleNumber: number;
  guesses: Cell[][];
  won: boolean;
}): Promise<FacebookShareResult> {
  const appId = getFacebookAppId();
  const site = getShareUrl();
  const payload = buildSharePayload(
    options.puzzleNumber,
    options.guesses,
    options.won
  );
  const encoded = encodeShareParam(payload);
  const sharePageUrl = `${site}/api/share?d=${encoded}`;

  const blob = await generateShareImage({
    puzzleNumber: options.puzzleNumber,
    guesses: options.guesses,
    won: options.won,
  });
  const imageUrl = blobToObjectUrl(blob);
  const imageCopied = await copyImageToClipboard(blob);
  const textCopied = await copyShareText(options.shareText);

  if (!isLocalDev()) {
    if (appId) {
      openFacebookShareDialog({
        appId,
        sharePageUrl,
        redirectUri: `${site}/`,
      });
    } else {
      openFacebookSharer(sharePageUrl);
    }
    return { method: "dialog", imageCopied, textCopied, imageUrl };
  }

  if (imageCopied || textCopied) {
    openFacebook();
    URL.revokeObjectURL(imageUrl);
    return { method: "clipboard", imageCopied, textCopied };
  }

  return { method: "manual", imageUrl };
}
