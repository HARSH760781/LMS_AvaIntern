import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StartTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [eligible, setEligible] = useState(false);
  const [testDetails, setTestDetails] = useState(null);

  const serverURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Check test eligibility first
  useEffect(() => {
    const checkEligibility = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${serverURL}/api/tests/check-eligibility/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to check eligibility");
        }

        if (data.eligible) {
          setEligible(true);
          setTestDetails(data.test);
          await loadTestQuestions();
        } else {
          setEligible(false);
          if (data.alreadyTaken) {
            toast.error("🚫 You have already taken this test!", {
              position: "top-center",
              autoClose: 5000,
            });
          } else {
            toast.warning(data.message, {
              position: "top-center",
              autoClose: 5000,
            });
          }
          setTimeout(() => {
            navigate("/live-tests");
          }, 3000);
        }
      } catch (error) {
        console.error("Error checking eligibility:", error);
        toast.error("Error checking test eligibility");
        navigate("/live-tests");
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [id, navigate]);

  // Fetch questions and test metadata
  const loadTestQuestions = async () => {
    try {
      const qRes = await fetch(`${serverURL}/api/tests/extract/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const qData = await qRes.json();
      if (qData.success) {
        setQuestions(qData.questions);
      } else {
        throw new Error("Failed to load questions");
      }

      const tRes = await fetch(`${serverURL}/api/tests/meta/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const tData = await tRes.json();
      if (tData.success) {
        const duration = tData?.test?.duration || 30;
        setTimeLeft(duration * 60);
      } else {
        throw new Error("Failed to load test details");
      }
    } catch (err) {
      console.error("❌ Load Test Error:", err);
      toast.error("Failed to load test. Please try again!");
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!started || timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, started, submitted]);

  // Auto submit
  useEffect(() => {
    if (timeLeft === 0 && started && !submitted) handleSubmit();
  }, [timeLeft, started, submitted]);

  const chooseAnswer = (value) => {
    setAnswers({ ...answers, [index]: value });
  };

  // Score calculation
  const calculateScore = () => {
    let s = 0;
    questions.forEach((q, i) => {
      const selected = answers[i];
      if (!selected) return;
      if (selected === q.correct) s += 1;
    });
    return s;
  };

  const handleSubmit = async () => {
    if (document.fullscreenElement) document.exitFullscreen();

    const obtainedScore = calculateScore();
    setScore(obtainedScore);
    setSubmitted(true);

    try {
      const res = await fetch(`${serverURL}/api/tests/submit/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          answers,
          score: obtainedScore,
          total: questions.length,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyTaken) {
          toast.error("You have already submitted this test!");
          navigate("/live-tests");
          return;
        }
        throw new Error(data.message || "Failed to save results");
      }

      toast.success(
        `✅ Test submitted successfully! Your score: ${obtainedScore}/${questions.length}`
      );
    } catch (err) {
      console.error("❌ Error saving test result:", err);
      toast.error("Error saving results. Try again!");
    }
  };

  const handleStartTest = () => {
    setStarted(true);
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
        <p className="text-base sm:text-lg font-medium text-gray-700 text-center">
          Checking test eligibility...
        </p>
      </div>
    );
  }

  if (!eligible) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🚫</div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-center">
          Test Not Available
        </h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-center text-sm sm:text-base">
          You are not eligible to take this test.
        </p>
        <button
          onClick={() => navigate("/live-tests")}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
        >
          Back to Tests
        </button>
        <ToastContainer />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-4 sm:p-6">
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-blue-900">
            {testDetails?.title || "Test Instructions"}
          </h1>

          <div className="text-left mb-4 sm:mb-6 space-y-2 sm:space-y-3">
            <p className="text-sm sm:text-base text-gray-700">
              <strong>Duration:</strong>{" "}
              {testDetails?.duration || Math.floor(timeLeft / 60)} minutes
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              <strong>Total Questions:</strong> {questions.length}
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              <strong>Instructions:</strong>
            </p>
            <ul className="text-xs sm:text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>You cannot pause the test once started</li>
              <li>Fullscreen mode will be enabled</li>
              <li>Each question has only one correct answer</li>
              <li>Test will auto-submit when time ends</li>
              <li>You can only attempt this test once</li>
            </ul>
          </div>

          <button
            onClick={handleStartTest}
            className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl shadow-lg transition w-full"
          >
            Start Test Now
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-4 sm:p-6">
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎉</div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700 mb-3 sm:mb-4">
            Test Submitted!
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-2">
            Your Score: <span className="font-bold">{score}</span> /{" "}
            {questions.length}
          </p>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            Percentage: {((score / questions.length) * 100).toFixed(1)}%
          </p>
          <button
            onClick={() => navigate("/live-tests")}
            className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl shadow-lg transition w-full"
          >
            Back to Tests
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  const q = questions[index];

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center p-3 sm:p-4 lg:p-6 font-sans">
      {/* Header with timer */}
      <div className="w-full max-w-4xl mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 sm:p-4 rounded-lg shadow-md gap-3 sm:gap-0">
          <div className="text-center sm:text-left">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-1">
              {testDetails?.title || "Test"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Question {index + 1} of {questions.length}
            </p>
          </div>
          <div className="text-center sm:text-right">
            <div
              className={`text-xl sm:text-2xl font-bold ${
                timeLeft < 300 ? "text-red-600 animate-pulse" : "text-blue-600"
              }`}
            >
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Time Remaining</p>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg w-full max-w-4xl flex flex-col">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800 leading-relaxed">
            {q.question}
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {q.options.map((opt, i) => {
              const label = ["A", "B", "C", "D"][i];
              const value = `Option${label}`;
              return (
                <label
                  key={i}
                  className={`block p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer text-base sm:text-lg font-medium transition ${
                    answers[index] === value
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="answer"
                      checked={answers[index] === value}
                      onChange={() => chooseAnswer(value)}
                      className="mr-3 accent-blue-600 transform scale-110 sm:scale-125"
                    />
                    <span className="font-semibold">{label}.</span>
                    <span className="ml-2">{opt}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
          <button
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base flex items-center w-full sm:w-auto justify-center ${
              index === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-600 hover:bg-gray-700 text-white shadow-md"
            }`}
          >
            ⬅ Previous
          </button>

          <div className="flex gap-2 sm:gap-4 order-3 sm:order-2 w-full sm:w-auto justify-center sm:justify-start mt-3 sm:mt-0">
            <button
              onClick={handleSubmit}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl shadow-lg transition flex-1 sm:flex-none"
            >
              Submit Test
            </button>
          </div>

          <button
            onClick={() => setIndex(index + 1)}
            disabled={index === questions.length - 1}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base flex items-center w-full sm:w-auto justify-center ${
              index === questions.length - 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            }`}
          >
            Next ➜
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 sm:mt-6">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            <span>Progress</span>
            <span>
              {index + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div
              className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default StartTest;
