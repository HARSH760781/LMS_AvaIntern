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
  Play,
  ChevronUp,
  ChevronDown,
  BarChart3,
} from "lucide-react";

const TestEnvironment = () => {
  const { courseTitle, testId } = useParams();
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
  const [started, setStarted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

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
        const res = await fetch(
          `${serverURL}/api/test/single/${courseTitle}/${testId}`
        );
        if (!res.ok) throw new Error(`Failed to fetch test: ${res.status}`);
        const data = await res.json();
        // console.log("dat->", data);

        setTestData(data);
        setTimeLeft((data.duration || 30) * 60);

        if (data.file) {
          await processExcelFile(data.file);
        } else {
          throw new Error("No Excel file found in test data");
        }
        // console.log("processing.....");

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
      if (!fileData || !fileData.filename) {
        console.warn("No valid Excel file provided. Skipping questions.");
        setQuestions([]);
        return;
      }
      // console.log(fileData);

      const res = await fetch(`${serverURL}/uploadTest/${fileData.filename}`);
      if (!res.ok)
        throw new Error(
          `Failed to fetch file: ${res.status} - ${res.statusText}`
        );

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
      setQuestions([]);
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
  const goToQuestion = (index) => {
    setCurrentQuestion(index);
    // Auto-close sidebar on mobile after selecting a question
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

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
      <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading Quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mb-4" />
        <p className="text-gray-700 mb-4 text-center text-sm sm:text-base">
          {error}
        </p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm sm:text-base"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-white p-4 sm:p-6">
        <div className="text-center max-w-md w-full">
          <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mb-4 mx-auto" />

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            {toProperCase(testData.testTitle)}
          </h2>

          <p className="text-base sm:text-lg text-gray-600 mb-6">
            Topic: {toProperCase(testData.topic)}
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">Test Details:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Duration: {testData.duration || 30} minutes</li>
              <li>• Questions: {questions.length}</li>
              <li>• Fullscreen mode will be enabled</li>
              <li>• Timer will start immediately</li>
            </ul>
          </div>

          <button
            onClick={handleStartTest}
            className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg text-base sm:text-lg 
              font-medium hover:bg-blue-700 transition w-full flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Test
          </button>
        </div>
      </div>
    );
  }

  // ----------------------- Main Test UI -----------------------
  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-3 bg-white border-b shadow-sm">
        <div className="flex items-center space-x-3 mb-3 sm:mb-0">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          <div className="min-w-0">
            <h4 className="text-sm sm:text-[13px] font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-[300px] md:max-w-[400px]">
              {toProperCase(testData.testTitle)}
            </h4>
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-blue-600 leading-tight">
              {toProperCase(testData.topic)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Toggle Sidebar Button - Visible on all screens */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden px-3 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <div className="flex items-center px-3 py-1.5 rounded-md bg-green-50 border border-green-200">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
            <span className="ml-1 text-lg sm:text-[20px] mx-2 font-medium text-green-700">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Sidebar - Now with toggle functionality */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r transform transition-transform duration-300 ease-in-out ${
            showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } lg:block`}
        >
          <div className="h-full flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Test Overview
              </h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {questions.length}
                </div>
                <div className="text-xs text-blue-600 mt-1">Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {attemptedCount}
                </div>
                <div className="text-xs text-green-600 mt-1">Attempted</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-700">
                  {skippedCount}
                </div>
                <div className="text-xs text-red-600 mt-1">Skipped</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {Math.round((attemptedCount / questions.length) * 100)}%
                </div>
                <div className="text-xs text-purple-600 mt-1">Progress</div>
              </div>
            </div>

            {/* Question Navigation */}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                Questions
              </h4>
              <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      currentQuestion === index
                        ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                        : selectedAnswers[index] !== undefined
                        ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="mt-6 w-full py-3 bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-md"
            >
              <Download className="w-4 h-4" />
              Submit Test
            </button>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setShowSidebar(false)}
          ></div>
        )}

        {/* Question Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="bg-white rounded-xl border p-4 sm:p-6 shadow-sm max-w-4xl mx-auto">
            {/* Question Header */}
            <div className="mb-4 sm:mb-5 pb-3 sm:pb-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h6 className="text-xs sm:text-[13px] font-medium text-gray-600">
                  Question {currentQuestion + 1} of {questions.length}
                </h6>
                {/* Toggle Sidebar Button for desktop */}
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="hidden lg:flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  {showSidebar ? "Hide Overview" : "Show Overview"}
                </button>
              </div>
              <p className="text-lg sm:text-xl lg:text-[25px] font-medium text-gray-800 leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {currentQ.options.map((opt, idx) => (
                <label
                  key={idx}
                  className={`p-3 border rounded-md flex items-center space-x-3 cursor-pointer text-base sm:text-lg lg:text-[20px] transition-colors ${
                    selectedAnswers[currentQuestion] === idx
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    checked={selectedAnswers[currentQuestion] === idx}
                    onChange={() => handleSelect(currentQuestion, idx)}
                    className="w-4 h-4 sm:w-3.5 sm:h-3.5"
                  />
                  <span className="leading-snug px-3">{opt}</span>
                </label>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6 sm:mt-8 gap-3">
              <button
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm rounded disabled:opacity-50 flex items-center gap-1 flex-1 sm:flex-none justify-center hover:bg-blue-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>

              {/* Mobile Question Navigation */}
              <div className="lg:hidden flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {currentQuestion + 1}/{questions.length}
                </span>
              </div>

              <button
                onClick={handleNext}
                disabled={currentQuestion === questions.length - 1}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm rounded disabled:opacity-50 flex items-center gap-1 flex-1 sm:flex-none justify-center hover:bg-blue-700 transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResultModal && testResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6 relative animate-fadeIn">
            <button
              onClick={closeResultModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
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
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg shadow-sm flex flex-col">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Total Questions
                </span>
                <span className="text-lg sm:text-xl font-bold text-gray-800">
                  {testResult.totalQuestions}
                </span>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg shadow-sm flex flex-col">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Attempted
                </span>
                <span className="text-lg sm:text-xl font-bold text-green-700">
                  {testResult.attempted}
                </span>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg shadow-sm flex flex-col">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Skipped
                </span>
                <span className="text-lg sm:text-xl font-bold text-red-600">
                  {testResult.skipped}
                </span>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-lg shadow-sm flex flex-col">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Score %
                </span>
                <span className="text-lg sm:text-xl font-bold text-purple-700">
                  {testResult.percentage}%
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeResultModal}
                className="px-4 sm:px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm sm:text-base"
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

export default TestEnvironment;
