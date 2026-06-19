import type { Cell } from "../types";
import SharePanel from "./SharePanel";

interface CompletedBannerProps {
  won: boolean;
  answer: string;
  guessCount: number;
  puzzleNumber: number;
  guesses: Cell[][];
  shareText: string;
}

export default function CompletedBanner({
  won,
  answer,
  guessCount,
  puzzleNumber,
  guesses,
  shareText,
}: CompletedBannerProps) {
  return (
    <div className="completed-banner w-full max-w-sm mx-auto text-center px-2">
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-sm font-bold text-white mb-1">
          {won ? "✓ Ја заврши денешната загатка!" : "Денешната загатка е завршена"}
        </p>
        <p className="text-xs text-gray-400 mb-3">
          {won
            ? `Победи со ${guessCount}/6 обиди.`
            : `Зборот беше: ${answer}.`}{" "}
          Нова загатка утре.
        </p>
        <SharePanel
          shareText={shareText}
          puzzleNumber={puzzleNumber}
          guesses={guesses}
          won={won}
          compact
        />
      </div>
    </div>
  );
}
