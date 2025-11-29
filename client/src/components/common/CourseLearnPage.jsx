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
} from "lucide-react";
import PdfViewer from "./PdfViewer";

export default function CourseLearnPage() {
  const { courseTitle } = useParams();
  const serverURL = "https://strapi-o1gr.onrender.com";

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
  const [duration, setDuration] = useState(900); // 15 minutes in seconds

  const prettyTitle = (str) =>
    str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Mock progress data
  useEffect(() => {
    const mockProgress = {};
    topics.forEach((topic, tIdx) => {
      topic.subTopics?.forEach((sub, sIdx) => {
        mockProgress[`${tIdx}-${sIdx}`] = Math.random() > 0.7;
      });
    });
    setProgress(mockProgress);
  }, [topics]);

  // Fetch topics from Strapi
  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:1337/api/courses?populate[Topic][populate][subTopics][populate]=*`
        );
        const data = await res.json();

        if (!data?.data || data.data.length === 0) {
          setTopics([]);
          return;
        }

        const urlCourseTitle = courseTitle.trim().toLowerCase();
        const course = data.data.find(
          (c) => c?.courseTitle?.trim().toLowerCase() === urlCourseTitle
        );

        if (!course) {
          setTopics([]);
          return;
        }

        const topicsWithSubTopics = (course.Topic || []).map((topic) => ({
          ...topic,
          subTopics: topic.subTopics || [],
        }));

        setTopics(topicsWithSubTopics);
        setExpandedTopics(new Set([0]));

        const firstMaterial =
          topicsWithSubTopics?.[0]?.subTopics?.[0]?.attachments?.[0] || null;
        setCurrentMaterial(firstMaterial);
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
      if (newSet.has(topicIdx)) {
        newSet.delete(topicIdx);
      } else {
        newSet.add(topicIdx);
      }
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

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.value);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

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
    return content.map((block, idx) => {
      switch (block.type) {
        case "paragraph":
          return (
            <p
              key={idx}
              className="mb-6 text-gray-700 leading-relaxed text-[15px]"
            >
              {block.children.map((c) => c.text).join("")}
            </p>
          );
        case "heading":
          const level = block.level || 2;
          const headingClass =
            {
              1: "text-2xl font-bold mb-6 text-gray-900 border-b pb-3",
              2: "text-xl font-semibold mb-4 text-gray-800 mt-8",
              3: "text-lg font-medium mb-3 text-gray-800 mt-6",
            }[level] || "text-base font-medium mb-3";
          return (
            <h3 key={idx} className={headingClass}>
              {block.children.map((c) => c.text).join("")}
            </h3>
          );
        case "list":
          return (
            <ul
              key={idx}
              className="list-disc ml-5 mb-6 space-y-2 text-gray-700 text-[15px]"
            >
              {block.children.map((li, i) => (
                <li key={i} className="leading-relaxed">
                  {li.children.map((c) => c.text).join("")}
                </li>
              ))}
            </ul>
          );
        case "code":
          return (
            <div
              key={idx}
              className="mb-6 rounded-lg overflow-hidden border border-gray-200 bg-white"
            >
              <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  Code Example
                </span>
                <button className="text-xs bg-white hover:bg-gray-100 px-3 py-1 rounded border border-gray-300 transition-colors text-gray-600">
                  Copy
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-gray-800">
                {block.children.map((c) => c.text).join("")}
              </pre>
            </div>
          );
        default:
          return null;
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading Course Content...</p>
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            No topics found for {prettyTitle(courseTitle)}.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const selectedTopic = topics[selectedTopicIndex];
  const selectedSubTopic = selectedTopic?.subTopics?.[selectedSubTopicIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-sm font-medium text-gray-800 truncate mx-4">
              {prettyTitle(courseTitle)}
            </h1>
          </div>
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={14} className="text-blue-600" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
          sticky lg:sticky  inset-y-0 left-0 z-1 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out 
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
          flex flex-col h-screen
        `}
        >
          {/* Sidebar Header - Compact */}
          <div className="p-4 border-b border-gray-200 position-[sticky]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-medium text-gray-800 text-[13px] leading-tight truncate">
                  {prettyTitle(courseTitle)}
                </h1>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {topics.length} modules • {totalLessons} lessons
                </p>
              </div>
            </div>

            {/* Search Bar - Compact */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-[12px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
              />
            </div>
          </div>

          {/* Progress Section - Compact */}
          <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-gray-700 font-medium">Progress</span>
              <span className="font-semibold text-blue-700">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-600 mt-1.5">
              <span>
                {completedLessons}/{totalLessons}
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 size={10} />
                {progressPercentage}%
              </span>
            </div>
          </div>

          {/* Course Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h6 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">
                  Course Content
                </h6>
              </div>

              <div className="space-y-1">
                {filteredTopics.map((topic, tIdx) => (
                  <div
                    key={tIdx}
                    className="bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors"
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
                        <div className="flex-1 min-w-0">
                          <p className="font-normal text-gray-800 text-[12px] leading-tight truncate">
                            {topic.topicTitle}
                          </p>
                        </div>
                      </div>
                      {topic.subTopics?.length > 0 && (
                        <ChevronDown
                          className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${
                            expandedTopics.has(tIdx) ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    {expandedTopics.has(tIdx) &&
                      topic.subTopics?.length > 0 && (
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
                                className={`flex items-center w-full p-2 text-left transition-colors group border-l ${
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
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`font-normal text-[12px] truncate ${
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
          </div>

          {/* Sidebar Footer - Compact */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-[11px] text-gray-600">
              <div className="flex items-center gap-1.5">
                <Bookmark size={10} />
                <span>Last: Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <div className="flex-1 min-h-screen overflow-y-auto">
          <div className="max-w-full px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
            {/* Enhanced Content Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      {selectedTopic.topicTitle}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="font-medium">
                      Lesson {selectedSubTopicIndex + 1} of{" "}
                      {selectedTopic.subTopics?.length}
                    </span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {selectedSubTopic?.subTopicTitle ||
                      selectedTopic?.topicTitle}
                  </h1>

                  {/* Interactive Progress Bar */}
                  {/* <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>15 min</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          <span>
                            {selectedSubTopic?.attachments?.length || 0}{" "}
                            resources
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                        >
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <div className="flex-1">
                          <input
                            type="range"
                            min="0"
                            max={duration}
                            value={currentTime}
                            onChange={handleTimeUpdate}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                          />
                        </div>
                        <button className="text-gray-500 hover:text-gray-700 transition-colors">
                          <Volume2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div> */}
                </div>

                <div className="flex gap-3 flex-shrink-0">
                  {selectedSubTopic?.attachments?.length > 0 && (
                    <button
                      onClick={() =>
                        setCurrentMaterial(selectedSubTopic.attachments[0])
                      }
                      className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      <Eye size={16} />
                      <span>View Materials</span>
                    </button>
                  )}
                  <button
                    onClick={() =>
                      markAsCompleted(selectedTopicIndex, selectedSubTopicIndex)
                    }
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors text-sm font-medium shadow-sm ${
                      progress[`${selectedTopicIndex}-${selectedSubTopicIndex}`]
                        ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {progress[
                      `${selectedTopicIndex}-${selectedSubTopicIndex}`
                    ] ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Circle size={16} />
                    )}
                    <span>
                      {progress[
                        `${selectedTopicIndex}-${selectedSubTopicIndex}`
                      ]
                        ? "Completed"
                        : "Mark Complete"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Content Body */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Content Area */}
              <div className="xl:col-span-3">
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 shadow-sm">
                  {selectedSubTopic?.content?.length > 0 ? (
                    <div className="prose prose-lg max-w-none">
                      {renderContent(selectedSubTopic.content)}

                      {/* Interactive Code Playground */}
                      {/* <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Play size={18} />
                          Try It Yourself
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Experiment with the code examples in our interactive
                          playground.
                        </p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Open Playground
                        </button>
                      </div> */}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Content Coming Soon
                      </h3>
                      <p className="text-gray-500 text-base">
                        This lesson is being prepared and will be available
                        shortly.
                      </p>
                    </div>
                  )}

                  {/* Enhanced Navigation */}
                  <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
                    <button
                      onClick={() => {
                        if (selectedSubTopicIndex > 0) {
                          handleSelectTopic(
                            selectedTopicIndex,
                            selectedSubTopicIndex - 1
                          );
                        } else if (selectedTopicIndex > 0) {
                          const prevTopic = topics[selectedTopicIndex - 1];
                          handleSelectTopic(
                            selectedTopicIndex - 1,
                            prevTopic.subTopics?.length - 1 || 0
                          );
                        }
                      }}
                      disabled={
                        selectedTopicIndex === 0 && selectedSubTopicIndex === 0
                      }
                      className="flex items-center gap-3 px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Previous Lesson
                    </button>

                    <button
                      onClick={() => {
                        const currentTopic = topics[selectedTopicIndex];
                        if (
                          selectedSubTopicIndex <
                          currentTopic.subTopics?.length - 1
                        ) {
                          handleSelectTopic(
                            selectedTopicIndex,
                            selectedSubTopicIndex + 1
                          );
                        } else if (selectedTopicIndex < topics.length - 1) {
                          handleSelectTopic(selectedTopicIndex + 1, 0);
                        }
                      }}
                      disabled={
                        selectedTopicIndex === topics.length - 1 &&
                        selectedSubTopicIndex ===
                          topics[selectedTopicIndex].subTopics?.length - 1
                      }
                      className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
                    >
                      Next Lesson
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Side Panel - Additional Resources */}
              <div className="xl:col-span-1 space-y-6">
                {/* Quick Actions */}
                {/* <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-4 text-sm">
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      <Bookmark size={14} />
                      Bookmark Lesson
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      <Maximize2 size={14} />
                      Fullscreen Mode
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      <FileText size={14} />
                      Download Notes
                    </button>
                  </div>
                </div> */}

                {/* Related Resources */}
                {selectedSubTopic?.attachments?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-4 text-sm">
                      Resources
                    </h4>
                    <div className="space-y-2">
                      {selectedSubTopic.attachments.map((attachment, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentMaterial(attachment)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <FileText
                            size={14}
                            className="text-blue-600 flex-shrink-0"
                          />
                          <span className="truncate">Resource {index + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Stats */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                  <h4 className="font-semibold mb-3 text-sm">Your Progress</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span>Course Completion</span>
                      <span className="font-bold">{progressPercentage}%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Lessons Completed</span>
                      <span className="font-bold">
                        {completedLessons}/{totalLessons}
                      </span>
                    </div>
                    <div className="w-full bg-blue-400 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-white h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
