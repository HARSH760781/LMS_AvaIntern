import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Keyboard,
  Trophy,
  RotateCcw,
  Zap,
  Timer,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const TypingTest = () => {
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0); // Changed: Counts ALL errors made
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResults, setShowResults] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Track typing history for error counting
  const [typingHistory, setTypingHistory] = useState([]); // Array of {index: number, char: string, isCorrect: boolean}

  // auto-scroll state (pixels)
  const [scrollY, setScrollY] = useState(0);

  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const previousInputRef = useRef("");

  const LINE_HEIGHT = 28; // px, must match CSS line height

  // Fetch loripsum function (same as before)
  const fetchLoripsum = async () => {
    try {
      const res = await fetch("https://loripsum.net/api/5/verylong/plaintext");
      const raw = await res.text();
      const cleaned = (raw || "").replace(/\s+/g, " ").trim();
      const rewritten = rewriteLoremToEnglish(cleaned);
      return rewritten;
    } catch (err) {
      console.error("loripsum fetch failed:", err);
      return rewriteLoremToEnglish(getFallbackText());
    }
  };

  // getFallbackText and rewriteLoremToEnglish functions remain the same
  const getFallbackText = () =>
    "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";

  const rewriteLoremToEnglish = (sourceText) => {
    // ... (same as before)
    const subjects = [
      "Technology",
      "Modern life",
      "The world around us" /* ... */,
    ];
    const verbs = ["advances", "continues to evolve", "shapes" /* ... */];
    const objects = [
      "how we work and communicate",
      "the ways we learn" /* ... */,
    ];
    const connectors = [
      "As a result,",
      "Consequently,",
      "At the same time," /* ... */,
    ];
    const clauses = ["people are learning new skills to adapt" /* ... */];

    const templates = [
      (s, v, o) => `${s} ${v} ${o}.`,
      (s, v, o) => `${s} ${v} ${o} and opens up fresh opportunities for many.`,
      /* ... */
    ];

    let resultWords = 0;
    const sentences = [];

    while (resultWords < 700) {
      // Reduced for typing test
      const s = subjects[Math.floor(Math.random() * subjects.length)];
      const v = verbs[Math.floor(Math.random() * verbs.length)];
      const o = objects[Math.floor(Math.random() * objects.length)];
      const tmpl = templates[Math.floor(Math.random() * templates.length)];
      const sentence = tmpl(s, v, o);

      sentences.push(sentence);
      resultWords += sentence.split(/\s+/).length;

      if (Math.random() < 0.12 && resultWords < 700) {
        const extra = `${
          connectors[Math.floor(Math.random() * connectors.length)]
        } ${clauses[Math.floor(Math.random() * clauses.length)]}.`;
        sentences.push(extra);
        resultWords += extra.split(/\s+/).length;
      }

      if (sentences.length > 30) break;
    }

    const paragraph = sentences.join(" ").replace(/\s+/g, " ").trim();
    const polished = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
    return polished.endsWith(".") ? polished : polished + ".";
  };

  // ------------------------------
  // Initialize test
  // ------------------------------
  const initializeTest = useCallback(async () => {
    const newText = await fetchLoripsum();
    setText(newText);
    setUserInput("");
    setStartTime(null);
    setEndTime(null);
    setIsActive(false);
    setWpm(0);
    setAccuracy(100);
    setCurrentIndex(0);
    setTotalErrors(0); // Reset errors
    setTypingHistory([]); // Reset history
    setTestCompleted(false);
    setShowResults(false);
    setIsTimeUp(false);
    setTimeLeft(timeLimit);
    setScrollY(0);
    previousInputRef.current = "";

    if (innerRef.current) {
      innerRef.current.style.transition = "transform 0.2s ease";
      innerRef.current.style.transform = `translateY(0px)`;
    }
  }, [timeLimit]);

  useEffect(() => {
    initializeTest();
  }, [initializeTest]);

  // Prevent manual scroll (same as before)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prevent = (e) => {
      e.preventDefault();
    };
    container.addEventListener("wheel", prevent, { passive: false });
    container.addEventListener("touchmove", prevent, { passive: false });
    container.addEventListener("keydown", prevent, { passive: false });

    return () => {
      container.removeEventListener("wheel", prevent);
      container.removeEventListener("touchmove", prevent);
      container.removeEventListener("keydown", prevent);
    };
  }, []);

  // Helper: count correct characters in final input
  const countCorrectChars = (input, target) => {
    const len = Math.min(input.length, target.length);
    let correct = 0;
    for (let i = 0; i < len; i++) {
      if (input[i] === target[i]) correct++;
    }
    return correct;
  };

  // ------------------------------
  // NEW: Track typing events for cumulative errors
  // ------------------------------
  const trackTypingEvent = (newInput, oldInput) => {
    const newHistory = [...typingHistory];

    // If user is typing forward (not backspacing)
    if (newInput.length > oldInput.length) {
      const addedChar = newInput[newInput.length - 1];
      const targetIndex = newInput.length - 1;
      const targetChar = text[targetIndex];
      const isCorrect = addedChar === targetChar;

      // Record this keystroke
      newHistory.push({
        index: targetIndex,
        char: addedChar,
        isCorrect: isCorrect,
        timestamp: Date.now(),
      });

      // If it's incorrect, increment total errors
      if (!isCorrect) {
        setTotalErrors((prev) => prev + 1);
      }
    }
    // If user is backspacing
    else if (newInput.length < oldInput.length) {
      // Remove the last entry from history if it exists
      if (newHistory.length > 0) {
        // But DO NOT subtract from total errors when backspacing
        // The error has already been counted
        newHistory.pop();
      }
    }
    // If user is replacing text (like pasting or editing middle)
    else {
      // Complex case - for simplicity, we'll recalculate from scratch
      recalculateErrors(newInput);
    }

    setTypingHistory(newHistory);
  };

  // Recalculate errors from scratch (for paste/edit operations)
  const recalculateErrors = (input) => {
    let errors = 0;
    const newHistory = [];

    for (let i = 0; i < input.length; i++) {
      const isCorrect = input[i] === text[i];
      newHistory.push({
        index: i,
        char: input[i],
        isCorrect: isCorrect,
        timestamp: Date.now(),
      });

      if (!isCorrect) errors++;
    }

    setTypingHistory(newHistory);
    setTotalErrors(errors);
  };

  // Auto-scroll logic (same as before)
  useEffect(() => {
    if (!containerRef.current || !innerRef.current) return;
    if (!isActive) return;

    const container = containerRef.current;
    const inner = innerRef.current;
    const activeChar = inner.querySelector(".active-char");
    if (!activeChar) return;

    const charOffsetTop = activeChar.offsetTop;
    const charHeight = activeChar.offsetHeight;
    const visibleBottom = scrollY + container.clientHeight;

    if (charOffsetTop + charHeight > visibleBottom - LINE_HEIGHT * 2) {
      const newScroll = scrollY + LINE_HEIGHT;
      setScrollY(newScroll);
      inner.style.transition = "transform 220ms ease";
      inner.style.transform = `translateY(${-newScroll}px)`;
    }
  }, [currentIndex, isActive, scrollY]);

  // Timer (same as before)
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0 && !testCompleted) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(interval);
            handleTimeUp();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, testCompleted]);

  const handleTimeUp = () => {
    setIsActive(false);
    setEndTime(Date.now());
    setIsTimeUp(true);
    setTestCompleted(true);
    setShowResults(true);
  };

  // ------------------------------
  // UPDATED: Live WPM / accuracy calculation
  // ------------------------------
  useEffect(() => {
    if (!startTime || !isActive) return;

    const compute = () => {
      // minutes elapsed
      const minutes = Math.max((Date.now() - startTime) / 60000, 1 / 60);

      // WPM: based on correct characters in final text
      const correctChars = countCorrectChars(userInput, text);
      const words = correctChars / 5;
      const currentWpm = Math.round(words / minutes);
      setWpm(isFinite(currentWpm) ? currentWpm : 0);

      // ACCURACY: based on total keystrokes vs errors
      // Total keystrokes = correct keystrokes + error keystrokes
      const totalKeystrokes = typingHistory.length;
      const correctKeystrokes = typingHistory.filter((h) => h.isCorrect).length;

      let currentAccuracy;
      if (totalKeystrokes === 0) {
        currentAccuracy = 100;
      } else {
        // Traditional typing accuracy formula
        currentAccuracy = Math.round(
          (correctKeystrokes / totalKeystrokes) * 100
        );
      }

      setAccuracy(currentAccuracy);
    };

    compute();
    const id = setInterval(compute, 800);
    return () => clearInterval(id);
  }, [startTime, isActive, userInput, text, typingHistory]);

  // ------------------------------
  // UPDATED: Input handling with error tracking
  // ------------------------------
  const handleInput = (e) => {
    const newInput = e.target.value;
    const oldInput = previousInputRef.current;

    if (!isActive && newInput.length === 1) {
      setIsActive(true);
      setStartTime(Date.now());
    }

    // Track typing events for error counting
    trackTypingEvent(newInput, oldInput);

    // Update state
    setUserInput(newInput);
    setCurrentIndex(newInput.length);
    previousInputRef.current = newInput;

    // Check for completion
    if (newInput.length >= text.length) {
      setIsActive(false);
      setEndTime(Date.now());
      setTestCompleted(true);
      setShowResults(true);
    }
  };

  const handleSubmit = () => {
    if (!isActive || userInput.length === 0) return;
    setIsActive(false);
    setEndTime(Date.now());
    setTestCompleted(true);
    setShowResults(true);
  };

  const resetTest = () => {
    initializeTest();
  };

  const getCharClass = (index) => {
    if (index === currentIndex)
      return "active-char bg-yellow-200 border-l-2 border-blue-500 animate-pulse";
    if (index >= userInput.length) return "text-gray-700";
    if (userInput[index] !== undefined && userInput[index] !== text[index])
      return "text-red-500 bg-red-100";
    return "text-green-600";
  };

  // ------------------------------
  // UPDATED: Final results calculation
  // ------------------------------
  const getFinalResults = () => {
    if (!startTime || !endTime) return null;

    const minutes = Math.max((endTime - startTime) / 60000, 1 / 60);
    const correctChars = countCorrectChars(userInput, text);
    const finalWpm = Math.round(correctChars / 5 / minutes);

    // Final accuracy based on cumulative errors
    const totalKeystrokes = typingHistory.length;
    const correctKeystrokes = typingHistory.filter((h) => h.isCorrect).length;
    const finalAccuracy =
      totalKeystrokes > 0
        ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
        : 100;

    return {
      finalWpm: isFinite(finalWpm) ? finalWpm : 0,
      finalAccuracy,
      timeElapsed: ((endTime - startTime) / 1000).toFixed(1),
      charactersTyped: userInput.length,
      correctCharacters: correctChars,
      errors: totalErrors, // This now shows ALL errors made (including corrected ones)
      totalKeystrokes: typingHistory.length,
      wordsTyped: Math.round(userInput.length / 5 || 0),
    };
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const finalResults = getFinalResults();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3">
            <Keyboard className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Professional Typing Test
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700">
                Time Limit
              </label>
              <select
                value={timeLimit}
                onChange={(e) => {
                  setTimeLimit(parseInt(e.target.value));
                  setTimeLeft(parseInt(e.target.value));
                }}
                disabled={isActive}
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={60}>1 Minute</option>
                <option value={120}>2 Minutes</option>
                <option value={300}>5 Minutes</option>
                <option value={600}>10 Minutes</option>
              </select>

              <button
                onClick={resetTest}
                className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-700">Speed</span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {wpm} WPM
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-700">Accuracy</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {accuracy}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-700">Time Left</span>
                </div>
                <span
                  className={`text-xl font-bold ${
                    timeLeft <= 10
                      ? "text-red-600 animate-pulse"
                      : "text-red-600"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-700">Errors</span>
                </div>
                <span className="text-xl font-bold text-orange-600">
                  {totalErrors}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span>Pro Tips</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  • Every incorrect keystroke counts as an error, even if you
                  backspace
                </p>
                <p>
                  • Accuracy = (correct keystrokes / total keystrokes) × 100
                </p>
                <p>• Focus on accuracy first, speed will follow</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2 flex justify-between">
                  <span>Type the text below</span>
                  <span className="text-blue-600 font-medium">
                    Errors: {totalErrors} | Keystrokes: {typingHistory.length}
                  </span>
                </div>

                {/* Container - overflow hidden (no manual scroll) */}
                <div
                  ref={containerRef}
                  className="bg-gray-50 rounded-lg p-6 h-[260px] border-2 border-gray-200 relative overflow-hidden"
                >
                  <div
                    ref={innerRef}
                    className="text-lg font-mono leading-snug whitespace-pre-wrap wrap-break-word select-none"
                    style={{
                      transform: `translateY(${-scrollY}px)`,
                      transition: "transform 220ms ease",
                    }}
                  >
                    {text.split("").map((ch, i) => (
                      <span
                        key={i}
                        className={`${getCharClass(
                          i
                        )} transition-all duration-150  rounded`}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500 text-center">
                  Auto-scroll activates when your caret reaches the lower lines.
                </div>
              </div>

              {/* Input area */}
              <textarea
                value={userInput}
                onChange={handleInput}
                placeholder="Start typing here to begin the test..."
                className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg resize-none outline-none transition-all duration-200"
                disabled={testCompleted}
                autoFocus
              />

              <button
                onClick={handleSubmit}
                disabled={!isActive}
                className="mt-4 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Send className="w-4 h-4" />
                <span>Submit Test</span>
              </button>
            </div>

            <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>How Accuracy is Calculated:</strong> Every keystroke is
                tracked. If you type 'a' instead of 'b', that's 1 error. If you
                backspace and type 'b', the error is still counted. Accuracy =
                (correct keystrokes ÷ total keystrokes) × 100.
              </div>
            </div>
          </div>
        </div>

        {/* Results Modal */}
        {showResults && finalResults && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="text-3xl font-bold mt-4 text-gray-900">
                {isTimeUp ? "Time's Up! ⏰" : "Test Completed! 🥇"}
              </h2>

              <p className="text-gray-600 mt-2">Here are your results:</p>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {finalResults.finalWpm}
                  </div>
                  <div className="text-sm text-gray-600">WPM</div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {finalResults.finalAccuracy}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">
                    {finalResults.timeElapsed}s
                  </div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>

                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">
                    {finalResults.errors}
                  </div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl col-span-2">
                  <div className="text-lg font-bold text-yellow-600">
                    {finalResults.totalKeystrokes} total keystrokes
                  </div>
                  <div className="text-sm text-gray-600">
                    {finalResults.correctKeystrokes} correct,{" "}
                    {finalResults.errors} incorrect
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4 m-6">
                <button
                  onClick={() => setShowResults(false)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>

                <button
                  onClick={resetTest}
                  className="px-6 py-3 mx-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .active-char { outline: none; }
      `}</style>
    </div>
  );
};

export default TypingTest;
