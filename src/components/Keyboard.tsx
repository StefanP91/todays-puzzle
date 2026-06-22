import type { LetterState } from "../types";
import type { CSSProperties } from "react";
import type { KeyboardRows } from "../lib/gameConfig";

interface KeyboardProps {
  rows: KeyboardRows;
  onKey: (key: string) => void;
  keyStates: Record<string, LetterState>;
  disabled?: boolean;
  enterLabel: string;
  backspaceLabel: string;
}

function keyColor(state?: LetterState): string {
  if (state === "correct") return "bg-correct";
  if (state === "present") return "bg-present";
  if (state === "absent") return "bg-absent";
  return "bg-key";
}

export default function Keyboard({
  rows,
  onKey,
  keyStates,
  disabled,
  enterLabel,
  backspaceLabel,
}: KeyboardProps) {
  return (
    <div className="w-full max-w-full mx-auto keyboard-safe select-none">
      {rows.map((row, rowIndex) => {
        const rowKeys = rowIndex === 2 ? row.length + 2 : row.length;

        return (
        <div
          key={rowIndex}
          className="keyboard-row"
          style={{
            gap: "var(--key-gap)",
            "--row-keys": rowKeys,
          } as CSSProperties}
        >
          {rowIndex === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onKey("ENTER")}
              className="game-key game-key-action rounded font-bold bg-accent text-white active:scale-95 transition-transform disabled:opacity-50"
              aria-label={enterLabel}
            >
              ⏎
            </button>
          )}
          {row.map((key) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onKey(key)}
              className={`
                game-key game-key-letter
                rounded font-bold text-white
                active:scale-95 transition-transform disabled:opacity-50
                ${keyColor(keyStates[key])}
              `}
            >
              {key}
            </button>
          ))}
          {rowIndex === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onKey("BACKSPACE")}
              className="game-key game-key-action rounded font-bold bg-key text-white active:scale-95 transition-transform disabled:opacity-50"
              aria-label={backspaceLabel}
            >
              ⌫
            </button>
          )}
        </div>
        );
      })}
    </div>
  );
}
