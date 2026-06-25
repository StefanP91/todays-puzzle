import { useState } from "react";
import type { AuthContent } from "../lib/authContent";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";

interface AuthButtonProps {
  content: AuthContent;
  closeLabel: string;
}

export default function AuthButton({ content, closeLabel }: AuthButtonProps) {
  const { user, configured, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!configured || loading) return null;

  if (user) {
    return (
      <button
        type="button"
        className="auth-header-btn"
        onClick={() => void signOut()}
        title={user.email ?? content.logout}
      >
        {content.logout}
      </button>
    );
  }

  return (
    <>
      <button type="button" className="auth-header-btn" onClick={() => setOpen(true)}>
        {content.login}
      </button>
      {open && <AuthModal content={content} closeLabel={closeLabel} onClose={() => setOpen(false)} />}
    </>
  );
}
