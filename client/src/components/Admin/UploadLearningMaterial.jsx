import React, { useState } from "react";
import {
  Upload,
  FileText,
  Loader2,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";

const UploadLearningMaterial = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [topics, setTopics] = useState([
    {
      topicTitle: "",
      subTopics: [{ subTopicTitle: "", files: [] }],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState([0]);

  const serverURL = import.meta.env.VITE_BACKEND_URL || "";

  const CATEGORIES = {
    "Hiring Assessments": ["aptitude-tests"],
    "CRT Modules": [
      "quantitative-aptitude",
      "logical-reasoning",
      "competitive-programming",
      "interview-skills",
    ],
    "Learning Tracks": [
      "c",
      "cpp",
      "python",
      "java",
      "html",
      "javascript",
      "sql",
      "mongodb",
      "data-structure",
      "algorithms",
      "advance-java",
      "advance-python",
      "mern-fullstack",
      "java-fullstack",
      "python-fullstack",
    ],
    "Competitive Coding": [
      "100-cpp-programs",
      "100-java-programs",
      "100-python-programs",
    ],
    "Company Mocks": ["company-mocks"],
  };

  /* ---------- Helpers ---------- */
  const formatFileName = (fileName) => {
    if (fileName.length > 28) {
      return fileName.substring(0, 14) + "…" + fileName.slice(-11);
    }
    return fileName;
  };

  /* ---------- Topic / Subtopic handlers ---------- */
  const handleTopicChange = (topicIndex, field, value) => {
    const updated = [...topics];
    updated[topicIndex][field] = value;
    setTopics(updated);
  };

  const handleSubTopicChange = (topicIndex, subIndex, field, value) => {
    const updated = [...topics];
    updated[topicIndex].subTopics[subIndex][field] = value;
    setTopics(updated);
  };

  const handleFileChange = (topicIndex, subIndex, files) => {
    const updated = [...topics];
    updated[topicIndex].subTopics[subIndex].files = Array.from(files);
    setTopics(updated);
  };

  const addTopic = () => {
    const newTopics = [
      ...topics,
      {
        topicTitle: "",
        subTopics: [{ subTopicTitle: "", files: [] }],
      },
    ];
    setTopics(newTopics);
    setExpandedTopics((prev) => [...prev, newTopics.length - 1]);
  };

  const removeTopic = (index) => {
    const updated = topics.filter((_, i) => i !== index);
    setTopics(updated);
    setExpandedTopics((prev) =>
      prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
    );
  };

  const addSubTopic = (topicIndex) => {
    const updated = [...topics];
    updated[topicIndex].subTopics.push({ subTopicTitle: "", files: [] });
    setTopics(updated);
  };

  const removeSubTopic = (topicIndex, subIndex) => {
    const updated = [...topics];
    updated[topicIndex].subTopics.splice(subIndex, 1);
    setTopics(updated);
  };

  const toggleTopicExpansion = (topicIndex) => {
    setExpandedTopics((prev) =>
      prev.includes(topicIndex)
        ? prev.filter((i) => i !== topicIndex)
        : [...prev, topicIndex]
    );
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseTitle) {
      toast.error("Course title is required!");
      return;
    }

    setLoading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("courseTitle", courseTitle);

      // Prepare topics data
      const topicsData = topics.map((topic) => ({
        topicTitle: topic.topicTitle,
        subTopics: topic.subTopics.map((sub) => ({
          subTopicTitle: sub.subTopicTitle,
          fileNames: sub.files.map((f) => f.name),
        })),
      }));

      formData.append("topics", JSON.stringify(topicsData));

      // Append all files
      let fileCount = 0;
      topics.forEach((topic) =>
        topic.subTopics.forEach((sub) =>
          sub.files.forEach((file) => {
            formData.append("files", file);
            fileCount++;
          })
        )
      );

      // DEBUG: Log what's being sent
      console.log("=== FRONTEND DEBUG ===");
      console.log("courseTitle:", courseTitle);
      console.log("topicsData:", topicsData);
      console.log("Total files to upload:", fileCount);

      // Log FormData entries
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        if (pair[0] === "files") {
          console.log(pair[0], pair[1].name, pair[1].type, pair[1].size);
        } else {
          console.log(pair[0], pair[1]);
        }
      }

      // Get token
      const token = localStorage.getItem("token");
      console.log("Token exists:", !!token);

      // Send request
      const res = await fetch(`${serverURL}/api/learning-material`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Response status:", res.status);

      // Get response text
      const responseText = await res.text();
      console.log("Response text:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
        console.log("Parsed response:", result);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", responseText);
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(
          result.message || result.error || `Upload failed: ${res.status}`
        );
      }

      toast.success("Learning material uploaded successfully!");

      // Reset form
      setSelectedCategory("");
      setCourseTitle("");
      setTopics([
        {
          topicTitle: "",
          subTopics: [{ subTopicTitle: "", files: [] }],
        },
      ]);
      setExpandedTopics([0]);
    } catch (err) {
      console.error("Upload error details:", err);
      toast.error(err.message || "Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Debug Function (Optional) ---------- */
  const debugFormData = () => {
    const formData = new FormData();
    formData.append("courseTitle", courseTitle);

    const topicsData = topics.map((topic) => ({
      topicTitle: topic.topicTitle,
      subTopics: topic.subTopics.map((sub) => ({
        subTopicTitle: sub.subTopicTitle,
        fileNames: sub.files.map((f) => f.name),
      })),
    }));

    formData.append("topics", JSON.stringify(topicsData));

    topics.forEach((topic) =>
      topic.subTopics.forEach((sub) =>
        sub.files.forEach((file) => {
          formData.append("files", file);
        })
      )
    );

    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    console.log("Topics data:", topicsData);
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                Upload Learning Material
              </h1>
              <p className="text-sm sm:text-base text-blue-100/90 truncate">
                Create structured courses — topics, sub-topics and PDF materials
              </p>
            </div>
            {/* Debug button (remove in production) */}
            <button
              type="button"
              onClick={debugFormData}
              className="ml-auto text-xs bg-gray-800 text-white px-3 py-1 rounded-lg"
            >
              Debug
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category & Course */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCourseTitle("");
                  }}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {Object.keys(CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Course Title
                </label>
                <select
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                  disabled={!selectedCategory}
                  className={`w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !selectedCategory ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">Select Course</option>
                  {selectedCategory &&
                    CATEGORIES[selectedCategory].map((course) => (
                      <option key={course} value={course}>
                        {course
                          .replace(/-/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Topics header */}
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Course Topics ({topics.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addTopic}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Topic</span>
                </button>
              </div>
            </div>

            {/* Topics List */}
            <div className="space-y-4">
              {topics.map((topic, tIndex) => (
                <article
                  key={tIndex}
                  className="bg-gray-700 rounded-xl border border-gray-600 overflow-hidden"
                >
                  {/* header */}
                  <div className="flex items-start gap-3 p-3 sm:p-4 border-b border-gray-600">
                    <button
                      type="button"
                      onClick={() => toggleTopicExpansion(tIndex)}
                      className="flex items-center gap-3 flex-1 text-left"
                      aria-expanded={expandedTopics.includes(tIndex)}
                    >
                      {expandedTopics.includes(tIndex) ? (
                        <ChevronUp className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      )}

                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-semibold text-white truncate">
                          {topic.topicTitle || `Topic ${tIndex + 1}`}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">
                          {topic.subTopics.length} sub-topic(s),{" "}
                          {topic.subTopics.reduce(
                            (sum, sub) => sum + sub.files.length,
                            0
                          )}{" "}
                          file(s)
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      {topics.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTopic(tIndex)}
                          className="p-2 rounded-md text-red-400 hover:bg-red-900/30"
                          aria-label={`Remove topic ${tIndex + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* content */}
                  {expandedTopics.includes(tIndex) && (
                    <div className="p-3 sm:p-4 space-y-4">
                      {/* topic inputs - REMOVED topicKey field */}
                      <div className="grid grid-cols-1 gap-3">
                        <input
                          type="text"
                          placeholder="Topic Title"
                          value={topic.topicTitle}
                          onChange={(e) =>
                            handleTopicChange(
                              tIndex,
                              "topicTitle",
                              e.target.value
                            )
                          }
                          required
                          className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* sub-topics */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-white">
                            Sub-topics ({topic.subTopics.length})
                          </h5>
                          <button
                            type="button"
                            onClick={() => addSubTopic(tIndex)}
                            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                          >
                            <Plus size={14} /> Add Sub-topic
                          </button>
                        </div>

                        <div className="space-y-3">
                          {topic.subTopics.map((sub, sIndex) => (
                            <div
                              key={sIndex}
                              className="bg-gray-600 rounded-lg p-3"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3 gap-3">
                                <input
                                  type="text"
                                  placeholder="Sub-topic Title"
                                  value={sub.subTopicTitle}
                                  onChange={(e) =>
                                    handleSubTopicChange(
                                      tIndex,
                                      sIndex,
                                      "subTopicTitle",
                                      e.target.value
                                    )
                                  }
                                  required
                                  className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-500 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                {topic.subTopics.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeSubTopic(tIndex, sIndex)
                                    }
                                    className="mt-1 sm:mt-0 p-2 text-red-400 rounded-md hover:bg-red-900/30"
                                    aria-label="Remove sub-topic"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>

                              {/* file upload */}
                              <div className="mt-3">
                                <label
                                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border-2 border-dashed border-blue-500 rounded-lg cursor-pointer hover:bg-blue-900/20"
                                  aria-label="Upload pdf files"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText
                                      size={18}
                                      className="text-blue-400"
                                    />
                                    <div className="min-w-0">
                                      <div className="text-sm text-blue-100 font-medium">
                                        {sub.files.length > 0
                                          ? `${sub.files.length} file(s) selected`
                                          : "Choose PDF files"}
                                      </div>
                                      <div className="text-xs text-blue-300">
                                        Supports .pdf (multiple)
                                      </div>
                                    </div>
                                  </div>

                                  <input
                                    type="file"
                                    accept=".pdf"
                                    multiple
                                    onChange={(e) =>
                                      handleFileChange(
                                        tIndex,
                                        sIndex,
                                        e.target.files
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>

                                {/* file list */}
                                {sub.files.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <div className="flex gap-2 overflow-x-auto py-1">
                                      {sub.files.map((file, fileIndex) => (
                                        <div
                                          key={fileIndex}
                                          className="flex-shrink-0 min-w-[220px] sm:min-w-0 bg-gray-700 px-3 py-2 rounded-md flex items-center justify-between gap-3"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <FileText
                                              size={16}
                                              className="text-green-400 flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                              <div className="text-sm text-white truncate">
                                                {formatFileName(file.name)}
                                              </div>
                                              <div className="text-xs text-gray-400">
                                                {(
                                                  file.size /
                                                  1024 /
                                                  1024
                                                ).toFixed(2)}{" "}
                                                MB
                                              </div>
                                            </div>
                                          </div>
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
                  )}
                </article>
              ))}
            </div>

            {/* submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading Course...</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    <span>Upload Course Material</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadLearningMaterial;
