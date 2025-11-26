import React from "react";
import { BookOpen, FileText, Lightbulb, ArrowLeft, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LearningEnvironment = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col items-center px-6 py-10">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl flex items-center gap-3 mb-10"
      >
        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-4xl font-extrabold flex items-center gap-3 text-blue-400">
          <BookOpen size={40} />
          Learning Environment
        </h1>
      </motion.div>

      {/* Main Empty State */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-gray-800/80 backdrop-blur-md rounded-3xl p-10 text-center border border-gray-700 shadow-xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 rounded-full bg-blue-600/10 border border-blue-500 flex items-center justify-center">
            <Layers size={52} className="text-blue-400" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-blue-300">
          No Courses Available
        </h2>

        <p className="mt-4 text-gray-300 text-lg leading-relaxed">
          You haven't uploaded any learning materials yet. Once topics & modules
          are added, they will appear here for students to access.
        </p>

        <motion.button
          onClick={() => navigate("/upload-learning-material")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="mt-8 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold shadow-lg"
        >
          Upload Learning Material
        </motion.button>
      </motion.div>

      {/* Optional Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14 w-full max-w-5xl"
      >
        {/* Benefit Card 1 */}
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg text-center hover:shadow-blue-500/20 transition">
          <Lightbulb size={40} className="mx-auto text-yellow-400" />
          <h3 className="text-xl font-bold mt-4">Smart Learning</h3>
          <p className="text-gray-400 mt-2">
            Organize materials into structured modules for quick learning.
          </p>
        </div>

        {/* Benefit Card 2 */}
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg text-center hover:shadow-blue-500/20 transition">
          <FileText size={40} className="mx-auto text-green-400" />
          <h3 className="text-xl font-bold mt-4">Easy Access</h3>
          <p className="text-gray-400 mt-2">
            Students can view PDFs and resources anytime, anywhere.
          </p>
        </div>

        {/* Benefit Card 3 */}
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg text-center hover:shadow-blue-500/20 transition">
          <BookOpen size={40} className="mx-auto text-blue-400" />
          <h3 className="text-xl font-bold mt-4">Structured Content</h3>
          <p className="text-gray-400 mt-2">
            Chapters, topics, and sub-topics keep learning well organized.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LearningEnvironment;
