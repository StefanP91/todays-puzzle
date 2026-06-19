import type { Cell, LetterState } from "../types";
import { MAX_GUESSES, WORD_LENGTH } from "../types";

interface BoardProps {
  guesses: Cell[][];
  currentGuess: string;
  currentRow: number;
  shake: boolean;
}

function cellColors(state: LetterState, filled: boolean): string {
  if (state === "correct") return "bg-correct border-correct text-white";
  if (state === "present") return "bg-present border-present text-white";
  if (state === "absent") return "bg-absent border-absent text-white";
  if (filled) return "border-gray-400 text-white bg-white/10";
  return "border-gray-600 text-white bg-transparent";
}

export default function Board({
  guesses,
  currentGuess,
  currentRow,
  shake,
}: BoardProps) {
  const rows = Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
    const guessRow = guesses[rowIndex];
    const isCurrent = rowIndex === currentRow && !guessRow;

    if (guessRow) {
      return guessRow.map((cell, i) => ({
        letter: cell.letter,
        state: cell.state,
        key: `${rowIndex}-${i}`,
      }));
    }

    if (isCurrent) {
      return Array.from({ length: WORD_LENGTH }, (_, i) => ({
        letter: currentGuess[i] ?? "",
        state: "empty" as LetterState,
        key: `${rowIndex}-${i}`,
      }));
    }

    return Array.from({ length: WORD_LENGTH }, (_, i) => ({
      letter: "",
      state: "empty" as LetterState,
      key: `${rowIndex}-${i}`,
    }));
  });

  return (
    <div
      className={`grid mx-auto w-fit ${shake ? "animate-shake" : ""}`}
      style={{
        gap: "var(--cell-gap)",
        gridTemplateRows: `repeat(${MAX_GUESSES}, 1fr)`,
      }}
    >
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex justify-center"
          style={{ gap: "var(--cell-gap)" }}
        >
          {row.map((cell) => (
            <div
              key={cell.key}
              className={`
                game-cell
                flex items-center justify-center
                font-bold uppercase
                border-2 rounded-md
                transition-colors duration-300
                ${cellColors(cell.state, !!cell.letter)}
                ${cell.letter && cell.state === "empty" ? "animate-pop" : ""}
                ${cell.state !== "empty" && cell.state !== "tbd" ? "animate-flip" : ""}
              `}
            >
              {cell.letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
