import React, { useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const UploadProgram = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const serverURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseTitle || files.length === 0)
      return toast.error("Please select a course and files");

    setLoading(true);

    const formData = new FormData();
    formData.append("courseTitle", courseTitle);
    for (let i = 0; i < files.length; i++) {
      formData.append("programFiles", files[i]);
    }

    try {
      const response = await fetch(`${serverURL}/api/programs/upload-program`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      toast.success(data.message || "Programs uploaded successfully!");

      // reset form
      setCourseTitle("");
      setFiles([]);
    } catch (error) {
      console.error(error);
      toast.error("Upload failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6 mt-10">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5" /> Upload Program Files
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Course
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
          >
            <option value="">--Select Course--</option>
            <option value="c">C</option>
            <option value="c++">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Files</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="w-full border rounded-lg px-3 py-2"
            multiple
            onChange={(e) => setFiles([...e.target.files])}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" /> Upload
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadProgram;
