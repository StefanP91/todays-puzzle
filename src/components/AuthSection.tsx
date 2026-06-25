import { useState } from "react";
import type { AuthContent } from "../lib/authContent";
import type { GameContent } from "../lib/gameContent";
import type { Stats } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import AccountPanel from "./AccountPanel";
import AuthModal from "./AuthModal";

interface AuthSectionProps {
  authContent: AuthContent;
  gameContent: GameContent;
  stats: Stats;
  closeLabel: string;
}

export default function AuthSection({
  authContent,
  gameContent,
  stats,
  closeLabel,
}: AuthSectionProps) {
  const { user, configured, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!configured || loading) return null;

  if (user) {
    return (
      <AccountPanel
        user={user}
        stats={stats}
        authContent={authContent}
        gameContent={gameContent}
        onLogout={() => void signOut()}
      />
    );
  }

  return (
    <div className="auth-landing">
      <p className="auth-landing__hint">{authContent.optionalHint}</p>
      <button type="button" className="auth-landing__login" onClick={() => setOpen(true)}>
        {authContent.login}
      </button>
      {open && (
        <AuthModal content={authContent} closeLabel={closeLabel} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
