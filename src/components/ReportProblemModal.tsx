import { useState } from "react";
import type { ReportContent } from "../lib/reportContent";
import { submitProblemReport } from "../lib/reportProblem";
import type { GameLangCode } from "../lib/gameLanguage";

interface ReportProblemModalProps {
  content: ReportContent;
  lang: GameLangCode;
  onClose: () => void;
}

export default function ReportProblemModal({ content, lang, onClose }: ReportProblemModalProps) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 10) {
      setErrorText(content.tooShort);
      return;
    }

    setStatus("sending");
    setErrorText("");
    try {
      await submitProblemReport({
        message: trimmed,
        email: email.trim() || undefined,
        lang,
        pageUrl: window.location.href,
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorText(content.error);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 modal-safe overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-panel rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-white/10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-2">{content.title}</h2>
        <p className="text-sm text-gray-400 text-center mb-4">{content.hint}</p>

        {status === "success" ? (
          <p className="text-center text-green-400 font-medium mb-6">{content.success}</p>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <label className="block">
              <span className="sr-only">{content.placeholder}</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={content.placeholder}
                rows={5}
                maxLength={2000}
                required
                disabled={status === "sending"}
                className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-accent/60"
              />
            </label>

            <label className="block">
              <span className="text-xs text-gray-400 mb-1 block">{content.emailLabel}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={content.emailPlaceholder}
                maxLength={120}
                disabled={status === "sending"}
                className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
              />
            </label>

            {errorText && <p className="text-sm text-red-400">{errorText}</p>}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-3 min-h-[44px] rounded-xl bg-accent font-bold hover:opacity-90 active:opacity-80 transition touch-manipulation disabled:opacity-60"
            >
              {status === "sending" ? content.sending : content.submit}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-3 py-3 min-h-[44px] rounded-xl bg-white/10 font-bold hover:bg-white/15 active:bg-white/20 transition touch-manipulation"
        >
          {content.close}
        </button>
      </div>
    </div>
  );
}
