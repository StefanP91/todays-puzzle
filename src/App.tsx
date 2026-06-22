import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BestTipsSection from "./components/BestTipsSection";
import Board from "./components/Board";
import CompletedBanner from "./components/CompletedBanner";
import FaqSection from "./components/FaqSection";
import Keyboard from "./components/Keyboard";
import LanguageSection from "./components/LanguageSection";
import ResultModal from "./components/ResultModal";
import StatsModal from "./components/StatsModal";
import TrainingBanner from "./components/TrainingBanner";
import { buildShareText, evaluateGuess, isValidWord, mergeKeyboardState } from "./lib/game";
import { getKeyboardRows } from "./lib/gameConfig";
import { getGameContent } from "./lib/gameContent";
import { getTodayKey, getPuzzleNumber } from "./lib/daily";
import { ensureDictionary } from "./lib/dictionaries";
import {
  langFromUrl,
  hasSavedGameLanguage,
  isGameLangCode,
  resolveGameLanguage,
  resolveInitialGameLanguage,
  saveGameLanguage,
  type GameLangCode,
} from "./lib/gameLanguage";
import type { GameLanguage } from "./lib/languages";
import { getSharePageUrl } from "./lib/shareEncode";
import { getSiteContent } from "./lib/siteContent";
import {
  createNewGame,
  loadGame,
  loadStats,
  saveGame,
  updateStatsOnComplete,
  type Stats,
} from "./lib/storage";
import { pickRandomTrainingWord } from "./lib/training";
import { applyPageMeta } from "./lib/pageMeta";
import { trackVisitOnce } from "./lib/trackVisit";
import { normalizeKey, normalizeWord } from "./lib/words";
import type { Cell, GameStatus, LetterState } from "./types";
import { MAX_GUESSES, WORD_LENGTH } from "./types";

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

function keyboardFromGuesses(guesses: Cell[][]): Record<string, LetterState> {
  let kb: Record<string, LetterState> = {};
  for (const row of guesses) {
    kb = mergeKeyboardState(kb, row);
  }
  return kb;
}

