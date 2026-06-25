import { createPortal } from "react-dom";
import AccountPanel from "./AccountPanel";
import type { ComponentProps } from "react";

type AccountModalProps = ComponentProps<typeof AccountPanel> & {
  closeLabel: string;
  onClose: () => void;
};

export default function AccountModal({ closeLabel, onClose, ...panelProps }: AccountModalProps) {
  return createPortal(
    <div className="auth-overlay" role="presentation" onClick={onClose}>
      <div
        className="account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="auth-modal__close" onClick={onClose} aria-label={closeLabel}>
          ×
        </button>
        <AccountPanel {...panelProps} titleId="account-modal-title" />
      </div>
    </div>,
    document.body,
  );
}
