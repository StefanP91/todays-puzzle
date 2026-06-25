import { useState } from "react";
import type { AuthContent } from "../lib/authContent";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";

interface AuthTopButtonProps {
  authContent: AuthContent;
  closeLabel: string;
}

function scrollToAccount() {
  document.getElementById("account")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function AuthTopButton({ authContent, closeLabel }: AuthTopButtonProps) {
  const { user, configured, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (!configured || loading) return null;

  if (user) {
    return (
      <button
        type="button"
        className="top-lang-btn"
        onClick={scrollToAccount}
        aria-label={authContent.accountTitle}
      >
        <span aria-hidden>👤</span>
        <span className="top-lang-btn__label">{authContent.accountTitle}</span>
      </button>
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
