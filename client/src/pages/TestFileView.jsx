import React, { useEffect, useState, useMemo } from "react";
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
          topic: row.Topic || row.topic || "General",
          difficulty: row.Difficulty || row.difficulty || "Medium",
          description: getProgramDescription(row.Programs || row.program),
          timeEstimate: getTimeEstimate(row.Difficulty || row.difficulty),
          popularity: Math.floor(Math.random() * 100) + 1,
        }));

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
        "Write a function to reverse a given string without using built-in reverse functions. Consider edge cases like empty strings and special characters.",
      "Fibonacci Series":
        "Generate the Fibonacci sequence up to a given number n. Implement both iterative and recursive approaches.",
      "Palindrome Check":
        "Determine if a given string or number is a palindrome. Consider case sensitivity and special characters.",
      "Binary Search":
        "Implement binary search algorithm to find an element in a sorted array. Handle edge cases and analyze time complexity.",
      "Sort Array":
        "Implement various sorting algorithms like bubble sort, quicksort, or mergesort with optimization techniques.",
      "Linked List":
        "Create and manipulate linked list data structure with operations like insertion, deletion, and traversal.",
      "Tree Traversal":
        "Implement different tree traversal methods: inorder, preorder, and postorder using both recursive and iterative approaches.",
    };
    return (
      descriptions[program] ||
      `Implement a solution for: ${program}. This problem tests your understanding of fundamental programming concepts and problem-solving skills.`
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
        return matchesDifficulty && matchesSearch;
      });

      if (filteredQuestions.length > 0) {
        filtered[topic] = filteredQuestions;
      }
    });
    return filtered;
  }, [groupedQuestions, difficultyFilter, topicFilter, searchTerm]);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: "bg-green-100 text-green-800 border-green-200",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Hard: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getTopicColor = (topic) => {
    const colors = {
      Arrays: "bg-blue-100 text-blue-800 border-blue-200",
      Strings: "bg-purple-100 text-purple-800 border-purple-200",
      Algorithms: "bg-orange-100 text-orange-800 border-orange-200",
      "Data Structures": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Dynamic Programming": "bg-pink-100 text-pink-800 border-pink-200",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-500"></div>
            <Sparkles className="w-6 h-6 text-blue-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">
            Loading Assessment Questions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Course</span>
              </button>
              <div className="w-px h-8 bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Programming Assessment
                </h1>
                <p className="text-gray-600 mt-1">
                  Master your skills with curated programming challenges
                </p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="flex-1 max-w-xs ml-6">
              <p className="text-gray-700 text-sm mb-1">
                Overall Progress: {completedCount}/{totalQuestions} completed
              </p>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-4 bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${totalProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Problems</p>
                  <p className="text-2xl font-bold mt-1">{totalQuestions}</p>
                </div>
                <Target className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Easy</p>
                  <p className="text-2xl font-bold mt-1">
                    {difficultyStats.Easy}
                  </p>
                </div>
                <Sparkles className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Medium</p>
                  <p className="text-2xl font-bold mt-1">
                    {difficultyStats.Medium}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Hard</p>
                  <p className="text-2xl font-bold mt-1">
                    {difficultyStats.Hard}
                  </p>
                </div>
                <Shield className="w-8 h-8 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search problems or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
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
              </div>

              {/* Topic Filter */}
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-gray-400" />
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
        </div>

        {/* Questions Accordion */}
        <div className="space-y-4">
          {Object.keys(filteredGroupedQuestions).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No problems found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            Object.keys(filteredGroupedQuestions).map((topic, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Topic Header */}
                <button
                  onClick={() =>
                    setOpenAccordion(openAccordion === idx ? null : idx)
                  }
                  className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {topic}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {filteredGroupedQuestions[topic].length} problems •
                        Click to {openAccordion === idx ? "collapse" : "expand"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
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
                    <div className="p-6 space-y-4">
                      {filteredGroupedQuestions[topic].map((question) => (
                        <div
                          key={question.id}
                          className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 overflow-hidden"
                        >
                          {/* Question Header */}
                          <button
                            onClick={() => toggleQuestion(question.id)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                {question.id}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {question.program}
                                  </h3>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                                      question.difficulty
                                    )}`}
                                  >
                                    {question.difficulty}
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getTopicColor(
                                      question.topic
                                    )}`}
                                  >
                                    {question.topic}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {expandedQuestions[question.id]
                                    ? question.description
                                    : question.description.slice(0, 120) +
                                      (question.description.length > 120
                                        ? "..."
                                        : "")}
                                </p>
                                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{question.timeEstimate}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-3 h-3" />
                                    <span>{question.popularity}% solved</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                              {expandedQuestions[question.id] ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </button>

                          {/* Expanded Content */}
                          {expandedQuestions[question.id] && (
                            <div className="border-t border-gray-200 bg-gray-50 p-6">
                              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                    Problem Statement
                                  </h4>
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                      {question.description}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Mark as Completed */}
                              <div className="mt-3 flex items-center justify-end">
                                <button
                                  onClick={() => toggleCompletion(question.id)}
                                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    completedQuestions[question.id]
                                      ? "bg-green-500 text-white hover:bg-green-600"
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  }`}
                                >
                                  {completedQuestions[question.id]
                                    ? "Completed"
                                    : "Mark as Completed"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
