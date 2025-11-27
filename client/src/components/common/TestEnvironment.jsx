// src/components/test/TestEnvironment.jsx
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  BookOpen,
  FileText,
  Download,
  X,
  CheckCircle,
  ListChecks,
} from "lucide-react";

const TestEnvironment = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const serverURL = import.meta.env.VITE_BACKEND_URL;

  const [testData, setTestData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [programMode, setProgramMode] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");
  const [started, setStarted] = useState(false); // Track test start

  // ----------------------- Fullscreen Functions -----------------------
  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  };

  // ----------------------- Fetch Test Data -----------------------
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${serverURL}/api/test/single/${testId}`);
        if (!res.ok) throw new Error(`Failed to fetch test: ${res.status}`);
        const data = await res.json();

        setTestData(data);
        setTimeLeft((data.duration || 30) * 60);

        if (data.files && data.files.length > 0) {
          await processExcelFile(data.files[0]);
        } else {
          throw new Error("No Excel file found in test data");
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  // ----------------------- Process Excel -----------------------
  const processExcelFile = async (fileData) => {
    try {
      if (!fileData || !fileData.filename) throw new Error("Invalid file data");

      const res = await fetch(`${serverURL}/uploadTest/${fileData.filename}`);
      if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);

      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const formatted = json
        .map((row, index) => ({
          id: index + 1,
          question: row.Questions || row.question || `Question ${index + 1}`,
          options: [row.OptionA, row.OptionB, row.OptionC, row.OptionD]
            .map((opt) =>
              opt !== undefined && opt !== null ? String(opt) : ""
            )
            .filter((opt) => opt.trim() !== ""),
          correct: parseInt(row.CorrectAnswer || row.correctAnswer || 0),
          explanation: row.Explanation || "",
          type: row.Type || "MCQ",
        }))
        .filter((q) => q.options.length >= 2);

      setQuestions(formatted);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // ----------------------- Timer -----------------------
  useEffect(() => {
    if (!started || loading || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, loading, timeLeft]);

  // ----------------------- Handle Answer Selection -----------------------
  const handleSelect = (qIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleNext = () => setCurrentQuestion((prev) => prev + 1);
  const handlePrev = () => setCurrentQuestion((prev) => prev - 1);
  const goToQuestion = (index) => setCurrentQuestion(index);

  // ----------------------- Submit Test -----------------------
  const handleSubmit = () => {
    let score = 0;

    const results = questions.map((q, i) => {
      const isCorrect = selectedAnswers[i] === q.correct;
      if (isCorrect) score++;
      return {
        question: q.question,
        userAnswer:
          selectedAnswers[i] !== undefined
            ? q.options[selectedAnswers[i]]
            : "Not answered",
        correctAnswer: q.options[q.correct],
        isCorrect,
        explanation: q.explanation,
      };
    });

    const result = {
      testId,
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      attempted: Object.keys(selectedAnswers).length,
      skipped: questions.length - Object.keys(selectedAnswers).length,
      results,
      submittedAt: new Date().toISOString(),
    };

    setTestResult(result);
    setShowResultModal(true);

    toast.success(
      `Test Submitted Successfully! Score: ${score}/${questions.length}`
    );
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    exitFullScreen();
    navigate("/");
  };

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const toProperCase = (str) =>
    str
      ? str
          .toLowerCase()
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "";

  const attemptedCount = Object.keys(selectedAnswers).length;
  const skippedCount = questions.length - attemptedCount;
  const percentage = attemptedCount
    ? Math.round((attemptedCount / questions.length) * 100)
    : 0;

  // ----------------------- Start Test Handler -----------------------
  const handleStartTest = () => {
    setStarted(true);
    enterFullScreen();
  };

  // ----------------------- Loading & Error -----------------------
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  if (!started) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
        <BookOpen className="w-16 h-16 text-blue-600 mb-4" />

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {toProperCase(testData.testTitle)}
        </h2>

        <p className="text-lg text-gray-600 mb-6">
          Topic: {toProperCase(testData.topic)}
        </p>

        <button
          onClick={handleStartTest}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg 
        font-medium hover:bg-blue-700 transition"
        >
          Start Test
        </button>
      </div>
    );
  }

  // ----------------------- Main Test UI -----------------------
  const currentQ = questions[currentQuestion];
  // if (!started) {
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 text-sm z-9999">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-2.5 bg-white border-b shadow-sm">
        <div className="flex space-x-3 min-w-0">
          <BookOpen className="w-10 h-10 text-blue-600" />
          <div className="min-w-0">
            <h4 className="text-[13px] font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] hover:text-blue-700 transition-colors">
              {toProperCase(testData.testTitle)}
            </h4>
            <p className="text-2xl sm:text-3xl font-semibold text-blue-600 leading-tight">
              {toProperCase(testData.topic)}
            </p>
          </div>
        </div>
        <div className="flex items-center px-3 py-1.5 rounded-md bg-green-50 border border-green-200">
          <Clock className="w-5 h-5 text-green-700" />
          <span className="ml-1 text-[20px] mx-2 font-medium text-green-700">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto space-y-6">
          {/* Stats Panel */}
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-700 flex items-center space-x-2">
              <ListChecks className="w-5 h-5 text-blue-600" /> Test Stats
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Questions</span>
                <span className="font-semibold text-gray-900">
                  {questions.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Attempted</span>
                <span className="font-semibold text-green-600 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" /> {attemptedCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Skipped</span>
                <span className="font-semibold text-red-600">
                  {skippedCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Progress %</span>
                <span className="font-semibold text-purple-600">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Question Navigation */}
            <h5 className="font-medium mb-2 flex items-center space-x-2 text-[12px]">
              <FileText className="w-4 h-4" /> All Questions
            </h5>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToQuestion(i)}
                  className={`w-9 h-9 rounded text-xs font-semibold border ${
                    currentQuestion === i
                      ? "bg-blue-600 text-white border-blue-600"
                      : selectedAnswers[i] !== undefined
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="mt-5 w-full py-2 bg-green-600 text-white rounded text-sm flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4 mx-2" /> Submit Test
            </button>
          </div>

          {/* Questions */}
        </div>

        {/* Question Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <div className="mb-5 pb-4 border-b">
              <h6 className="text-[13px] font-medium text-gray-600 mb-2">
                Question {currentQuestion + 1} of {questions.length}
              </h6>
              <p className="text-[25px] font-medium text-gray-800 leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {currentQ.options.map((opt, idx) => (
                <label
                  key={idx}
                  className={`p-3 border rounded-md flex space-x-3 cursor-pointer text-[20px] ${
                    selectedAnswers[currentQuestion] === idx
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    checked={selectedAnswers[currentQuestion] === idx}
                    onChange={() => handleSelect(currentQuestion, idx)}
                    className="w-3.5 h-3.5"
                  />
                  <span className="leading-snug mx-3">{opt}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className="px-3 py-1.5 bg-blue-600 text-sm text-white rounded disabled:opacity-50"
              >
                <ChevronLeft className="inline w-4 h-4" /> Previous
              </button>

              <button
                onClick={handleNext}
                disabled={currentQuestion === questions.length - 1}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded disabled:opacity-50"
              >
                Next <ChevronRight className="inline w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResultModal && testResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-lg p-6 relative animate-fadeIn">
            <button
              onClick={closeResultModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Test Result
            </h2>

            {/* Suggestion Message */}
            {testResult.percentage < 85 ? (
              <p className="text-sm text-red-600 mb-4 font-medium">
                {testResult.percentage < 50
                  ? "You need to work harder!"
                  : testResult.percentage < 70
                  ? "Keep practicing to improve!"
                  : "Good job, but there's room for improvement!"}
              </p>
            ) : (
              <p className="text-sm text-green-600 mb-4 font-medium">
                Excellent! You're doing great!
              </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm flex flex-col">
                <span className="text-gray-600 text-sm">Total Questions</span>
                <span className="text-xl font-bold text-gray-800">
                  {testResult.totalQuestions}
                </span>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm flex flex-col">
                <span className="text-gray-600 text-sm">Attempted</span>
                <span className="text-xl font-bold text-green-700">
                  {testResult.attempted}
                </span>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm flex flex-col">
                <span className="text-gray-600 text-sm">Skipped</span>
                <span className="text-xl font-bold text-red-600">
                  {testResult.skipped}
                </span>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg shadow-sm flex flex-col">
                <span className="text-gray-600 text-sm">Score %</span>
                <span className="text-xl font-bold text-purple-700">
                  {testResult.percentage}%
                </span>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeResultModal}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// };

export default TestEnvironment;
