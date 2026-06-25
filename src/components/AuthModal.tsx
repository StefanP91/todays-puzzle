import { useState, type FormEvent } from "react";
import type { AuthContent } from "../lib/authContent";
import { useAuth } from "../contexts/AuthContext";

type Mode = "login" | "register";

interface AuthModalProps {
  content: AuthContent;
  closeLabel: string;
  onClose: () => void;
}

export default function AuthModal({ content, closeLabel, onClose }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(content.passwordMin);
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : content.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : content.errorGeneric);
      setBusy(false);
    }
  }

  return (
    <div className="auth-overlay" role="presentation" onClick={onClose}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="auth-modal__close" onClick={onClose} aria-label={closeLabel}>
          ×
        </button>

        <h2 id="auth-modal-title" className="auth-modal__title">
          {mode === "login" ? content.titleLogin : content.titleRegister}
        </h2>
        <p className="auth-modal__hint">{content.optionalHint}</p>

        <button
          type="button"
          className="auth-modal__google"
          onClick={() => void handleGoogle()}
          disabled={busy}
        >
          {content.google}
        </button>

        <div className="auth-modal__divider">or</div>

        <form className="auth-modal__form" onSubmit={(event) => void handleSubmit(event)}>
          <label className="auth-modal__label">
            {content.email}
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="auth-modal__input"
            />
          </label>

          <label className="auth-modal__label">
            {content.password}
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="auth-modal__input"
            />
          </label>

          {error && <p className="auth-modal__error">{error}</p>}

          <button type="submit" className="auth-modal__submit" disabled={busy}>
            {mode === "login" ? content.signIn : content.signUp}
          </button>
        </form>

        <button
          type="button"
          className="auth-modal__switch"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? content.switchRegister : content.switchLogin}
        </button>
      </div>
    </div>
  );
}
