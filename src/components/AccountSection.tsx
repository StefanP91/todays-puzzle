import type { AuthContent } from "../lib/authContent";
import type { GameContent } from "../lib/gameContent";
import type { Stats } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import AccountPanel from "./AccountPanel";

interface AccountSectionProps {
  authContent: AuthContent;
  gameContent: GameContent;
  stats: Stats;
}

export default function AccountSection({ authContent, gameContent, stats }: AccountSectionProps) {
  const { user, configured, loading, signOut } = useAuth();

  if (!configured || loading || !user) return null;

  return (
    <div id="account">
      <AccountPanel
        user={user}
        stats={stats}
        authContent={authContent}
        gameContent={gameContent}
        onLogout={() => void signOut()}
      />
    </div>
  );
}
