import { useEffect, useState } from "react";
import type { FacebookShareResult } from "../lib/share";
import { copyShareText, openFacebook } from "../lib/share";

interface FacebookShareGuideProps {
  shareText: string;
  result: Extract<FacebookShareResult, { method: "manual" }>;
  onClose: () => void;
}

export default function FacebookShareGuide({
  shareText,
  result,
  onClose,
}: FacebookShareGuideProps) {
  const [copied, setCopied] = useState(false);
  const { imageUrl } = result;

  useEffect(() => {
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    copyShareText(shareText).then(setCopied);
  }, [shareText]);

  async function handleCopyAgain() {
    setCopied(await copyShareText(shareText));
  }

  function handleDownload() {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "deneshna-zagatka.png";
    link.click();
  }

  const instructions = [
    "Преземи ја сликата или копирај го текстот",
    "Отвори Facebook → „Што имаш на ум?“",
    "Додај ја сликата и/или залепи го текстот",
    "Кликни „Сподели“",
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 modal-safe overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="bg-panel rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-2xl border border-white/10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">📸</div>
          <h3 className="text-lg font-bold">Сподели на Facebook</h3>
          <p className="text-sm text-gray-400 mt-1">
            Преземи ја сликата и сподели ја на Facebook
          </p>
        </div>

        <img
          src={imageUrl}
          alt="Резултат од загатката"
          className="w-full rounded-xl border border-white/10 mb-4"
        />

        <ol className="text-sm text-gray-300 space-y-2 mb-4 list-decimal list-inside">
          {instructions.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <button
          type="button"
          onClick={handleDownload}
          className="w-full py-2.5 min-h-[44px] rounded-xl bg-white/10 font-bold mb-2 hover:bg-white/15 transition touch-manipulation"
        >
          Преземи слика
        </button>

        <button
          type="button"
          onClick={handleCopyAgain}
          className="w-full py-2.5 min-h-[44px] rounded-xl bg-white/10 font-bold mb-2 hover:bg-white/15 transition touch-manipulation"
        >
          {copied ? "Текстот е копиран ✓" : "Копирај текст"}
        </button>

        <button
          type="button"
          onClick={openFacebook}
          className="w-full py-3 min-h-[44px] rounded-xl bg-[#1877F2] font-bold mb-2 hover:bg-[#166fe5] transition touch-manipulation"
        >
          Отвори Facebook
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 min-h-[44px] rounded-xl text-gray-400 hover:text-white transition touch-manipulation"
        >
          Затвори
        </button>
      </div>
    </div>
  );
}
