import type { Cell } from "../types";
import SharePanel from "./SharePanel";

interface ResultModalProps {
  won: boolean;
  answer: string;
  puzzleNumber: number;
  guessCount: number;
  guesses: Cell[][];
  shareText: string;
  onClose: () => void;
}

export default function ResultModal({
  won,
  answer,
  puzzleNumber,
  guessCount,
  guesses,
  shareText,
  onClose,
}: ResultModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 modal-safe overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-panel rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-2xl border border-white/10 text-center my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl mb-2">{won ? "🎉" : "😔"}</div>
        <h2 className="text-xl font-bold mb-1">
          {won ? "Браво!" : "Утре повторно!"}
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Загатка #{puzzleNumber}
          {won && ` · ${guessCount}/6`}
        </p>

        {!won && (
          <p className="mb-4">
            Зборот беше:{" "}
            <span className="font-bold text-accent text-lg">{answer}</span>
          </p>
        )}

        <div className="mb-3">
          <SharePanel
            shareText={shareText}
            puzzleNumber={puzzleNumber}
            guesses={guesses}
            won={won}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 min-h-[44px] rounded-xl bg-white/10 font-bold hover:bg-white/15 active:bg-white/20 transition touch-manipulation"
        >
          Затвори
        </button>
      </div>
    </div>
  );
}
