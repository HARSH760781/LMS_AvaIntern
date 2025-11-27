import React from "react";
import { FileText, Upload, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UploadOptions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-gray-50 to-blue-100 flex justify-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Upload Manager
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2                                                                                       ">
          {/* Upload Learning Material */}
          <div
            onClick={() => navigate("/upload-learning-material")}
            className="bg-white p-6 rounded-xl shadow-xl border cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="font-semibold text-center text-lg mb-2">
              Upload Learning Material
            </h2>
            <p className="text-gray-600 text-center text-sm">
              Upload PDFs for aptitude learning topics.
            </p>
          </div>

          {/* Upload Tests */}
          <div
            onClick={() => navigate("/upload-test")}
            className="bg-white p-6 rounded-xl shadow-xl border cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center justify-center mb-4">
              <Upload className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="font-semibold text-center text-lg mb-2">
              Upload Tests
            </h2>
            <p className="text-gray-600 text-center text-sm">
              Upload Excel files for practice and mock tests.
            </p>
          </div>
          <div
            onClick={() => navigate("/upload-program")}
            className="bg-white p-6 rounded-xl shadow-xl border cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center justify-center mb-4">
              <Upload className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="font-semibold text-center text-lg mb-2">
              Upload Programs
            </h2>
            <p className="text-gray-600 text-center text-sm">
              Upload Excel files for practice programming questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadOptions;
