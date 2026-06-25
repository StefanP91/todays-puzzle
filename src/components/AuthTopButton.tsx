import { useState } from "react";
import type { AuthContent } from "../lib/authContent";
import type { GameContent } from "../lib/gameContent";
import type { Stats } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import AccountModal from "./AccountModal";
import AuthModal from "./AuthModal";

interface AuthTopButtonProps {
  authContent: AuthContent;
  gameContent: GameContent;
  stats: Stats;
  closeLabel: string;
}

export default function AuthTopButton({
  authContent,
  gameContent,
  stats,
  closeLabel,
}: AuthTopButtonProps) {
  const { user, configured, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!configured || loading) return null;

  if (user) {
    return (
      <>
        <button
          type="button"
          className="top-lang-btn"
          onClick={() => setOpen(true)}
          aria-label={authContent.accountTitle}
        >
          <span aria-hidden>👤</span>
          <span className="top-lang-btn__label">{authContent.accountTitle}</span>
        </button>
        {open && (
          <AccountModal
            user={user}
            stats={stats}
            authContent={authContent}
            gameContent={gameContent}
            closeLabel={closeLabel}
            onClose={() => setOpen(false)}
            onLogout={() => {
              setOpen(false);
              void signOut();
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className="top-lang-btn"
        onClick={() => setOpen(true)}
        aria-label={authContent.login}
      >
        <span aria-hidden>🔐</span>
        <span className="top-lang-btn__label">{authContent.login}</span>
      </button>
      {open && (
        <AuthModal content={authContent} closeLabel={closeLabel} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
