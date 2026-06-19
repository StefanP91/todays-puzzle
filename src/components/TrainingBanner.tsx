interface TrainingBannerProps {
  won: boolean;
  answer: string;
  guessCount: number;
  round: number;
  onNext: () => void;
  onExit: () => void;
}

export default function TrainingBanner({
  won,
  answer,
  guessCount,
  round,
  onNext,
  onExit,
}: TrainingBannerProps) {
  return (
    <div className="training-banner w-full max-w-sm mx-auto text-center px-2">
      <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 px-4 py-3">
        <p className="text-xs font-semibold text-sky-300 uppercase tracking-wide mb-1">
          Тренинг #{round}
        </p>
        <p className="text-sm font-bold text-white mb-1">
          {won ? "✓ Браво!" : "Зборот беше:"}{" "}
          {!won && <span className="text-sky-200">{answer}</span>}
          {won && (
            <span className="text-gray-400 font-normal">
              {" "}
              · {guessCount}/6
            </span>
          )}
        </p>
        <p className="text-xs text-gray-400 mb-3">
          Тренингот не влијае на дневната статистика.
        </p>
        <div className="flex flex-col xs:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={onNext}
            className="text-sm font-bold px-4 py-2.5 rounded-lg bg-correct hover:opacity-90 active:opacity-80 transition touch-manipulation"
          >
            Следна загатка →
          </button>
          <button
            type="button"
            onClick={onExit}
            className="text-sm font-bold px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 transition touch-manipulation"
          >
            Дневна загатка
          </button>
        </div>
      </div>
    </div>
  );
}
