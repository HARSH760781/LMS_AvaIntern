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
  Sparkles,
} from "lucide-react";

export default function CoursePage() {
  const { courseTitle } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTopicIndex, setOpenTopicIndex] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const serverURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `${serverURL}/api/learning-material?courseTitle=${courseTitle}`
        );
        const data = await res.json();

        // Ensure correct course is returned
        const course = data?.find(
          (c) => c.courseTitle?.toLowerCase() === courseTitle.toLowerCase()
        );

        setTopics(course?.topics || []);
      } catch (err) {
        console.error(err);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [courseTitle]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin border-4 border-transparent bg-origin-border bg-clip-border">
              <div className="absolute inset-1 bg-slate-900 rounded-full"></div>
            </div>
            <Sparkles className="w-5 h-5 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-gray-300 text-sm font-light mt-3">
            Loading course content...
          </p>
        </div>
      </div>
    );

  if (topics.length === 0)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl backdrop-blur-sm border border-white/10 mx-auto flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">
            No Content Available
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            No learning materials found for{" "}
            <strong className="text-gray-300">
              {courseTitle.replace(/-/g, " ")}
            </strong>
            .
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-all duration-300 backdrop-blur-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const toTitleCase = (str) => {
    return str
      .replace(/-/g, " ") // replace dashes with spaces
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-4 text-center">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-gray-300 hover:text-white text-xs font-medium transition-all duration-300 backdrop-blur-sm"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>

            {/* Course Title */}
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-white">
              {toTitleCase(courseTitle)}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Explore interactive learning materials
            </p>
          </div>

          {/* Topics Accordion */}
          <div className="space-y-4">
            {topics.map((topic, idx) => (
              <div
                key={idx}
                className="relative group"
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl blur-xl transition-all duration-500 ${
                    hoveredCard === idx
                      ? "opacity-100 scale-105"
                      : "opacity-0 scale-100"
                  }`}
                ></div>

                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 backdrop-blur-sm shadow-lg overflow-hidden transition-all duration-500 hover:border-gray-600 hover:shadow-lg hover:scale-[1.02]">
                  {/* Topic Header */}
                  <button
                    className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-white/5 transition-all duration-300"
                    onClick={() =>
                      setOpenTopicIndex(openTopicIndex === idx ? null : idx)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow">
                          <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-900">
                            {topic.subTopics?.length || 0}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <h3 className="text-md font-semibold text-white">
                          {topic.topicTitle}
                        </h3>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {topic.subTopics?.length || 0} sub-topics
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-700 rounded-md flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                        {openTopicIndex === idx ? (
                          <ChevronUp className="w-4 h-4 text-gray-300" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {openTopicIndex === idx && (
                    <div className="border-t border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-2">
                      <div className="space-y-2">
                        {topic.subTopics?.map((sub, subIdx) => (
                          <div
                            key={subIdx}
                            className="bg-gradient-to-br from-gray-700/20 to-gray-800/20 rounded-md border border-gray-600 p-2 hover:border-gray-500 transition-all duration-200"
                          >
                            <h4 className="font-medium text-white flex items-center text-sm">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center mr-2">
                                <FileText className="w-3 h-3 text-white" />
                              </div>
                              {sub.subTopicTitle}
                            </h4>

                            {sub.materials?.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
                                {sub.materials.map((material, mIdx) => (
                                  <a
                                    key={mIdx}
                                    href={material.filePath}
                                    download
                                    className="group relative bg-gray-700/20 hover:bg-blue-500/20 rounded-md border border-gray-600 hover:border-blue-400 p-2 text-xs text-gray-300 font-medium flex items-center justify-between transition-all duration-200"
                                  >
                                    <span className="truncate">
                                      {material.fileName ||
                                        `Material ${mIdx + 1}`}
                                    </span>
                                    <Download className="w-3 h-3 text-gray-400 group-hover:text-white ml-2" />
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-400 text-xs italic mt-1">
                                No materials available
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
