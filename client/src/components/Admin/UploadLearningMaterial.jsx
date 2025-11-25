import React, { useState } from "react";
import { Upload, FileText, Loader2, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";

const UploadLearningMaterial = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [topics, setTopics] = useState([
    {
      topicTitle: "",
      topicKey: "",
      subTopics: [{ subTopicTitle: "", files: [] }],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const serverURL = import.meta.env.VITE_BACKEND_URL;

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

  const addTopic = () =>
    setTopics([
      ...topics,
      {
        topicTitle: "",
        topicKey: "",
        subTopics: [{ subTopicTitle: "", files: [] }],
      },
    ]);
  const removeTopic = (index) =>
    setTopics(topics.filter((_, i) => i !== index));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseTitle) return toast.error("Course title is required!");

    setLoading(true);
    const formData = new FormData();
    formData.append("courseTitle", courseTitle);

    const topicsData = topics.map((topic) => ({
      topicTitle: topic.topicTitle,
      topicKey: topic.topicKey,
      subTopics: topic.subTopics.map((sub) => ({
        subTopicTitle: sub.subTopicTitle,
        fileNames: sub.files.map((file) => file.name),
      })),
    }));
    formData.append("topics", JSON.stringify(topicsData));

    topics.forEach((topic) =>
      topic.subTopics.forEach((sub) =>
        sub.files.forEach((file) => formData.append("files", file))
      )
    );

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${serverURL}/api/learning-material`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success("Learning material uploaded successfully!");

      // ✅ Reset courseTitle and topics
      setCourseTitle("");
      setTopics([
        {
          topicTitle: "",
          topicKey: "",
          subTopics: [{ subTopicTitle: "", files: [] }],
        },
      ]);

      // ✅ Reset file input values by resetting the form itself
      e.target.reset();
    } catch (err) {
      toast.error(err.message || "Upload failed!");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto mt-12 p-8 rounded-3xl shadow-2xl bg-gradient-to-b from-gray-900 to-black text-white">
      <h2 className="text-4xl font-extrabold mb-8 flex items-center gap-3 text-blue-400">
        <Upload size={36} /> Upload Learning Material
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        <input
          type="text"
          placeholder="Course Title"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
          required
          className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
        />

        {topics.map((topic, tIndex) => (
          <div
            key={tIndex}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 space-y-5 relative"
          >
            {topics.length > 1 && (
              <button
                type="button"
                className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition"
                onClick={() => removeTopic(tIndex)}
              >
                <Trash2 size={20} />
              </button>
            )}

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Topic Title"
                value={topic.topicTitle}
                onChange={(e) =>
                  handleTopicChange(tIndex, "topicTitle", e.target.value)
                }
                required
                className="flex-1 p-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <input
                type="text"
                placeholder="Topic Key"
                value={topic.topicKey}
                onChange={(e) =>
                  handleTopicChange(tIndex, "topicKey", e.target.value)
                }
                required
                className="flex-1 p-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="space-y-4">
              {topic.subTopics.map((sub, sIndex) => (
                <div
                  key={sIndex}
                  className="bg-gray-700 p-4 rounded-xl border border-gray-600 shadow-inner relative space-y-3"
                >
                  {topic.subTopics.length > 1 && (
                    <button
                      type="button"
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition"
                      onClick={() => removeSubTopic(tIndex, sIndex)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
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
                    className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />

                  <label className="flex items-center gap-3 p-3 border-2 border-dashed border-blue-500 rounded-lg cursor-pointer hover:bg-blue-800 transition">
                    <FileText size={22} />
                    <span className="text-blue-200 font-medium">
                      {sub.files.length > 0
                        ? `${sub.files.length} file(s) selected`
                        : "Choose PDF files"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={(e) =>
                        handleFileChange(tIndex, sIndex, e.target.files)
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addSubTopic(tIndex)}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-500 font-semibold transition"
            >
              <Plus size={16} /> Add Sub-topic
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addTopic}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl font-semibold transition"
        >
          <Plus size={18} /> Add Topic
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white p-4 rounded-xl font-bold flex justify-center items-center gap-3 text-lg"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Upload Course"}
        </button>
      </form>
    </div>
  );
};

export default UploadLearningMaterial;
