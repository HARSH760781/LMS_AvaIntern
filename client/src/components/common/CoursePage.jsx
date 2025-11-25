import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  FolderOpen,
  BookOpen,
  ArrowLeft,
  Play,
  Clock,
  BarChart3,
  Target,
  Sparkles,
  Search,
  Filter,
  Users,
} from "lucide-react";

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────
export default function CoursePage() {
  const { courseTitle } = useParams();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTopicIndex, setOpenTopicIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("materials");

  const serverURL = import.meta.env.VITE_BACKEND_URL;

  // Convert slug → Title Case
  const prettyTitle = (str) =>
    str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // ─────────────────────────────────────────
  // FETCH LEARNING MATERIAL + TESTS
  // ─────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch topics
        const res = await fetch(
          `${serverURL}/api/learning-material?courseTitle=${courseTitle}`
        );
        const data = await res.json();

        const course = data?.find(
          (c) => c.courseTitle?.toLowerCase() === courseTitle.toLowerCase()
        );

        setTopics(course?.topics || []);

        // Fetch tests
        const testRes = await fetch(
          `${serverURL}/api/test/testuploads?courseTitle=${courseTitle}`
        );
        const testData = await testRes.json();

        setTests(testData || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseTitle]);

  // ─────────────────────────────────────────
  // START TEST HANDLER
  // ─────────────────────────────────────────
  const handleStartTest = (test) => {
    navigate(`/test/start/${test._id}`);
  };

  // ─────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-500"></div>
            <Sparkles className="w-6 h-6 text-blue-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">
            Loading Course Content
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // NO CONTENT
  // ─────────────────────────────────────────
  if (topics.length === 0 && tests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Content Available
          </h2>
          <p className="text-gray-600 mb-6">
            No learning materials or tests found for{" "}
            <strong>{prettyTitle(courseTitle)}</strong>
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div className="w-1 h-8 bg-gray-200 rounded-full"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {prettyTitle(courseTitle)}
                </h1>
                <p className="text-gray-600 mt-1">
                  Master your skills with comprehensive learning materials and
                  assessments
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <FolderOpen className="w-4 h-4" />
                  <span>{topics.length} Topics</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{tests.length} Tests</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Materials</p>
                  <p className="text-2xl font-bold mt-1">
                    {topics.reduce(
                      (acc, topic) => acc + (topic.subTopics?.length || 0),
                      0
                    )}
                  </p>
                </div>
                <FileText className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Available Tests</p>
                  <p className="text-2xl font-bold mt-1">{tests.length}</p>
                </div>
                <Target className="w-8 h-8 opacity-80" />
              </div>
            </div>

            {/* <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Duration</p>
                  <p className="text-2xl font-bold mt-1">
                    {tests.reduce((acc, test) => acc + (test.duration || 0), 0)}{" "}
                    min
                  </p>
                </div>
                <Clock className="w-8 h-8 opacity-80" />
              </div>
            </div> */}

            {/* <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Questions</p>
                  <p className="text-2xl font-bold mt-1">
                    {tests.reduce(
                      (acc, test) => acc + (test.totalQuestions || 0),
                      0
                    )}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 opacity-80" />
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-2xl p-2 shadow-sm border border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("materials")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "materials"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            <span>Learning Materials</span>
          </button>
          <button
            onClick={() => setActiveTab("tests")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "tests"
                ? "bg-green-600 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Assessment Tests</span>
            {tests.length > 0 && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {tests.length}
              </span>
            )}
          </button>
        </div>

        {/* Materials Tab */}
        {activeTab === "materials" && (
          <div className="space-y-4">
            {topics.map((topic, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <button
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                  onClick={() =>
                    setOpenTopicIndex(openTopicIndex === idx ? null : idx)
                  }
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {topic.topicTitle}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {topic.subTopics?.length || 0} sub-topics • Click to
                        expand
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {openTopicIndex === idx ? "Collapse" : "Expand"}
                    </span>
                    {openTopicIndex === idx ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {openTopicIndex === idx && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-6 space-y-4">
                      {topic.subTopics?.map((sub, subIdx) => (
                        <div
                          key={subIdx}
                          className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 transition-all duration-200"
                        >
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <FileText className="w-5 h-5 text-blue-600 mr-3" />
                            {sub.subTopicTitle}
                          </h4>

                          {sub.materials?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {sub.materials.map((material, mIdx) => (
                                <a
                                  key={mIdx}
                                  href={material.filePath}
                                  download
                                  className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200"
                                >
                                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 group-hover:text-blue-900 truncate font-medium">
                                      {material.fileName ||
                                        `Material ${mIdx + 1}`}
                                    </span>
                                  </div>
                                  <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500 text-sm">
                                No materials available for this sub-topic
                              </p>
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

        {/* Tests Tab */}
        {activeTab === "tests" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    {/* <div className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full capitalize">
                      {test.difficultyLevel}
                    </div> */}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {test.testTitle}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {test.testDescription}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Topic</span>
                      <span className="font-medium text-gray-900">
                        {test.topic}
                      </span>
                    </div>
                    {/* <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Questions</span>
                      <span className="font-medium text-gray-900">
                        {test.totalQuestions}
                      </span>
                    </div> */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Duration</span>
                      <span className="font-medium text-gray-900">
                        {test.duration} min
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartTest(test)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2 group-hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty States */}
        {activeTab === "materials" && topics.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Learning Materials
            </h3>
            <p className="text-gray-600">
              No study materials available for this course yet.
            </p>
          </div>
        )}

        {activeTab === "tests" && tests.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Tests Available
            </h3>
            <p className="text-gray-600">
              No assessment tests available for this course yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