export default function App() {
  const initialLang = resolveInitialGameLanguage();

  const [dictReady, setDictReady] = useState(false);
  const [gameLang, setGameLang] = useState<GameLangCode>(initialLang);
  const [mode, setMode] = useState<GameMode>("daily");
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState("");
  const [puzzleNumber, setPuzzleNumber] = useState(() => getPuzzleNumber());
  const [dateKey, setDateKey] = useState(() => getTodayKey());

  const [guesses, setGuesses] = useState<Cell[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState<Stats>(() => loadStats(initialLang));
  const [statsUpdated, setStatsUpdated] = useState(false);
  const [trainingRound, setTrainingRound] = useState(1);
  const gameRef = useRef<HTMLDivElement>(null);

  const gameContent = useMemo(() => getGameContent(gameLang), [gameLang]);
  const siteContent = useMemo(() => getSiteContent(gameLang), [gameLang]);
  const keyboardRows = useMemo(() => getKeyboardRows(gameLang), [gameLang]);
  const allKeys = useMemo(() => new Set(keyboardRows.flat()), [keyboardRows]);

  useEffect(() => {
    applyPageMeta(gameLang);
  }, [gameLang]);

  useEffect(() => {
    trackVisitOnce();
  }, []);

  const resetBoard = useCallback(() => {
    const blank = emptyBoard();
    setGuesses(blank.guesses);
    setCurrentGuess(blank.currentGuess);
    setStatus(blank.status);
    setKeyStates(blank.keyStates);
    setStatsUpdated(blank.statsUpdated);
    setShowResult(blank.showResult);
  }, []);

  const applySavedGame = useCallback(
    (saved: ReturnType<typeof loadGame>) => {
      if (saved) {
        setGuesses(saved.guesses);
        setCurrentGuess(saved.currentGuess);
        setStatus(saved.status);
        setKeyStates(keyboardFromGuesses(saved.guesses));
        setStatsUpdated(saved.status !== "playing");
        setShowResult(saved.status !== "playing");
      } else {
        resetBoard();
      }
    },
    [resetBoard]
  );

  const applyGameMeta = useCallback((meta: ReturnType<typeof createNewGame>) => {
    setAnswer(meta.answer);
    setHint(meta.hint);
    setPuzzleNumber(meta.puzzleNumber);
    setDateKey(meta.dateKey);
  }, []);

  const switchGameLanguage = useCallback(
    async (code: GameLangCode) => {
      await ensureDictionary(code);
      saveGameLanguage(code);
      setGameLang(code);
      setMode("daily");

      const meta = createNewGame(code);
      applyGameMeta(meta);
      setStats(loadStats(code));
      applySavedGame(loadGame(code));
    },
    [applySavedGame, applyGameMeta]
  );

  const startTrainingRound = useCallback(
    (exclude?: string, round = 1) => {
      const { word, hint: wordHint } = pickRandomTrainingWord(gameLang, exclude);
      setAnswer(word);
      setHint(wordHint);
      setTrainingRound(round);
      resetBoard();
    },
    [gameLang, resetBoard]
  );

  const enterTraining = useCallback(() => {
    setMode("training");
    startTrainingRound(undefined, 1);
  }, [startTrainingRound]);

  const exitTraining = useCallback(() => {
    setMode("daily");
    const meta = createNewGame(gameLang);
    applyGameMeta(meta);
    applySavedGame(loadGame(gameLang));
    setShowResult(false);
  }, [gameLang, applySavedGame, applyGameMeta]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const fromUrl = langFromUrl();
        const lang = fromUrl ?? resolveInitialGameLanguage();
        if (fromUrl) saveGameLanguage(fromUrl);

        await ensureDictionary(lang);
        if (cancelled) return;

        applyGameMeta(createNewGame(lang));
        setGameLang(lang);
        setStats(loadStats(lang));
        applySavedGame(loadGame(lang));
        setDictReady(true);

        if (!fromUrl && !hasSavedGameLanguage()) {
          const detected = await resolveGameLanguage();
          if (!cancelled && detected !== lang) {
            await switchGameLanguage(detected);
          }
        }
      } catch {
        if (!cancelled) setDictReady(true);
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [applySavedGame, applyGameMeta, switchGameLanguage]);

  useEffect(() => {
    if (!dictReady || mode !== "daily") return;
    saveGame({ dateKey, guesses, currentGuess, status, language: gameLang }, gameLang);
  }, [dictReady, mode, dateKey, guesses, currentGuess, status, gameLang]);

  const currentRow = guesses.length;

  const shareText = useMemo(
    () =>
      buildShareText(
        puzzleNumber,
        guesses,
        status === "won",
        getSharePageUrl(puzzleNumber, guesses, status === "won", gameLang),
        gameContent,
        gameLang
      ),
    [puzzleNumber, guesses, status, gameContent, gameLang]
  );

  const showToast = useCallback((text: string, duration = 2000) => {
    setMessage(text);
    setTimeout(() => setMessage(""), duration);
  }, []);

  const handleLanguageSelect = useCallback(
    (lang: GameLanguage) => {
      if (!lang.available) {
        showToast(siteContent.comingSoon, 2500);
        return;
      }
      if (isGameLangCode(lang.code) && lang.available) {
        const code = lang.code;
        if (code !== gameLang) {
          void switchGameLanguage(code);
        }
      }
      gameRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [gameLang, siteContent.comingSoon, showToast, switchGameLanguage]
  );

  const scrollToLanguages = useCallback(() => {
    document.getElementById("languages")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const showHintClue = useCallback(() => {
    showToast(`${gameContent.hintPrefix}: ${hint}`, 5000);
  }, [hint, gameContent.hintPrefix, showToast]);

  const submitGuess = useCallback(() => {
    if (status !== "playing") return;

    if (currentGuess.length !== WORD_LENGTH) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showToast(gameContent.notEnoughLetters);
      return;
    }

    if (!isValidWord(currentGuess, gameLang)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showToast(gameContent.unknownWord);
      return;
    }

    const evaluated = evaluateGuess(currentGuess, answer, gameLang);
    const newGuesses = [...guesses, evaluated];
    setGuesses(newGuesses);
    setKeyStates((prev) => mergeKeyboardState(prev, evaluated));
    setCurrentGuess("");

    if (normalizeWord(currentGuess, gameLang) === normalizeWord(answer, gameLang)) {
      setStatus("won");
      if (mode === "daily") {
        setShowResult(true);
        if (!statsUpdated) {
          setStats(updateStatsOnComplete(true, newGuesses.length, gameLang));
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
          setStats(updateStatsOnComplete(false, 0, gameLang));
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
    gameLang,
    gameContent.notEnoughLetters,
    gameContent.unknownWord,
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

      if (!allKeys.has(key)) return;

      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((g) => g + key);
      }
    },
    [status, currentGuess, submitGuess, allKeys]
  );

  useEffect(() => {
    function onPhysicalKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = normalizeKey(e.key, gameLang);

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

      if (key.length === 1 && allKeys.has(key)) {
        e.preventDefault();
        handleKey(key);
      }
    }

    window.addEventListener("keydown", onPhysicalKey);
    return () => window.removeEventListener("keydown", onPhysicalKey);
  }, [handleKey, allKeys]);

  const isDaily = mode === "daily";
  const isTraining = mode === "training";

  if (!dictReady) {
    return (
      <div className="app-page min-h-screen flex items-center justify-center">
        <div
          className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <>
      {showStats && (
        <StatsModal
          stats={stats}
          content={gameContent}
          onClose={() => setShowStats(false)}
        />
      )}

      {showResult && isDaily && (
        <ResultModal
          won={status === "won"}
          answer={answer}
          puzzleNumber={puzzleNumber}
          guessCount={guesses.length}
          guesses={guesses}
          shareText={shareText}
          content={gameContent}
          lang={gameLang}
          onClose={() => setShowResult(false)}
        />
      )}

      <div className="app-page">
        <button
          type="button"
          className="top-lang-btn"
          onClick={scrollToLanguages}
          aria-label={siteContent.selectLanguage}
        >
          <span aria-hidden>🌐</span>
          <span className="top-lang-btn__label">{siteContent.selectLanguage}</span>
        </button>

        {status === "playing" && isDaily && (
          <div className="game-hint game-info-box game-info-box--outside">
            <p className="game-info-title">{gameContent.howToPlayTitle}</p>
            <p className="game-info-text">{gameContent.howToPlayText}</p>
            <p className="game-info-colors">
              <span>{gameContent.howToPlayColors.correct}</span>
              <span>{gameContent.howToPlayColors.present}</span>
              <span>{gameContent.howToPlayColors.absent}</span>
            </p>
            <p className="game-info-tip">{gameContent.howToPlayTip}</p>
            <button
              type="button"
              onClick={enterTraining}
              className="mt-3 w-full text-sm font-bold py-2.5 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 transition touch-manipulation"
            >
              {gameContent.trainingButton}
            </button>
          </div>
        )}

        {status === "playing" && isTraining && (
          <div className="game-hint game-info-box game-info-box--training game-info-box--outside">
            <p className="game-info-title">{gameContent.trainingModeTitle}</p>
            <p className="game-info-text">{gameContent.trainingModeText}</p>
            <button
              type="button"
              onClick={exitTraining}
              className="mt-2 w-full text-sm font-bold py-2.5 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 transition touch-manipulation"
            >
              {gameContent.backToDaily}
            </button>
          </div>
        )}

        <div className="app-shell" id="game" ref={gameRef}>
          <header className="app-header flex items-center justify-between border-b border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setShowStats(true)}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 active:bg-white/15 transition text-lg touch-manipulation"
              aria-label={gameContent.statsAria}
            >
              📊
            </button>
            <div className="text-center px-1 min-w-0">
              <h1 className="text-base xs:text-lg md:text-xl font-bold tracking-wide">
                {isTraining ? gameContent.trainingTitle : gameContent.title}
              </h1>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                {isTraining
                  ? `${gameContent.roundLabel} #${trainingRound}`
                  : `#${puzzleNumber}`}
              </p>
            </div>
            <button
              type="button"
              onClick={showHintClue}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 active:bg-white/15 transition text-lg touch-manipulation"
              aria-label={gameContent.hintAria}
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
                content={gameContent}
                lang={gameLang}
              />
            )}

            {status !== "playing" && isTraining && (
              <TrainingBanner
                won={status === "won"}
                answer={answer}
                guessCount={guesses.length}
                round={trainingRound}
                content={gameContent}
                onNext={() => startTrainingRound(answer, trainingRound + 1)}
                onExit={exitTraining}
              />
            )}

            <div className="game-keyboard-wrap">
              <Keyboard
                rows={keyboardRows}
                onKey={handleKey}
                keyStates={keyStates}
                disabled={status !== "playing"}
                enterLabel={gameContent.keyboardEnter}
                backspaceLabel={gameContent.keyboardBackspace}
              />
            </div>
          </main>
        </div>

        <div className="landing-footer">
          <LanguageSection
            content={siteContent}
            activeCode={gameLang}
            onSelect={handleLanguageSelect}
          />
          <BestTipsSection content={siteContent} />
          <FaqSection content={siteContent} />
        </div>
      </div>
    </>
  );
}
