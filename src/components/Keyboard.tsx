import type { LetterState } from "../types";
import { KEYBOARD_ROWS } from "../types";

interface KeyboardProps {
  onKey: (key: string) => void;
  keyStates: Record<string, LetterState>;
  disabled?: boolean;
}

function keyColor(state?: LetterState): string {
  if (state === "correct") return "bg-correct";
  if (state === "present") return "bg-present";
  if (state === "absent") return "bg-absent";
  return "bg-key";
}

export default function Keyboard({ onKey, keyStates, disabled }: KeyboardProps) {
  return (
    <div className="w-full mx-auto keyboard-safe select-none">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="keyboard-row"
          style={{ gap: "var(--key-gap)" }}
        >
          {rowIndex === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onKey("ENTER")}
              className="game-key game-key-action rounded font-bold bg-accent text-white active:scale-95 transition-transform disabled:opacity-50"
              aria-label="Внеси"
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
              aria-label="Избриши"
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
