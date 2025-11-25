import React, { useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const UploadTest = () => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    testName: "",
    description: "",
    subject: "",
    topic: "",
    duration: "",
  });

  const [loading, setLoading] = useState(false);
  const serverURL = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload an Excel file!");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("excelFile", file);

    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${serverURL}/api/test/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Upload Failed!");
        return;
      }

      toast.success("Test uploaded successfully!");

      setFile(null);
      setFormData({
        testName: "",
        description: "",
        subject: "",
        topic: "",
        duration: "",
      });
    } catch (error) {
      console.log(error);
      toast.error("Upload Failed!");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white shadow-2xl rounded-2xl border">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Upload size={26} />
        </div>
        <h2 className="text-3xl font-bold tracking-wide">
          Upload Aptitude Test
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Test Name</label>
          <input
            type="text"
            name="testName"
            placeholder="Enter test name"
            value={formData.testName}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold">Subject</label>
          <input
            type="text"
            name="subject"
            placeholder="Enter subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold">Topic</label>
          <input
            type="text"
            name="topic"
            placeholder="Enter topic"
            value={formData.topic}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            placeholder="60"
            value={formData.duration}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
          <label className="font-semibold">Description</label>
          <textarea
            name="description"
            placeholder="Enter description (optional)"
            value={formData.description}
            onChange={handleChange}
            className="border p-3 rounded-lg bg-gray-50 h-28 resize-none focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="font-semibold">Excel File</label>
          <div className="mt-2 flex items-center gap-3 border p-4 rounded-lg bg-gray-50">
            <FileSpreadsheet className="text-green-600" size={24} />
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold p-3 rounded-xl hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Upload Test"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadTest;
