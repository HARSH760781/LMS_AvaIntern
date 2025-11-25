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

/**
 * TypingTest.jsx
 * - Fetches long text from loripsum.net
 * - Rewrites lorem ipsum into natural mixed-style English (Style C)
 * - No visible scrollbar, no manual scroll
 * - Auto-scrolls one line at a time when caret reaches bottom 2 lines
 * - Correct WPM calculation: only counts correct characters (1 word = 5 chars)
 */

const TypingTest = () => {
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResults, setShowResults] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // auto-scroll state (pixels)
  const [scrollY, setScrollY] = useState(0);

  const containerRef = useRef(null);
  const innerRef = useRef(null);

  const LINE_HEIGHT = 28; // px, must match CSS line height

  // ------------------------------
  // Fetch loripsum and rewrite to natural English
  // ------------------------------
  const fetchLoripsum = async () => {
    try {
      // loripsum.net returns HTML paragraphs; "verylong" yields long content
      const res = await fetch("https://loripsum.net/api/5/verylong/plaintext");
      const raw = await res.text(); // plaintext without tags when /plaintext used
      const cleaned = (raw || "").replace(/\s+/g, " ").trim();
      const rewritten = rewriteLoremToEnglish(cleaned);
      return rewritten;
    } catch (err) {
      console.error("loripsum fetch failed:", err);
      // fallback to small generated paragraph
      return rewriteLoremToEnglish(getFallbackText());
    }
  };

  // Fallback lorem-like text if API fails (shorter, will be rewritten)
  const getFallbackText = () =>
    "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";

  // Rewriting algorithm: convert incoming lorem-ish text into mixed natural English (Style C)
  const rewriteLoremToEnglish = (sourceText) => {
    const wordCount = Math.max(
      700,
      Math.min(1200, sourceText.split(/\s+/).length)
    ); // clamp
    const targetWords = wordCount;

    const subjects = [
      "Technology",
      "Modern life",
      "The world around us",
      "Every industry",
      "Communities",
      "Human creativity",
      "Education",
      "Digital tools",
      "Innovation",
      "People",
    ];

    const verbs = [
      "advances",
      "continues to evolve",
      "shapes",
      "drives",
      "transforms",
      "challenges",
      "inspires",
      "improves",
      "reshapes",
      "accelerates",
    ];

    const objects = [
      "how we work and communicate",
      "the ways we learn",
      "daily workflows",
      "collaboration across teams",
      "creative problem solving",
      "productivity and focus",
      "access to information",
      "remote collaboration",
      "user experience",
      "the global economy",
    ];

    const connectors = [
      "As a result,",
      "Consequently,",
      "At the same time,",
      "In many cases,",
      "Often,",
      "Over time,",
      "Interestingly,",
      "Moreover,",
      "Similarly,",
      "Meanwhile,",
    ];

    const clauses = [
      "people are learning new skills to adapt",
      "small improvements compound over time",
      "consistent practice leads to noticeable progress",
      "teams are collaborating across time zones",
      "tools provide new ways to measure impact",
      "users expect faster, clearer results",
      "design and function are equally important",
      "efficiency and clarity are often the goals",
      "new ideas are tested rapidly",
      "accessibility becomes a priority",
    ];

    const templates = [
      (s, v, o) => `${s} ${v} ${o}.`,
      (s, v, o) => `${s} ${v} ${o} and opens up fresh opportunities for many.`,
      (s, v, o) =>
        `${s} ${v} ${o}. ${
          connectors[Math.floor(Math.random() * connectors.length)]
        } ${clauses[Math.floor(Math.random() * clauses.length)]}.`,
      (s, v, o) =>
        `${s} ${v} ${o}, helping people stay productive and focused in changing environments.`,
      (s, v, o) =>
        `${s} ${v} ${o}. ${
          clauses[Math.floor(Math.random() * clauses.length)]
        }.`,
      (s, v, o) =>
        `${s} ${v} ${o}, and this often leads to better outcomes when teams invest in learning.`,
      (s, v, o) =>
        `${s} ${v} ${o}. ${
          connectors[Math.floor(Math.random() * connectors.length)]
        } ${
          clauses[Math.floor(Math.random() * clauses.length)]
        } for many organizations.`,
    ];

    let resultWords = 0;
    const sentences = [];

    while (resultWords < targetWords) {
      const s = subjects[Math.floor(Math.random() * subjects.length)];
      const v = verbs[Math.floor(Math.random() * verbs.length)];
      const o = objects[Math.floor(Math.random() * objects.length)];
      const tmpl = templates[Math.floor(Math.random() * templates.length)];
      const sentence = tmpl(s, v, o);

      sentences.push(sentence);
      resultWords += sentence.split(/\s+/).length;

      if (Math.random() < 0.12 && resultWords < targetWords) {
        const extra = `${
          connectors[Math.floor(Math.random() * connectors.length)]
        } ${clauses[Math.floor(Math.random() * clauses.length)]}.`;
        sentences.push(extra);
        resultWords += extra.split(/\s+/).length;
      }

      if (sentences.length > 3000) break;
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
    setErrors([]);
    setTestCompleted(false);
    setShowResults(false);
    setIsTimeUp(false);
    setTimeLeft(timeLimit);
    setScrollY(0);
    if (innerRef.current) {
      innerRef.current.style.transition = "transform 0.2s ease";
      innerRef.current.style.transform = `translateY(0px)`;
    }
  }, [timeLimit]);

  useEffect(() => {
    initializeTest();
  }, [initializeTest]);

  // ------------------------------
  // Prevent manual scroll (mouse wheel / touchmove / keyboard)
  // ------------------------------
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

  // ------------------------------
  // Helper: count correct characters up to current input
  // ------------------------------
  const countCorrectChars = (input, target) => {
    const len = Math.min(input.length, target.length);
    let correct = 0;
    for (let i = 0; i < len; i++) {
      if (input[i] === target[i]) correct++;
    }
    return correct;
  };

  // ------------------------------
  // Auto-scroll logic using translateY
  // ------------------------------
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

  // ------------------------------
  // Timer
  // ------------------------------
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
  // Live WPM / accuracy calculation (CORRECTED)
  // ------------------------------
  useEffect(() => {
    if (!startTime || !isActive) return;

    const compute = () => {
      // minutes elapsed
      const minutes = Math.max((Date.now() - startTime) / 60000, 1 / 60); // at least 1 second
      const correctChars = countCorrectChars(userInput, text);
      // Standard: 1 word = 5 characters
      const words = correctChars / 5;
      const currentWpm = Math.round(words / minutes);
      setWpm(isFinite(currentWpm) ? currentWpm : 0);

      // accuracy based on correct chars vs typed chars
      const typed = userInput.length;
      const acc = typed > 0 ? Math.round((correctChars / typed) * 100) : 100;
      setAccuracy(acc);
      // update errors display too
      setErrors(
        typed - correctChars >= 0
          ? Array.from({ length: typed - correctChars }, (_, i) => i)
          : []
      );
    };

    // compute immediately and every 800ms
    compute();
    const id = setInterval(compute, 800);
    return () => clearInterval(id);
  }, [startTime, isActive, userInput, text, testCompleted]);

  // ------------------------------
  // Input handling
  // ------------------------------
  const handleInput = (e) => {
    const input = e.target.value;

    if (!isActive && input.length === 1) {
      setIsActive(true);
      setStartTime(Date.now());
    }

    setUserInput(input);
    setCurrentIndex(input.length);

    // errors calc and accuracy/wpm handled by live effect above
    // but keep final-check for completion
    if (input.length >= text.length) {
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
    // Show incorrect if user typed but char mismatched
    if (userInput[index] !== undefined && userInput[index] !== text[index])
      return "text-red-500 bg-red-100";
    return "text-green-600";
  };

  // ------------------------------
  // Final results (consistent with live calculation)
  // ------------------------------
  const getFinalResults = () => {
    if (!startTime || !endTime) return null;
    const minutes = Math.max((endTime - startTime) / 60000, 1 / 60);
    const correctChars = countCorrectChars(userInput, text);
    const finalWpm = Math.round(correctChars / 5 / minutes);
    const typed = userInput.length;
    const finalAccuracy =
      typed > 0 ? Math.round((correctChars / typed) * 100) : 100;
    return {
      finalWpm: isFinite(finalWpm) ? finalWpm : 0,
      finalAccuracy,
      timeElapsed: ((endTime - startTime) / 1000).toFixed(1),
      charactersTyped: typed,
      correctCharacters: correctChars,
      errors: Math.max(typed - correctChars, 0),
      wordsTyped: Math.round(typed / 5 || 0),
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
          {/* <p className="text-gray-600 mt-2">
            Fresh long text (rewritten) • Line-by-line auto-scroll • No manual
            scroll
          </p> */}
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
                  {errors.length}
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
                  • The text will auto-scroll one line at a time as you type
                </p>
                <p>• Manual scrolling is disabled for better focus</p>
                <p>• Focus on steady rhythm — accuracy first</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2 flex justify-between">
                  <span>Type the text below</span>
                </div>

                {/* Container - overflow hidden (no manual scroll) */}
                <div
                  ref={containerRef}
                  className="bg-gray-50 rounded-lg p-6 h-[260px] border-2 border-gray-200 relative overflow-hidden"
                >
                  {/* Inner content is moved via transform translateY(-scrollY) */}
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
                <strong>Smart Scrolling:</strong> The text automatically scrolls
                line by line as your typing caret approaches the bottom. Manual
                scrolling is disabled to keep your focus on typing.
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
                  className="px-6 py-3 mx-2  rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline CSS for smoothness */}
      <style>{`
        /* hide native selection outline on container so caret highlight stands out */
        .active-char { outline: none; }
      `}</style>
    </div>
  );
};

export default TypingTest;
