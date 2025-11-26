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

export default function CoursePage() {
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
    str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${serverURL}/api/learning-material?courseTitle=${courseTitle}`
        );
        const data = await res.json();
        const course = data?.find(
          (c) => c.courseTitle?.toLowerCase() === courseTitle.toLowerCase()
        );
        setTopics(course?.topics || []);

        const testRes = await fetch(
          `${serverURL}/api/test/testuploads?courseTitle=${courseTitle}`
        );
        const testData = await testRes.json();
        setTests(testData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseTitle, serverURL]);

  // In CoursePage.jsx - Update the handleStartTest function
  const handleStartTest = (test) => {
    // console.log("Starting test:", test._id);
    navigate(`/test/start/${test._id}`); // Use the correct route
  };

  const handlePdfView = (material) => {
    if (material?.filePath) setCurrentMaterial(material);
    else alert("File not available.");
    console.log(currentMaterial);
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

  // Count completed
  const completedCount =
    Object.values(completedMaterials).filter(Boolean).length;

  // Calculate percentage
  const progressPercent =
    totalMaterials === 0
      ? 0
      : Math.round((completedCount / totalMaterials) * 100);

  // Mark material completed
  const handleCompleteMaterial = (id) => {
    setCompletedMaterials((prev) => ({
      ...prev,
      [id]: !prev[id], // toggle complete/uncomplete
    }));
  };

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
              <div className="w-1 h-8 m-2  bg-gray-200 rounded-full"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mx-2">
                  {prettyTitle(courseTitle)}
                </h1>
                <p className="text-gray-600 mt-1 mx-2">
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
                      (acc, topic) =>
                        acc +
                        (topic.subTopics?.reduce(
                          (subAcc, sub) =>
                            subAcc + (sub.materials?.length || 0),
                          0
                        ) || 0),
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
            {/* Progress Card */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Your Progress</p>
                  <p className="text-2xl font-bold mt-1">{progressPercent}%</p>
                </div>
                <Sparkles className="w-8 h-8 opacity-80" />
              </div>

              {/* Progress bar */}
              <div className="w-full bg-purple-300 h-2 rounded-full mt-3">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Completed Count */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Completed Materials</p>
                  <p className="text-2xl font-bold mt-1">{completedCount}</p>
                </div>
                <Target className="w-8 h-8 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
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

        {/* Materials */}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                              {sub.materials.map((material, mIdx) => (
                                <div
                                  key={mIdx}
                                  className={`group flex items-center justify-between p-4 rounded-lg border transition-all duration-200
    ${
      completedMaterials[material._id]
        ? "bg-green-50 border-green-300"
        : "bg-gray-50 hover:bg-blue-50 border-gray-200 hover:border-blue-300"
    }
  `}
                                >
                                  <div className="flex items-center space-x-3 min-w-0 flex-1">
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

                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handlePdfView(material)}
                                      className="flex items-center gap-2 px-4 py-2 mx-3 bg-blue-600 text-white font-medium 
             rounded-xl shadow hover:bg-blue-700 hover:shadow-md 
             active:scale-95 transition-all duration-200"
                                      title="View PDF"
                                    >
                                      <FileText className="w-5 h-5" />
                                      Open PDF
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleCompleteMaterial(material._id)
                                      }
                                      className={`px-3 py-1 text-xs rounded-lg transition-all duration-200
        ${
          completedMaterials[material._id]
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }
      `}
                                    >
                                      {completedMaterials[material._id]
                                        ? "Completed"
                                        : "Mark as Completed"}
                                    </button>
                                  </div>
                                </div>
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

        {/* Tests */}
        {activeTab === "tests" && (
          <>
            {tests.length === 0 ? (
              <div className="w-full py-20 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  No Tests Available
                </h2>

                <p className="text-gray-600 text-center max-w-md">
                  No tests have been added for this course yet.
                  <br />
                  <span className="font-semibold text-gray-700">
                    Coming Soon...
                  </span>
                </p>
              </div>
            ) : (
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
