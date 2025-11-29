import React, { useState } from "react";
import { Upload, FileSpreadsheet, Loader2, FileText, X } from "lucide-react";
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

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-6 sm:py-8 lg:py-10 px-3 sm:px-4 lg:px-6">
      <div className="max-w-md sm:max-w-lg lg:max-w-2xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 mb-6 sm:mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                  Upload Program Files
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Upload Excel files containing program codes and examples
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Course Selection */}
            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                Select Course
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm sm:text-base bg-white hover:border-gray-400"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              >
                <option value="">-- Select Programming Language --</option>
                <option value="c">C Programming</option>
                <option value="c++">C++ Programming</option>
                <option value="java">Java Programming</option>
                <option value="python">Python Programming</option>
                <option value="javascript">JavaScript</option>
                <option value="html-css">HTML & CSS</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                Upload Excel Files
              </label>

              {/* File Input Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  multiple
                  onChange={(e) => setFiles([...e.target.files])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-700">
                      Click to upload files
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Supports .xlsx, .xls, .csv files
                    </p>
                  </div>
                </label>
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Selected Files ({files.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Array.from(files).map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors ml-2"
                        >
                          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <button
              type="submit"
              disabled={loading || !courseTitle || files.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 sm:py-3.5 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Uploading Files...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Upload Program Files</span>
                </>
              )}
            </button>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                Make sure your Excel files are properly formatted with program
                codes and examples
              </p>
            </div>
          </form>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
          <div className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-200 shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">
              Excel Format
            </h3>
            <p className="text-xs text-gray-600">.xlsx, .xls files supported</p>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-200 shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">
              Bulk Upload
            </h3>
            <p className="text-xs text-gray-600">Multiple files at once</p>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-200 shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">
              Organized
            </h3>
            <p className="text-xs text-gray-600">Auto-categorized by course</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadProgram;
