// src/pages/CoursePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  FolderOpen,
  BookOpen,
  ArrowLeft,
  Play,
  Target,
  Sparkles,
} from "lucide-react";
import PdfViewer from "../common/PdfViewer";
import { courseCategories } from "./courseMapping";

export default function LearningEnvironment() {
  const { courseTitle } = useParams();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [completedMaterials, setCompletedMaterials] = useState({});
  const [topics, setTopics] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTopicIndex, setOpenTopicIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("materials");
  const [currentMaterial, setCurrentMaterial] = useState(null);

  const serverURL = import.meta.env.VITE_BACKEND_URL;

  const prettyTitle = (str) =>
    str
      .replace(/-/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch topics (learning materials)
        const res = await fetch(
          `${serverURL}/api/learning-material?courseTitle=${courseTitle}`
        );
        const data = await res.json();
        const course = data?.find(
          (c) => c.courseTitle?.toLowerCase() === courseTitle.toLowerCase()
        );
        setTopics(course?.topics || []);

        // Fetch programming uploads
        const progRes = await fetch(
          `${serverURL}/api/programs?courseTitle=${courseTitle}`
        );
        const progData = await progRes.json();
        const files = progData[0]?.files || [];
        setTests(files);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseTitle, serverURL]);

  const handleStartTest = (test) => {
    navigate(`/test/view/${courseTitle}/${test._id}`);
  };

  const handlePdfView = (material) => {
    if (material?.filePath) setCurrentMaterial(material);
    else alert("File not available.");
  };

  const totalMaterials = topics.reduce(
    (acc, topic) =>
      acc +
      (topic.subTopics?.reduce(
        (subAcc, sub) => subAcc + (sub.materials?.length || 0),
        0
      ) || 0),
    0
  );

  const completedCount =
    Object.values(completedMaterials).filter(Boolean).length;
  const progressPercent =
    totalMaterials === 0
      ? 0
      : Math.round((completedCount / totalMaterials) * 100);

  const handleCompleteMaterial = (id) => {
    setCompletedMaterials((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm mx-auto">
          {/* Animated Container */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            {/* Outer Ring with Gradient */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>

            {/* Spinning Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>

            {/* Pulsing Center Circle */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 animate-pulse"></div>

            {/* Sparkle Icon - Better positioned */}
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            </div>
          </div>

          {/* Loading Text with Typing Animation */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">
              Loading Course Content
            </h3>

            <p className="text-gray-600 text-sm">
              Preparing your learning materials...
            </p>

            {/* Animated Dots */}
            <div className="flex justify-center items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
          </div>

          {/* Optional Progress Bar */}
          <div className="mt-6">
            <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-progress"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Please wait while we set up your course...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (topics.length === 0 && tests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            No Content Available
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            No learning materials or tests found for{" "}
            <strong>{prettyTitle(courseTitle)}</strong>
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg text-sm sm:text-base"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 p-2 sm:p-0"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium text-sm sm:text-base">Back</span>
              </button>
              <div className="w-1 h-6 sm:h-8 bg-gray-200 rounded-full hidden sm:block"></div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {prettyTitle(courseTitle)}
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Master your skills with comprehensive learning materials and
                  assessments
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    Total Materials
                  </p>
                  <p className="text-lg sm:text-2xl font-bold mt-1">
                    {totalMaterials}
                  </p>
                </div>
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">
                    Available Tests
                  </p>
                  <p className="text-lg sm:text-2xl font-bold mt-1">
                    {tests.length}
                  </p>
                </div>
                <Target className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm">
                    Your Progress
                  </p>
                  <p className="text-lg sm:text-2xl font-bold mt-1">
                    {progressPercent}%
                  </p>
                </div>
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
              </div>
              <div className="w-full bg-purple-300 h-1.5 sm:h-2 rounded-full mt-2 sm:mt-3">
                <div
                  className="h-1.5 sm:h-2 rounded-full bg-white transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs sm:text-sm">
                    Completed
                  </p>
                  <p className="text-lg sm:text-2xl font-bold mt-1">
                    {completedCount}
                  </p>
                </div>
                <Target className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-sm border border-gray-200 mb-6 sm:mb-8">
          <button
            onClick={() => setActiveTab("materials")}
            className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 flex-1 sm:flex-none justify-center ${
              activeTab === "materials"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Materials</span>
          </button>
          <button
            onClick={() => setActiveTab("tests")}
            className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 flex-1 sm:flex-none justify-center ${
              activeTab === "tests"
                ? "bg-green-600 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Tests</span>
            {tests.length > 0 && (
              <span className="bg-green-100 text-green-800 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                {tests.length}
              </span>
            )}
          </button>
        </div>

        {/* Materials */}
        {/* {activeTab === "materials" && (
          <div className="space-y-3 sm:space-y-4">
            {topics.map((topic, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <button
                  className="w-full flex justify-between items-center p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                  onClick={() =>
                    setOpenTopicIndex(openTopicIndex === idx ? null : idx)
                  }
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
                        {topic.topicTitle}
                      </h3>
                      <p className="text-gray-600 mt-1 text-xs sm:text-sm">
                        {topic.subTopics?.length || 0} sub-topics • Click to
                        expand
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                    <span className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                      {openTopicIndex === idx ? "Collapse" : "Expand"}
                    </span>
                    {openTopicIndex === idx ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {openTopicIndex === idx && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      {topic.subTopics?.map((sub, subIdx) => (
                        <div
                          key={subIdx}
                          className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-blue-300 transition-all duration-200"
                        >
                          <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3" />
                            {sub.subTopicTitle}
                          </h4>

                          {sub.materials?.length > 0 ? (
                            <div className="space-y-2 sm:space-y-3">
                              {sub.materials.map((material, mIdx) => (
                                <div
                                  key={mIdx}
                                  className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border transition-all duration-200 gap-2 sm:gap-0
                                    ${
                                      completedMaterials[material._id]
                                        ? "bg-green-50 border-green-300"
                                        : "bg-gray-50 hover:bg-blue-50 border-gray-200 hover:border-blue-300"
                                    }
                                  `}
                                >
                                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                    <FileText
                                      className={`w-4 h-4 flex-shrink-0
                                        ${
                                          completedMaterials[material._id]
                                            ? "text-green-600"
                                            : "text-gray-400 group-hover:text-blue-600"
                                        }
                                      `}
                                    />
                                    <span
                                      className={`text-sm truncate font-medium
                                        ${
                                          completedMaterials[material._id]
                                            ? "text-green-800"
                                            : "text-gray-700 group-hover:text-blue-900"
                                        }
                                      `}
                                    >
                                      {material.fileName ||
                                        `Material ${mIdx + 1}`}
                                    </span>
                                    {completedMaterials[material._id] && (
                                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                                        Completed
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                                    <button
                                      onClick={() => handlePdfView(material)}
                                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white font-medium 
                                               rounded-lg sm:rounded-xl shadow hover:bg-blue-700 hover:shadow-md 
                                               active:scale-95 transition-all duration-200 text-xs sm:text-sm"
                                      title="View PDF"
                                    >
                                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span className="hidden xs:inline">
                                        Open PDF
                                      </span>
                                      <span className="xs:hidden">Open</span>
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleCompleteMaterial(material._id)
                                      }
                                      className={`px-2 sm:px-3 py-1 text-xs rounded-lg transition-all duration-200
                                        ${
                                          completedMaterials[material._id]
                                            ? "bg-green-600 text-white hover:bg-green-700"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }
                                      `}
                                    >
                                      {completedMaterials[material._id]
                                        ? "Done"
                                        : "Mark Done"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 sm:py-6">
                              <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                              <p className="text-gray-500 text-xs sm:text-sm">
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
        )} */}

        {activeTab === "materials" && (
          <div>
            {/* Start Learning Card */}
            <div className="flex justify-start mb-6">
              <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 sm:p-8 max-w-md text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                  Start Learning
                </h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Begin your learning journey for {prettyTitle(courseTitle)}
                </p>
                <button
                  onClick={() => navigate(`/learn/${courseTitle}`)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:scale-105"
                >
                  Start Learning
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Tests */}
        {activeTab === "tests" && (
          <>
            {tests.length === 0 ? (
              <div className="w-full py-12 sm:py-20 flex flex-col items-center justify-center bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 text-center">
                  No Files Available
                </h2>
                <p className="text-gray-600 text-center max-w-md text-sm sm:text-base">
                  No programming uploads have been added for this course yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {tests.map((file, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {file.originalName || `File ${idx + 1}`}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                        Size: {(file.fileSize / 1024).toFixed(2)} KB
                      </p>
                      <button
                        onClick={() => handleStartTest(file)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2 group-hover:scale-105 text-sm sm:text-base"
                      >
                        <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Open File</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* PDF Viewer */}
      {currentMaterial && (
        <PdfViewer
          material={currentMaterial}
          onClose={() => setCurrentMaterial(null)}
          serverURL={serverURL}
        />
      )}
    </div>
  );
}
