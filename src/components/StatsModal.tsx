import type { Stats } from "../lib/storage";

interface StatsModalProps {
  stats: Stats;
  onClose: () => void;
}

export default function StatsModal({ stats, onClose }: StatsModalProps) {
  const winRate =
    stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxDist = Math.max(...stats.distribution, 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 modal-safe overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-panel rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-2xl border border-white/10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-4">Статистика</h2>

        <div className="grid grid-cols-4 gap-2 text-center mb-6">
          {[
            { label: "Игри", value: stats.played },
            { label: "Победи %", value: winRate },
            { label: "Серија", value: stats.currentStreak },
            { label: "Макс.", value: stats.maxStreak },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-xs text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-1 mb-6">
          {stats.distribution.map((count, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-4 text-right">{i + 1}</span>
              <div className="flex-1 h-5 bg-white/10 rounded overflow-hidden">
                <div
                  className="h-full bg-correct rounded transition-all"
                  style={{ width: `${(count / maxDist) * 100}%`, minWidth: count > 0 ? "1.5rem" : 0 }}
                />
              </div>
              <span className="w-6 text-right text-gray-400">{count}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 min-h-[44px] rounded-xl bg-accent font-bold hover:opacity-90 active:opacity-80 transition touch-manipulation"
        >
          Затвори
        </button>
      </div>
    </div>
  );
}
