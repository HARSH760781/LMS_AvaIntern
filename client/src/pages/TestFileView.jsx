import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Filter,
  Search,
  Clock,
  BarChart3,
  Users,
  Target,
  Sparkles,
  FileText,
  Shield,
  Menu,
  X,
  CheckCircle,
  Circle,
  RefreshCw,
  Download,
  Maximize2,
  Minimize2,
  Info,
  TrendingUp,
  Hash,
  Calendar,
  Eye,
  EyeOff,
  MoreVertical,
  Grid,
  List,
} from "lucide-react";

export default function TestFileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const serverURL = import.meta.env.VITE_BACKEND_URL;

  const [questions, setQuestions] = useState([]);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [openAccordion, setOpenAccordion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [completedQuestions, setCompletedQuestions] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "grid" or "list"
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const containerRef = useRef(null);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle responsive stats
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowStats(false);
      } else {
        setShowStats(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchExcel = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${serverURL}/api/programs/file/${id}`);
        if (!res.ok) throw new Error("Failed to fetch file");

        const fileData = await res.blob();
        const buffer = await fileData.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];

        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const formattedData = data.map((row, index) => ({
          id: index + 1,
          program: row.Programs || row.program || `Program ${index + 1}`,
          topic: row.Topic || row.topic || data[index]?.Course || sheetName,
          difficulty: row.Difficulty || row.difficulty || "Medium",
          description: getProgramDescription(row.Programs || row.program),
          timeEstimate: getTimeEstimate(row.Difficulty || row.difficulty),
          popularity: Math.floor(Math.random() * 100) + 1,
          attempts: Math.floor(Math.random() * 50) + 5,
          lastAttempted: getRandomDate(),
          codeSnippet: generateCodeSnippet(row.Programs || row.program),
        }));
        // console.log(formattedData);

        setQuestions(formattedData);

        const grouped = formattedData.reduce((acc, row) => {
          const topic = row.topic;
          if (!acc[topic]) acc[topic] = [];
          acc[topic].push(row);
          return acc;
        }, {});

        setGroupedQuestions(grouped);
      } catch (err) {
        console.error("Error reading Excel file:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExcel();
  }, [id, serverURL]);

  // Helper functions
  const getProgramDescription = (program) => {
    const descriptions = {
      "Reverse String":
        "Write a function to reverse a given string without using built-in reverse functions. Consider edge cases like empty strings and special characters. Test cases should include: 'hello' → 'olleh', '' → '', 'racecar' → 'racecar'.",
      "Fibonacci Series":
        "Generate the Fibonacci sequence up to a given number n. Implement both iterative and recursive approaches. Analyze time complexity for both methods and discuss optimization techniques.",
      "Palindrome Check":
        "Determine if a given string or number is a palindrome. Consider case sensitivity and special characters. Optimize your solution for time and space complexity.",
      "Binary Search":
        "Implement binary search algorithm to find an element in a sorted array. Handle edge cases and analyze time complexity. Extend to find first and last occurrence.",
      "Sort Array":
        "Implement various sorting algorithms like bubble sort, quicksort, or mergesort with optimization techniques. Compare their time and space complexities.",
      "Linked List":
        "Create and manipulate linked list data structure with operations like insertion, deletion, and traversal. Implement cycle detection and reversal.",
      "Tree Traversal":
        "Implement different tree traversal methods: inorder, preorder, and postorder using both recursive and iterative approaches. Handle binary trees and n-ary trees.",
    };
    return (
      descriptions[program] ||
      `Implement a solution for: ${program}. This problem tests your understanding of fundamental programming concepts and problem-solving skills. Write clean, efficient, and well-documented code.`
    );
  };

  const getTimeEstimate = (difficulty) => {
    const times = {
      Easy: "5-7 minutes",
      Medium: "10-15 minutes",
      Hard: "15-30 minutes",
    };
    return times[difficulty] || "10 minutes";
  };

  const getRandomDate = () => {
    const dates = ["Today", "Yesterday", "3 days ago", "1 week ago"];
    return dates[Math.floor(Math.random() * dates.length)];
  };

  const generateCodeSnippet = (program) => {
    const snippets = {
      "Reverse String": `function reverseString(str) {
  let reversed = '';
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}`,
      "Fibonacci Series": `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}`,
      "Palindrome Check": `function isPalindrome(str) {
  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanStr === cleanStr.split('').reverse().join('');
}`,
      "Binary Search": `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    };
    return (
      snippets[program] ||
      "// Write your solution here\n// Start by understanding the problem requirements"
    );
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const toggleCompletion = (questionId) => {
    setCompletedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Filtering logic
  const filteredGroupedQuestions = useMemo(() => {
    const filtered = {};
    Object.keys(groupedQuestions).forEach((topic) => {
      if (topicFilter !== "all" && topic !== topicFilter) return;

      const filteredQuestions = groupedQuestions[topic].filter((q) => {
        const matchesDifficulty =
          difficultyFilter === "all" || q.difficulty === difficultyFilter;
        const matchesSearch =
          searchTerm === "" ||
          q.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.topic.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab =
          activeTab === "all" ||
          (activeTab === "completed" && completedQuestions[q.id]) ||
          (activeTab === "pending" && !completedQuestions[q.id]);
        return matchesDifficulty && matchesSearch && matchesTab;
      });

      if (filteredQuestions.length > 0) {
        filtered[topic] = filteredQuestions;
      }
    });
    return filtered;
  }, [
    groupedQuestions,
    difficultyFilter,
    topicFilter,
    searchTerm,
    activeTab,
    completedQuestions,
  ]);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200",
      Medium:
        "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-200",
      Hard: "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getTopicColor = (topic) => {
    const colors = {
      Arrays:
        "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200",
      Strings:
        "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border-purple-200",
      Algorithms:
        "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border-orange-200",
      "Data Structures":
        "bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-800 border-indigo-200",
      "Dynamic Programming":
        "bg-gradient-to-r from-pink-100 to-pink-50 text-pink-800 border-pink-200",
    };
    return colors[topic] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const uniqueTopics = [...new Set(questions.map((q) => q.topic))];
  const totalQuestions = questions.length;
  const difficultyStats = {
    Easy: questions.filter((q) => q.difficulty === "Easy").length,
    Medium: questions.filter((q) => q.difficulty === "Medium").length,
    Hard: questions.filter((q) => q.difficulty === "Hard").length,
  };
  const completedCount =
    Object.values(completedQuestions).filter(Boolean).length;
  const totalProgress =
    totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Animated Header Skeleton */}
        <div className="bg-white border-b border-gray-200 shadow-sm animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded-lg w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-96"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 sm:h-28 bg-gray-200 rounded-xl"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Filters Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          {/* Questions Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
              >
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    >
      {/* Sticky Header */}
      <header className="sticky top-0  bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Top Bar */}
          <div className="flex items-center justify-between py-4 lg:hidden">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 truncate max-w-[150px]">
                Programming Assessment
              </h1>
              <Hash className="w-4 h-4 text-blue-500" />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Toggle filters"
              >
                {mobileFiltersOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Filter className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl font-medium group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span>Back</span>
                </button>
                <div className="w-px h-8 bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Programming Assessment
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm lg:text-base">
                    Master your skills with curated programming challenges
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">View:</span>
                  <button
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "list" : "grid")
                    }
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label={`Switch to ${
                      viewMode === "grid" ? "list" : "grid"
                    } view`}
                  >
                    {viewMode === "grid" ? (
                      <List className="w-5 h-5" />
                    ) : (
                      <Grid className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Toggle fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar - Mobile */}
          <div className="lg:hidden px-4 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {completedCount}/{totalQuestions} completed
              </span>
              <span className="text-sm font-bold text-blue-600">
                {Math.round(totalProgress)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Filters Overlay */}
      {mobileFiltersOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Problems
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["all", "Easy", "Medium", "Hard"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficultyFilter(level)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        difficultyFilter === level
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {level === "all" ? "All" : level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic
                </label>
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Topics</option>
                  {uniqueTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Tabs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "completed"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "pending"
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Desktop Stats Cards */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total Problems
                </p>
                <p className="text-3xl font-bold mt-2">{totalQuestions}</p>
                <p className="text-blue-200 text-xs mt-1">Across all topics</p>
              </div>
              <Target className="w-10 h-10 opacity-90" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Easy</p>
                <p className="text-3xl font-bold mt-2">
                  {difficultyStats.Easy}
                </p>
                <p className="text-green-200 text-xs mt-1">Beginner friendly</p>
              </div>
              <Sparkles className="w-10 h-10 opacity-90" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Medium</p>
                <p className="text-3xl font-bold mt-2">
                  {difficultyStats.Medium}
                </p>
                <p className="text-yellow-200 text-xs mt-1">
                  Intermediate level
                </p>
              </div>
              <BarChart3 className="w-10 h-10 opacity-90" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Hard</p>
                <p className="text-3xl font-bold mt-2">
                  {difficultyStats.Hard}
                </p>
                <p className="text-red-200 text-xs mt-1">Advanced challenges</p>
              </div>
              <Shield className="w-10 h-10 opacity-90" />
            </div>
          </div>
        </div>

        {/* Mobile Stats Cards */}
        <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-100">Total</p>
                <p className="text-xl font-bold mt-1">{totalQuestions}</p>
              </div>
              <Target className="w-6 h-6 opacity-90" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-100">Completed</p>
                <p className="text-xl font-bold mt-1">{completedCount}</p>
              </div>
              <CheckCircle className="w-6 h-6 opacity-90" />
            </div>
          </div>
        </div>

        {/* Desktop Filters & Tabs */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Status Tabs */}
            <div className="flex items-center gap-2">
              {["all", "completed", "pending"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? tab === "completed"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : tab === "pending"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab === "all"
                    ? "All Problems"
                    : tab === "completed"
                    ? "Completed"
                    : "Pending"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search problems, topics, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Difficulty Filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {/* Topic Filter */}
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Topics</option>
                {uniqueTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Filter Buttons */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Pending
            </button>
          </div>

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Open filters"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {Object.values(filteredGroupedQuestions).flat().length} Problems
              Found
            </h2>
            <button
              onClick={() => {
                setSearchTerm("");
                setDifficultyFilter("all");
                setTopicFilter("all");
                setActiveTab("all");
              }}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Questions Display - Grid/List View */}
        {Object.keys(filteredGroupedQuestions).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No problems found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setDifficultyFilter("all");
                setTopicFilter("all");
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(filteredGroupedQuestions)
              .flat()
              .map((question) => (
                <div
                  key={question.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {question.id}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                              question.difficulty
                            )}`}
                          >
                            {question.difficulty}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {question.program}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${getTopicColor(
                              question.topic
                            )}`}
                          >
                            {question.topic}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCompletion(question.id)}
                        className="flex-shrink-0"
                        aria-label={
                          completedQuestions[question.id]
                            ? "Mark as incomplete"
                            : "Mark as complete"
                        }
                      >
                        {completedQuestions[question.id] ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300 hover:text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {question.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{question.timeEstimate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{question.popularity}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{question.attempts} attempts</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => toggleQuestion(question.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        {expandedQuestions[question.id]
                          ? "Show Less"
                          : "View Details"}
                        {expandedQuestions[question.id] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      {/* <button
                        onClick={() => setSelectedQuestion(question)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Solve
                      </button> */}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedQuestions[question.id] && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                            Problem Statement
                          </h4>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {question.description}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                            Sample Code
                          </h4>
                          <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 text-sm overflow-x-auto">
                            <code>{question.codeSnippet}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          // List View (Accordion)
          <div className="space-y-4">
            {Object.keys(filteredGroupedQuestions).map((topic, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Topic Header */}
                <button
                  onClick={() =>
                    setOpenAccordion(openAccordion === idx ? null : idx)
                  }
                  className="w-full flex justify-between items-center p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                        {topic}
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        {filteredGroupedQuestions[topic].length} problems
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <span className="text-sm text-gray-500 hidden sm:inline">
                      {openAccordion === idx ? "Collapse" : "Expand"}
                    </span>
                    {openAccordion === idx ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Questions List */}
                {openAccordion === idx && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      {filteredGroupedQuestions[topic].map((question) => (
                        <div
                          key={question.id}
                          className="bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleQuestion(question.id)}
                            className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                  {question.id}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                    {question.program}
                                  </h3>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                      question.difficulty
                                    )}`}
                                  >
                                    {question.difficulty}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-2">
                                  {question.description}
                                </p>
                                <div className="flex items-center space-x-3 sm:space-x-4 mt-2 text-xs sm:text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>{question.timeEstimate}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>{question.popularity}% solved</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2 sm:ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCompletion(question.id);
                                }}
                                className="flex-shrink-0"
                              >
                                {completedQuestions[question.id] ? (
                                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                                ) : (
                                  <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 hover:text-gray-400" />
                                )}
                              </button>
                              {expandedQuestions[question.id] ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </button>

                          {/* Expanded Content */}
                          {expandedQuestions[question.id] && (
                            <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                                    Problem Statement
                                  </h4>
                                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                    <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line leading-relaxed">
                                      {question.description}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                                    Sample Code
                                  </h4>
                                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
                                    <code>{question.codeSnippet}</code>
                                  </pre>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      Last attempted: {question.lastAttempted}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {/* <button
                                      onClick={() =>
                                        setSelectedQuestion(question)
                                      }
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
                                    >
                                      Start Solving
                                    </button> */}
                                    <button
                                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                      aria-label="More options"
                                    >
                                      <MoreVertical className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button - Mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
        >
          {viewMode === "grid" ? (
            <List className="w-6 h-6" />
          ) : (
            <Grid className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedQuestion.program}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                      selectedQuestion.difficulty
                    )}`}
                  >
                    {selectedQuestion.difficulty}
                  </span>
                  <span
                    className={`px-3 py-1 rounded text-sm ${getTopicColor(
                      selectedQuestion.topic
                    )}`}
                  >
                    {selectedQuestion.topic}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Problem Description
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {selectedQuestion.description}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Starter Code
                  </h4>
                  <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto">
                    <code className="text-sm">
                      {selectedQuestion.codeSnippet}
                    </code>
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-700">
                        Time Estimate
                      </span>
                    </div>
                    <p className="text-blue-600">
                      {selectedQuestion.timeEstimate}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-700">
                        Success Rate
                      </span>
                    </div>
                    <p className="text-green-600">
                      {selectedQuestion.popularity}% solved
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleCompletion(selectedQuestion.id)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    completedQuestions[selectedQuestion.id]
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {completedQuestions[selectedQuestion.id]
                    ? "Mark as Incomplete"
                    : "Mark as Complete"}
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      // Handle download/save functionality
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Save
                  </button>
                  {/* <button
                    onClick={() => {
                      // Handle solve/run functionality
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                  >
                    Solve Now
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
