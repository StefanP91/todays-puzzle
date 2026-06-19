import { useState } from "react";
import type { Cell } from "../types";
import FacebookShareGuide from "./FacebookShareGuide";
import {
  canNativeShare,
  copyShareText,
  type FacebookShareResult,
  getShareUrl,
  getTelegramShareUrl,
  getTwitterShareUrl,
  getViberShareUrl,
  getWhatsAppShareUrl,
  nativeShareWithImage,
  openShareWindow,
  shareToFacebook,
} from "../lib/share";

interface SharePanelProps {
  shareText: string;
  puzzleNumber: number;
  guesses: Cell[][];
  won: boolean;
  compact?: boolean;
}

const SOCIAL_BUTTONS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    className: "bg-[#25D366] hover:bg-[#1fb855]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    className: "bg-[#1877F2] hover:bg-[#166fe5]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "twitter",
    label: "X",
    className: "bg-[#000000] hover:bg-[#1a1a1a] border border-white/15",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "telegram",
    label: "Telegram",
    className: "bg-[#229ED9] hover:bg-[#1f8fc7]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    id: "viber",
    label: "Viber",
    className: "bg-[#7360F2] hover:bg-[#6554e0]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.13l-.3-.18-3.12.82.83-3.04-.2-.32a8.094 8.094 0 0 1-1.26-4.38c.01-4.54 3.7-8.22 8.25-8.22M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.12-1.47-.74-1.69-.82-.23-.08-.39-.12-.56.12-.17.25-.64.82-.78.99-.15.17-.29.19-.54.07-.25-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.36-.77-1.86-.2-.48-.41-.42-.56-.43z" />
      </svg>
    ),
  },
] as const;

export default function SharePanel({
  shareText,
  puzzleNumber,
  guesses,
  won,
  compact = false,
}: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [facebookGuide, setFacebookGuide] = useState<Extract<
    FacebookShareResult,
    { method: "manual" }
  > | null>(null);
  const [facebookToast, setFacebookToast] = useState("");
  const shareUrl = getShareUrl();

  async function handleSocial(id: (typeof SOCIAL_BUTTONS)[number]["id"]) {
    switch (id) {
      case "whatsapp":
        openShareWindow(getWhatsAppShareUrl(shareText));
        break;
      case "facebook": {
        setFacebookLoading(true);
        try {
          const result = await shareToFacebook({
            shareText,
            puzzleNumber,
            guesses,
            won,
          });
          if (result.method === "dialog") {
            if (result.imageCopied) {
              setFacebookToast(
                "Сликата е копирана — ако постот е празен, залепи ја (Ctrl+V)"
              );
            } else {
              setFacebookToast("Сподели го линкот/постот на Facebook");
            }
            setTimeout(() => setFacebookToast(""), 7000);
          } else if (result.method === "clipboard") {
            setFacebookToast(
              result.imageCopied
                ? "Сликата е копирана — залепи ја (Ctrl+V) на Facebook"
                : "Текстот е копиран — залепи го на Facebook"
            );
            setTimeout(() => setFacebookToast(""), 6000);
          } else {
            setFacebookGuide(result);
          }
        } finally {
          setFacebookLoading(false);
        }
        break;
      }
      case "twitter":
        openShareWindow(getTwitterShareUrl(shareText));
        break;
      case "telegram":
        openShareWindow(getTelegramShareUrl(shareText, shareUrl));
        break;
      case "viber":
        window.location.href = getViberShareUrl(shareText);
        break;
    }
  }

  async function handleCopy() {
    const ok = await copyShareText(shareText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleNativeShare() {
    const shared = await nativeShareWithImage({
      shareText,
      puzzleNumber,
      guesses,
      won,
      url: shareUrl,
    });
    if (!shared) {
      await handleCopy();
    }
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className={`text-gray-400 ${compact ? "text-xs" : "text-sm"}`}>
        Сподели на социјални мрежи
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {SOCIAL_BUTTONS.map((btn) => (
          <button
            key={btn.id}
            type="button"
            title={btn.label}
            aria-label={`Сподели на ${btn.label}`}
            disabled={btn.id === "facebook" && facebookLoading}
            onClick={() => handleSocial(btn.id)}
            className={`${btn.className} w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-white transition active:scale-95 touch-manipulation disabled:opacity-60`}
          >
            {btn.id === "facebook" && facebookLoading ? (
              <span className="text-xs">…</span>
            ) : (
              btn.icon
            )}
          </button>
        ))}
        <button
          type="button"
          title="Копирај"
          aria-label="Копирај резултат"
          onClick={handleCopy}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 text-white transition active:scale-95 touch-manipulation"
        >
          {copied ? (
            <span className="text-lg">✓</span>
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
          )}
        </button>
      </div>

      {facebookToast && (
        <p className="text-xs text-correct font-medium leading-snug px-1">{facebookToast}</p>
      )}

      {facebookGuide && (
        <FacebookShareGuide
          shareText={shareText}
          result={facebookGuide}
          onClose={() => setFacebookGuide(null)}
        />
      )}

      {canNativeShare() && (
        <button
          type="button"
          onClick={handleNativeShare}
          className={`w-full rounded-xl bg-correct font-bold hover:opacity-90 active:opacity-80 transition touch-manipulation ${
            compact ? "py-2 min-h-[40px] text-sm" : "py-3 min-h-[44px]"
          }`}
        >
          Сподели (телефон)
        </button>
      )}
    </div>
  );
}
