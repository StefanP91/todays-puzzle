import type { User } from "@supabase/supabase-js";
import type { AuthContent } from "../lib/authContent";
import type { GameContent } from "../lib/gameContent";
import type { Stats } from "../lib/storage";

interface AccountPanelProps {
  user: User;
  stats: Stats;
  authContent: AuthContent;
  gameContent: GameContent;
  onLogout: () => void;
}

function displayName(user: User): string | null {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const name = meta?.full_name ?? meta?.name;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

export default function AccountPanel({
  user,
  stats,
  authContent,
  gameContent,
  onLogout,
}: AccountPanelProps) {
  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const name = displayName(user);
  const joined = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="account-panel">
      <div className="account-panel__head">
        <h3 className="account-panel__title">{authContent.accountTitle}</h3>
        <button type="button" className="account-panel__logout" onClick={onLogout}>
          {authContent.logout}
        </button>
      </div>

      <div className="account-panel__profile">
        {name && <p className="account-panel__name">{name}</p>}
        <p className="account-panel__email">{user.email}</p>
        {joined && (
          <p className="account-panel__meta">
            {authContent.memberSince} {joined}
          </p>
        )}
        <p className="account-panel__synced">{authContent.synced}</p>
      </div>

      <div className="account-panel__stats">
        <h4 className="account-panel__stats-title">{gameContent.statsTitle}</h4>
        <div className="account-panel__stats-grid">
          {[
            { label: gameContent.statsGames, value: stats.played },
            { label: gameContent.statsWinRate, value: `${winRate}%` },
            { label: gameContent.statsStreak, value: stats.currentStreak },
            { label: gameContent.statsMax, value: stats.maxStreak },
          ].map((item) => (
            <div key={item.label} className="account-panel__stat">
              <span className="account-panel__stat-value">{item.value}</span>
              <span className="account-panel__stat-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
