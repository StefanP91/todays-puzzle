import { useCallback, useEffect, useMemo, useState } from "react";
import Board from "./components/Board";
import CompletedBanner from "./components/CompletedBanner";
import Keyboard from "./components/Keyboard";
import ResultModal from "./components/ResultModal";
import StatsModal from "./components/StatsModal";
import TrainingBanner from "./components/TrainingBanner";
import { buildShareText, evaluateGuess, isValidWord, mergeKeyboardState } from "./lib/game";
import { getShareUrl } from "./lib/share";
import {
  createNewGame,
  loadGame,
  loadStats,
  saveGame,
  updateStatsOnComplete,
  type Stats,
} from "./lib/storage";
import { pickRandomTrainingWord } from "./lib/training";
import type { Cell, GameStatus, LetterState } from "./types";
import { KEYBOARD_ROWS, MAX_GUESSES, WORD_LENGTH } from "./types";

const ALL_KEYS = new Set(KEYBOARD_ROWS.flat());

type GameMode = "daily" | "training";

function emptyBoard() {
  return {
    guesses: [] as Cell[][],
    currentGuess: "",
    status: "playing" as GameStatus,
    keyStates: {} as Record<string, LetterState>,
    statsUpdated: false,
    showResult: false,
  };
}

export default function App() {
  const [mode, setMode] = useState<GameMode>("daily");
  const [dailyMeta] = useState(createNewGame);
  const [answer, setAnswer] = useState(dailyMeta.answer);
  const [hint, setHint] = useState(dailyMeta.hint);
  const [puzzleNumber] = useState(dailyMeta.puzzleNumber);
  const [dateKey] = useState(dailyMeta.dateKey);

  const [guesses, setGuesses] = useState<Cell[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [statsUpdated, setStatsUpdated] = useState(false);
  const [trainingRound, setTrainingRound] = useState(1);

  const resetBoard = useCallback(() => {
    const blank = emptyBoard();
    setGuesses(blank.guesses);
    setCurrentGuess(blank.currentGuess);
    setStatus(blank.status);
    setKeyStates(blank.keyStates);
    setStatsUpdated(blank.statsUpdated);
    setShowResult(blank.showResult);
  }, []);

  const startTrainingRound = useCallback(
    (exclude?: string, round = 1) => {
      const { word, hint: wordHint } = pickRandomTrainingWord(exclude);
      setAnswer(word);
      setHint(wordHint);
      setTrainingRound(round);
      resetBoard();
    },
    [resetBoard]
  );

  const enterTraining = useCallback(() => {
    setMode("training");
    startTrainingRound(undefined, 1);
  }, [startTrainingRound]);

  const exitTraining = useCallback(() => {
    setMode("daily");
    setAnswer(dailyMeta.answer);
    setHint(dailyMeta.hint);
    const saved = loadGame();
    if (saved) {
      setGuesses(saved.guesses);
      setCurrentGuess(saved.currentGuess);
      setStatus(saved.status);
      let kb: Record<string, LetterState> = {};
      for (const row of saved.guesses) {
        kb = mergeKeyboardState(kb, row);
      }
      setKeyStates(kb);
      setStatsUpdated(saved.status !== "playing");
    } else {
      resetBoard();
    }
    setShowResult(false);
  }, [dailyMeta.answer, dailyMeta.hint, resetBoard]);

  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setGuesses(saved.guesses);
      setCurrentGuess(saved.currentGuess);
      setStatus(saved.status);
      let kb: Record<string, LetterState> = {};
      for (const row of saved.guesses) {
        kb = mergeKeyboardState(kb, row);
      }
      setKeyStates(kb);
      if (saved.status !== "playing") {
        setStatsUpdated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (mode === "daily") {
      saveGame({ dateKey, guesses, currentGuess, status });
    }
  }, [mode, dateKey, guesses, currentGuess, status]);

  const currentRow = guesses.length;

  const shareText = useMemo(
    () => buildShareText(puzzleNumber, guesses, status === "won", getShareUrl()),
    [puzzleNumber, guesses, status]
  );

  const showToast = useCallback((text: string, duration = 2000) => {
    setMessage(text);
    setTimeout(() => setMessage(""), duration);
  }, []);

  const showHintClue = useCallback(() => {
    showToast(`Навод: ${hint}`, 5000);
  }, [hint, showToast]);

  const submitGuess = useCallback(() => {
    if (status !== "playing") return;

    if (currentGuess.length !== WORD_LENGTH) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showToast("Недоволно букви");
      return;
    }

    if (!isValidWord(currentGuess)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showToast("Непознат збор");
      return;
    }

    const evaluated = evaluateGuess(currentGuess, answer);
    const newGuesses = [...guesses, evaluated];
    setGuesses(newGuesses);
    setKeyStates((prev) => mergeKeyboardState(prev, evaluated));
    setCurrentGuess("");

    if (currentGuess.toUpperCase() === answer.toUpperCase()) {
      setStatus("won");
      if (mode === "daily") {
        setShowResult(true);
        if (!statsUpdated) {
          setStats(updateStatsOnComplete(true, newGuesses.length));
          setStatsUpdated(true);
        }
      }
      return;
    }

    if (newGuesses.length >= MAX_GUESSES) {
      setStatus("lost");
      if (mode === "daily") {
        setShowResult(true);
        if (!statsUpdated) {
          setStats(updateStatsOnComplete(false, 0));
          setStatsUpdated(true);
        }
      }
    }
  }, [
    status,
    currentGuess,
    answer,
    guesses,
    showToast,
    statsUpdated,
    mode,
  ]);

  const handleKey = useCallback(
    (key: string) => {
      if (status !== "playing") return;

      if (key === "ENTER") {
        submitGuess();
        return;
      }

      if (key === "BACKSPACE") {
        setCurrentGuess((g) => g.slice(0, -1));
        return;
      }

      if (!ALL_KEYS.has(key as (typeof KEYBOARD_ROWS)[number][number])) return;

      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((g) => g + key);
      }
    },
    [status, currentGuess, submitGuess]
  );

  useEffect(() => {
    function onPhysicalKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toUpperCase();

      if (e.key === "Enter") {
        e.preventDefault();
        handleKey("ENTER");
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        handleKey("BACKSPACE");
        return;
      }

      if (key.length === 1 && ALL_KEYS.has(key as (typeof KEYBOARD_ROWS)[number][number])) {
        e.preventDefault();
        handleKey(key);
      }
    }

    window.addEventListener("keydown", onPhysicalKey);
    return () => window.removeEventListener("keydown", onPhysicalKey);
  }, [handleKey]);

  const isDaily = mode === "daily";
  const isTraining = mode === "training";

  return (
    <>
      {showStats && (
        <StatsModal stats={stats} onClose={() => setShowStats(false)} />
      )}

      {showResult && isDaily && (
        <ResultModal
          won={status === "won"}
          answer={answer}
          puzzleNumber={puzzleNumber}
          guessCount={guesses.length}
          guesses={guesses}
          shareText={shareText}
          onClose={() => setShowResult(false)}
        />
      )}

      <div className="app-page">
        {status === "playing" && isDaily && (
          <div className="game-hint game-info-box game-info-box--outside">
            <p className="game-info-title">Како се игра</p>
            <p className="game-info-text">
              Со <strong>клик на тастатурата</strong> внеси{" "}
              <strong>5 букви</strong>, па кликни на{" "}
              <strong className="enter-symbol">⏎</strong>. Имаш{" "}
              <strong>6 обиди</strong>. Една загатка дневно.
            </p>
            <p className="game-info-colors">
              <span>🟩 точна буква</span>
              <span>🟨 погрешно место</span>
              <span>⬛ не постои</span>
            </p>
            <p className="game-info-tip">
              Притисни <strong>💡</strong> за навод поврзан со зборот.
            </p>
            <button
              type="button"
              onClick={enterTraining}
              className="mt-3 w-full text-sm font-bold py-2.5 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 transition touch-manipulation"
            >
              🏋️ Тренинг — неограничени загатки
            </button>
          </div>
        )}

        {status === "playing" && isTraining && (
          <div className="game-hint game-info-box game-info-box--training game-info-box--outside">
            <p className="game-info-title">Тренинг режим</p>
            <p className="game-info-text">
              Случаен збор — играј колку сакаш. Не се брои во дневната
              статистика и не може да се сподели.
            </p>
            <button
              type="button"
              onClick={exitTraining}
              className="mt-2 w-full text-sm font-bold py-2.5 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 transition touch-manipulation"
            >
              ← Назад на дневна загатка
            </button>
          </div>
        )}

        <div className="app-shell">
      <header className="app-header flex items-center justify-between border-b border-white/10 shrink-0">
        <button
          type="button"
          onClick={() => setShowStats(true)}
          className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 active:bg-white/15 transition text-lg touch-manipulation"
          aria-label="Статистика"
        >
          📊
        </button>
        <div className="text-center px-1 min-w-0">
          <h1 className="text-base xs:text-lg md:text-xl font-bold tracking-wide">
            {isTraining ? "Тренинг" : "Денешна Загатка"}
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5">
            {isTraining ? `Рунда #${trainingRound}` : `#${puzzleNumber}`}
          </p>
        </div>
        <button
          type="button"
          onClick={showHintClue}
          className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 active:bg-white/15 transition text-lg touch-manipulation"
          aria-label="Навод за зборот"
        >
          💡
        </button>
      </header>

      <main className="game-main">
        {message && (
          <div className="fixed toast-safe left-1/2 -translate-x-1/2 z-40 bg-white text-black px-4 py-2 rounded-lg font-bold text-sm shadow-lg max-w-[90vw] text-center">
            {message}
          </div>
        )}

        <div className="game-board-wrap">
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            currentRow={currentRow}
            shake={shake}
          />
        </div>

        {status !== "playing" && isDaily && (
          <CompletedBanner
            won={status === "won"}
            answer={answer}
            guessCount={guesses.length}
            puzzleNumber={puzzleNumber}
            guesses={guesses}
            shareText={shareText}
          />
        )}

        {status !== "playing" && isTraining && (
          <TrainingBanner
            won={status === "won"}
            answer={answer}
            guessCount={guesses.length}
            round={trainingRound}
            onNext={() => startTrainingRound(answer, trainingRound + 1)}
            onExit={exitTraining}
          />
        )}

        <div className="game-keyboard-wrap">
          <Keyboard
            onKey={handleKey}
            keyStates={keyStates}
            disabled={status !== "playing"}
          />
        </div>
      </main>
        </div>
      </div>
    </>
  );
}
