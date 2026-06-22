import type { Cell } from "../types";
import type { GameContent } from "../lib/gameContent";
import type { GameLangCode } from "../lib/gameLanguage";
import SharePanel from "./SharePanel";

interface CompletedBannerProps {
  won: boolean;
  answer: string;
  guessCount: number;
  puzzleNumber: number;
  guesses: Cell[][];
  shareText: string;
  content: GameContent;
  lang: GameLangCode;
}

export default function CompletedBanner({
  won,
  answer,
  guessCount,
  puzzleNumber,
  guesses,
  shareText,
  content,
  lang,
}: CompletedBannerProps) {
  return (
    <div className="completed-banner w-full max-w-sm mx-auto text-center px-2">
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-sm font-bold text-white mb-1">
          {won ? content.completedWon : content.completedLost}
        </p>
        <p className="text-xs text-gray-400 mb-3">
          {won
            ? `${content.completedWonDetail} ${guessCount}/6.`
            : `${content.completedLostDetail} ${answer}.`}{" "}
          {content.newPuzzleTomorrow}
        </p>
        <SharePanel
          shareText={shareText}
          puzzleNumber={puzzleNumber}
          guesses={guesses}
          won={won}
          content={content}
          lang={lang}
          compact
        />
      </div>
    </div>
  );
}
