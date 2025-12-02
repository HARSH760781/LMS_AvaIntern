// src/pages/CourseLearnPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FolderOpen,
  FileText,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Clock,
  User,
  Search,
  Menu,
  X,
  Eye,
  CheckCircle,
  Circle,
  BarChart3,
  Bookmark,
  Play,
  Pause,
  Volume2,
  Maximize2,
  ArrowBigRight,
  ArrowUp,
} from "lucide-react";
import PdfViewer from "./PdfViewer";

export default function CourseLearnPage() {
  const { courseTitle } = useParams();
  const serverURL = import.meta.env.VITE_STRAPI_SERVERURL;
  const token = import.meta.env.VITE_STRAPI_TOKEN;

  const [topics, setTopics] = useState([]);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [selectedSubTopicIndex, setSelectedSubTopicIndex] = useState(0);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progress, setProgress] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTopics, setExpandedTopics] = useState(new Set([0]));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(900);

  const prettyTitle = (str) =>
    str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    const mockProgress = {};
    topics.forEach((topic, tIdx) => {
      topic.subTopics?.forEach((sub, sIdx) => {
        mockProgress[`${tIdx}-${sIdx}`] = Math.random() > 0.7;
      });
    });
    setProgress(mockProgress);
  }, [topics]);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${serverURL}/api/courses?populate[Topic][populate][subTopics][populate]=*`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        if (!data?.data || data.data.length === 0) return setTopics([]);

        const urlCourseTitle = courseTitle.trim().toLowerCase();
        const course = data.data.find(
          (c) => c?.courseTitle?.trim().toLowerCase() === urlCourseTitle
        );

        if (!course) return setTopics([]);

        const topicsWithSubTopics = (course.Topic || []).map((topic) => ({
          ...topic,
          subTopics: topic.subTopics || [],
        }));

        setTopics(topicsWithSubTopics);
        setExpandedTopics(new Set([0]));
        setCurrentMaterial(
          topicsWithSubTopics?.[0]?.subTopics?.[0]?.attachments?.[0] || null
        );
      } catch (err) {
        console.error("Error fetching course data:", err);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [courseTitle]);

  const handleSelectTopic = (topicIdx, subTopicIdx = 0) => {
    setSelectedTopicIndex(topicIdx);
    setSelectedSubTopicIndex(subTopicIdx);
    const material =
      topics[topicIdx]?.subTopics?.[subTopicIdx]?.attachments?.[0] || null;
    setCurrentMaterial(material);
    setSidebarOpen(false);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleTopicExpansion = (topicIdx) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicIdx)) newSet.delete(topicIdx);
      else newSet.add(topicIdx);
      return newSet;
    });
  };

  const markAsCompleted = (topicIdx, subTopicIdx) => {
    setProgress((prev) => ({
      ...prev,
      [`${topicIdx}-${subTopicIdx}`]: !prev[`${topicIdx}-${subTopicIdx}`],
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleTimeUpdate = (e) => setCurrentTime(e.target.value);

  const filteredTopics = topics.filter(
    (topic) =>
      topic.topicTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.subTopics?.some((sub) =>
        sub.subTopicTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const totalLessons = topics.reduce(
    (acc, topic) => acc + (topic.subTopics?.length || 0),
    0
  );
  const completedLessons = Object.values(progress).filter(Boolean).length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const renderContent = (content) => {
    if (!content || !Array.isArray(content)) return null;

    const result = [];

    for (let i = 0; i < content.length; i++) {
      const block = content[i];

      // If we encounter a code block
      if (block.type === "code") {
        // Start collecting all sequential code blocks
        const codeBlocks = [];

        while (i < content.length && content[i].type === "code") {
          codeBlocks.push(content[i]);
          i++;
        }

        // We found sequential code blocks - merge them
        if (codeBlocks.length > 0) {
          // Extract text from all code blocks
          const allCodeTexts = codeBlocks
            .map((codeBlock) => {
              // Try multiple ways to extract text
              if (codeBlock.text) {
                return codeBlock.text;
              } else if (
                codeBlock.children &&
                Array.isArray(codeBlock.children)
              ) {
                return codeBlock.children
                  .map((child) => child.text || "")
                  .join("");
              } else if (codeBlock.plainText) {
                return codeBlock.plainText;
              }
              return "";
            })
            .filter((text) => text && text.trim() !== "");

          // Join with line breaks
          const mergedCodeText = allCodeTexts.join("\n");

          // Only render if we have content
          if (mergedCodeText.trim()) {
            result.push(
              <div
                key={`code-${i}`}
                className="mb-6 rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-300">
                  <span className="text-sm font-medium text-gray-700">
                    Code Example
                  </span>
                  <button
                    onClick={(e) => {
                      navigator.clipboard.writeText(mergedCodeText);

                      // Visual feedback
                      const btn = e.currentTarget;
                      const originalText = btn.textContent;
                      btn.textContent = "Copied!";
                      btn.classList.remove(
                        "bg-white",
                        "hover:bg-gray-50",
                        "text-gray-700",
                        "hover:text-gray-900"
                      );
                      btn.classList.add(
                        "bg-green-100",
                        "text-green-700",
                        "border-green-300"
                      );

                      // Reset button after 2 seconds
                      setTimeout(() => {
                        btn.textContent = originalText;
                        btn.classList.remove(
                          "bg-green-100",
                          "text-green-700",
                          "border-green-300"
                        );
                        btn.classList.add(
                          "bg-white",
                          "hover:bg-gray-50",
                          "text-gray-700",
                          "hover:text-gray-900"
                        );
                      }, 2000);
                    }}
                    className="text-xs bg-white hover:bg-gray-50 px-3 py-1.5 rounded border border-gray-300 transition-colors duration-200 text-gray-700 hover:text-gray-900"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto m-0">
                  <code className="text-gray-900 text-sm font-mono leading-relaxed whitespace-pre">
                    {mergedCodeText}
                  </code>
                </pre>
              </div>
            );
          }

          i--; // Move back one step
          continue;
        }
      }

      // Handle all other block types
      switch (block.type) {
        case "paragraph":
          result.push(
            <p
              key={`p-${i}`}
              className="mb-4 text-gray-700 text-sm leading-relaxed"
            >
              {block.children?.map((c) => c.text).join("") || ""}
            </p>
          );
          break;

        case "heading":
          const level = block.level || 2;
          const headingClass =
            {
              1: "text-2xl font-bold mb-4 text-gray-900 border-b pb-2",
              2: "text-xl font-semibold mb-3 text-gray-800 mt-6",
              3: "text-lg font-medium mb-2 text-gray-800 mt-4",
            }[level] || "text-base font-medium mb-2";
          result.push(
            <h3 key={`h-${i}`} className={headingClass}>
              {block.children?.map((c) => c.text).join("") || ""}
            </h3>
          );
          break;

        case "list":
          result.push(
            <ul
              key={`list-${i}`}
              className="list-disc ml-5 mb-4 space-y-1 text-gray-700 text-sm"
            >
              {block.children?.map((li, liIdx) => (
                <li key={liIdx}>
                  {li.children?.map((c) => c.text).join("") || ""}
                </li>
              )) || []}
            </ul>
          );
          break;

        default:
          // Skip unknown types
          break;
      }
    }

    return result;
  };

  // Scroll to TOP on next/prev lesson
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [selectedTopicIndex, selectedSubTopicIndex]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading Course Content...</p>
        </div>
      </div>
    );

  if (topics.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            No topics found for {prettyTitle(courseTitle)}.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const selectedTopic = topics[selectedTopicIndex];
  const selectedSubTopic = selectedTopic?.subTopics?.[selectedSubTopicIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="
    fixed bottom-5 left-5 z-50
    p-3.5 rounded-full
    bg-white/20 backdrop-blur-md
    border border-white/30
    shadow-[0_4px_20px_rgba(0,0,0,0.25)]
    hover:bg-white/30
    hover:shadow-[0_6px_25px_rgba(0,0,0,0.35)]
    transition-all duration-300
    lg:hidden
  "
      >
        {sidebarOpen ? (
          <X size={22} className="text-black drop-shadow" />
        ) : (
          <Menu size={22} className="text-black drop-shadow" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:fixed pt-15 z-40 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-medium text-gray-800 text-sm truncate">
                {prettyTitle(courseTitle)}
              </h1>
              <p className="text-gray-500 text-xs mt-0.5">
                {topics.length} modules • {totalLessons} lessons
              </p>
            </div>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
            />
          </div>
        </div>

        {/* Topics */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredTopics.map((topic, tIdx) => (
            <div
              key={tIdx}
              className="bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors mb-1"
            >
              <button
                onClick={() => toggleTopicExpansion(tIdx)}
                className={`flex items-center justify-between w-full p-2 text-left transition-colors ${
                  expandedTopics.has(tIdx)
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                      expandedTopics.has(tIdx)
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <FolderOpen size={12} />
                  </div>
                  <p className="text-gray-800 text-xs truncate">
                    {topic.topicTitle}
                  </p>
                </div>
                {topic.subTopics?.length > 0 && (
                  <ChevronDown
                    className={`w-3 h-3 text-gray-400 transition-transform ${
                      expandedTopics.has(tIdx) ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {expandedTopics.has(tIdx) && topic.subTopics?.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50/30">
                  {topic.subTopics.map((sub, sIdx) => {
                    const isCompleted = progress[`${tIdx}-${sIdx}`];
                    const isActive =
                      tIdx === selectedTopicIndex &&
                      sIdx === selectedSubTopicIndex;

                    return (
                      <button
                        key={sIdx}
                        onClick={() => handleSelectTopic(tIdx, sIdx)}
                        className={`flex items-center w-full p-2 text-left border-l transition-colors ${
                          isActive
                            ? "bg-blue-500/5 border-l-blue-500"
                            : "border-l-transparent hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? "bg-green-100 text-green-600"
                                : isActive
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle size={10} />
                            ) : (
                              <Circle size={10} />
                            )}
                          </div>
                          <p
                            className={`text-xs truncate ${
                              isActive
                                ? "text-blue-700"
                                : isCompleted
                                ? "text-gray-600"
                                : "text-gray-700"
                            }`}
                          >
                            {sub.subTopicTitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen p-4 lg:ml-64 lg:p-6 xl:p-8">
        <div className="max-w-full space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 flex-wrap">
                  <span className="font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {selectedTopic.topicTitle}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="font-medium">
                    Lesson {selectedSubTopicIndex + 1} of{" "}
                    {selectedTopic.subTopics?.length}
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 truncate">
                  {selectedSubTopic?.subTopicTitle || selectedTopic?.topicTitle}
                </h1>
              </div>

              <div className="flex gap-2 flex-wrap">
                {selectedSubTopic?.attachments?.length > 0 && (
                  <button
                    onClick={() =>
                      setCurrentMaterial(selectedSubTopic.attachments[0])
                    }
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Eye size={14} /> View Materials
                  </button>
                )}
                <button
                  onClick={() =>
                    markAsCompleted(selectedTopicIndex, selectedSubTopicIndex)
                  }
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors text-xs sm:text-sm font-medium ${
                    progress[`${selectedTopicIndex}-${selectedSubTopicIndex}`]
                      ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {progress[
                    `${selectedTopicIndex}-${selectedSubTopicIndex}`
                  ] ? (
                    <CheckCircle size={14} />
                  ) : (
                    <Circle size={14} />
                  )}
                  <span>
                    {progress[`${selectedTopicIndex}-${selectedSubTopicIndex}`]
                      ? "Completed"
                      : "Mark Complete"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div
            id="content-scroll-area"
            className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm"
          >
            {selectedSubTopic?.content?.length > 0 ? (
              <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                {renderContent(selectedSubTopic.content)}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-600 mb-1">
                  Content Coming Soon
                </h3>
                <p className="text-gray-500 text-sm">
                  This lesson is being prepared and will be available shortly.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <button
              onClick={() => {
                if (selectedSubTopicIndex > 0)
                  handleSelectTopic(
                    selectedTopicIndex,
                    selectedSubTopicIndex - 1
                  );
                else if (selectedTopicIndex > 0) {
                  const prevTopic = topics[selectedTopicIndex - 1];
                  handleSelectTopic(
                    selectedTopicIndex - 1,
                    prevTopic.subTopics?.length - 1 || 0
                  );
                }
              }}
              disabled={selectedTopicIndex === 0 && selectedSubTopicIndex === 0}
              className="flex items-center justify-center gap-1 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Previous Lesson
            </button>

            <button
              onClick={() => {
                const currentTopic = topics[selectedTopicIndex];
                if (selectedSubTopicIndex < currentTopic.subTopics?.length - 1)
                  handleSelectTopic(
                    selectedTopicIndex,
                    selectedSubTopicIndex + 1
                  );
                else if (selectedTopicIndex < topics.length - 1)
                  handleSelectTopic(selectedTopicIndex + 1, 0);
              }}
              disabled={
                selectedTopicIndex === topics.length - 1 &&
                selectedSubTopicIndex ===
                  topics[selectedTopicIndex].subTopics?.length - 1
              }
              className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Next Lesson <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
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
