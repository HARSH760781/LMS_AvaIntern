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

  const [completedMaterials, setCompletedMaterials] = useState({});
  const [topics, setTopics] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTopicIndex, setOpenTopicIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("materials");
  const [currentMaterial, setCurrentMaterial] = useState(null);

  const serverURL = import.meta.env.VITE_BACKEND_URL;

  const prettyTitle = (str = "") =>
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
          (c) => c.courseTitle?.toLowerCase() === courseTitle?.toLowerCase()
        );
        setTopics(course?.topics || []);

        const testRes = await fetch(
          `${serverURL}/api/test/testuploads?courseTitle=${courseTitle}`
        );
        const testData = await testRes.json();
        // console.log(testData);

        setTests(testData || []);
      } catch (err) {
        console.error("CoursePage fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseTitle, serverURL]);

  const handleStartTest = (test) => {
    navigate(`/test/${courseTitle}/${test._id}`);
  };

  const handlePdfView = (material) => {
    // console.log(material);
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

  // clamp-based sizes
  const styles = {
    pageTitle: { fontSize: "clamp(1.25rem, 2.6vw, 2rem)" },
    subTitle: { fontSize: "clamp(0.9rem, 1.6vw, 1.125rem)" },
    sectionTitle: { fontSize: "clamp(1rem, 1.8vw, 1.25rem)" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-full h-full rounded-full border-4 border-blue-100 animate-spin border-t-blue-500" />
            <Sparkles className="absolute -top-1 -right-1 text-blue-500" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">
            Loading Course Content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start md:items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
                <span style={styles.subTitle} className="font-medium">
                  Back
                </span>
              </button>

              <div>
                <h1
                  style={styles.pageTitle}
                  className="text-gray-900 font-bold leading-tight"
                >
                  {prettyTitle(courseTitle)}
                </h1>
                <p style={styles.subTitle} className="text-gray-600 mt-1">
                  Master your skills with comprehensive learning materials and
                  assessments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-sm">{topics.length} Topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">{tests.length} Tests</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Responsive Stats cards */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Materials Card */}
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    Total Materials
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">
                    {totalMaterials}
                  </p>
                </div>
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 opacity-80 flex-shrink-0" />
              </div>
            </div>

            {/* Available Tests Card */}
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white bg-gradient-to-r from-green-500 to-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">
                    Available Tests
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">
                    {tests.length}
                  </p>
                </div>
                <Target className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 opacity-80 flex-shrink-0" />
              </div>
            </div>

            {/* Progress Card */}
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white bg-gradient-to-r from-purple-500 to-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm">
                    Your Progress
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">
                    {progressPercent}%
                  </p>
                </div>
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 opacity-80 flex-shrink-0" />
              </div>

              <div
                className="w-full bg-purple-300 h-1.5 sm:h-2 rounded-full mt-2 sm:mt-3"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-1.5 sm:h-2 rounded-full bg-white transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Completed Materials Card */}
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white bg-gradient-to-r from-yellow-500 to-yellow-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs sm:text-sm">
                    Completed Materials
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">
                    {completedCount}
                  </p>
                </div>
                <Target className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 opacity-80 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content area */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm border border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("materials")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === "materials"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
            aria-pressed={activeTab === "materials"}
          >
            <FolderOpen className="w-4 h-4" />
            <span className="text-sm">Learning Materials</span>
          </button>

          <button
            onClick={() => setActiveTab("tests")}
            className={`flex items-center gap-2 px-1 py-2 rounded-xl font-medium transition ${
              activeTab === "tests"
                ? "bg-green-600 text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
            aria-pressed={activeTab === "tests"}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">Assessment Tests</span>
            {tests.length > 0 && (
              <span className="ml-2 inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                {tests.length}
              </span>
            )}
          </button>
        </div>

        {/* Materials */}
        {activeTab === "materials" && (
          <div className="space-y-4">
            {topics.map((topic, idx) => (
              <section
                key={idx}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Topic Header - Mobile Optimized */}
                <header>
                  <button
                    className="w-full flex justify-between items-center p-3 sm:p-4 md:p-6 text-left hover:bg-gray-50 transition active:bg-gray-100"
                    onClick={() =>
                      setOpenTopicIndex(openTopicIndex === idx ? null : idx)
                    }
                    aria-expanded={openTopicIndex === idx}
                  >
                    {/* Left side - Topic info */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* Icon - Responsive sizing */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow flex-shrink-0">
                        <FolderOpen className="w-4 h-4 sm:w-5 sm:h-6 text-white" />
                      </div>

                      {/* Text content */}
                      <div className="flex-1 min-w-0">
                        <h6 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg truncate">
                          {topic.topicTitle}
                        </h6>
                        <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
                          {topic.subTopics?.length || 0} sub-topics • Tap to{" "}
                          {openTopicIndex === idx ? "collapse" : "expand"}
                        </p>
                      </div>
                    </div>

                    {/* Right side - Collapse/Expand indicator */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                      {/* Hide text on small screens */}
                      <span className="hidden sm:inline text-sm text-gray-500">
                        {openTopicIndex === idx ? "Collapse" : "Expand"}
                      </span>
                      {openTopicIndex === idx ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                </header>

                {/* Sub-topics - Mobile Optimized */}
                {openTopicIndex === idx && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
                      {topic.subTopics?.map((sub, subIdx) => (
                        <div
                          key={subIdx}
                          className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 md:p-5"
                        >
                          {/* Sub-topic Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                            <h6 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
                              <FileText className="w-4 h-4 flex-shrink-0" />
                              <span className="line-clamp-1 sm:line-clamp-2">
                                {sub.subTopicTitle}
                              </span>
                            </h6>
                            <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full self-start sm:self-auto">
                              {sub.materials?.length || 0} materials
                            </div>
                          </div>

                          {sub.materials?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              {sub.materials.map((material, mIdx) => (
                                <article
                                  key={mIdx}
                                  className={`flex flex-col h-full rounded-lg sm:rounded-xl border transition-all ${
                                    completedMaterials[material._id]
                                      ? "bg-green-50 border-green-300"
                                      : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                                  }`}
                                >
                                  {/* Content area - Mobile optimized */}
                                  <div className="p-3 sm:p-4 flex-1">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                      <FileText
                                        className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${
                                          completedMaterials[material._id]
                                            ? "text-green-600"
                                            : "text-gray-400"
                                        }`}
                                      />
                                      <div className="flex-1 min-w-0">
                                        {/* File name - Responsive truncation */}
                                        <h6 className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                                          {material.fileName ||
                                            `Material ${mIdx + 1}`}
                                        </h6>
                                        {/* File info - Stack on mobile */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mt-1">
                                          <p className="text-gray-600 text-xs">
                                            Size:{" "}
                                            {material.fileSize
                                              ? `${(
                                                  material.fileSize / 1024
                                                ).toFixed(2)} KB`
                                              : "—"}
                                          </p>
                                          {completedMaterials[material._id] && (
                                            <span className="text-xs text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full self-start sm:self-auto">
                                              Completed
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action buttons - Stack on mobile */}
                                  <div className="p-3 sm:p-4 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                    <button
                                      onClick={() => handlePdfView(material)}
                                      className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-xs sm:text-sm active:scale-95"
                                    >
                                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span>Open PDF</span>
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleCompleteMaterial(material._id)
                                      }
                                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-xs sm:text-sm ${
                                        completedMaterials[material._id]
                                          ? "bg-green-600 text-white hover:bg-green-700"
                                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                      } active:scale-95`}
                                    >
                                      {completedMaterials[material._id]
                                        ? "✓ Completed"
                                        : "Mark Complete"}
                                    </button>
                                  </div>
                                </article>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-2" />
                              <p>No materials available for this sub-topic</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test, idx) => (
                  <article
                    key={idx}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition flex flex-col h-full"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {test.testTitle}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                        {test.testDescription}
                      </p>

                      <div className="space-y-3 mb-4 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Topic</span>
                          <span className="font-medium text-gray-900">
                            {test.topic}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span>Duration</span>
                          <span className="font-medium text-gray-900">
                            {test.duration} min
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <button
                          onClick={() => handleStartTest(test)}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold transition hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start Test</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pdf Viewer overlay */}
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
