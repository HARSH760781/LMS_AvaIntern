import React, { useState, useEffect } from "react";
import { BookOpen, ClipboardList } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Main Aptitude Page
export default function AptitudeHome() {
  const navigate = useNavigate();

  const Card = ({ title, icon: Icon, onClick }) => (
    <div
      onClick={onClick}
      className="cursor-pointer w-full sm:w-80 bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all flex flex-col items-center gap-4 border border-gray-200"
    >
      <Icon className="w-12 h-12 text-indigo-600" />
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-10">Aptitude</h1>
      <div className="flex flex-wrap gap-8 justify-center">
        <Card
          title="Learn"
          icon={BookOpen}
          onClick={() => navigate("/aptitude/learn")}
        />
        <Card
          title="Practice"
          icon={ClipboardList}
          onClick={() => navigate("/aptitude/practice")}
        />
      </div>
    </div>
  );
}

// Learn Page
export function AptitudeLearn() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTopic, setOpenTopic] = useState(null);
  const { courseTitle } = useParams(); // ✅ get course title from URL
  // console.log(courseTitle);

  const serverURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // Fetch only the course with courseTitle=Aptitude
        const res = await fetch(
          `${serverURL}/api/learning-material?courseTitle=Aptitude`
        );
        const data = await res.json();

        if (data.length > 0) {
          // Take the topics of the Aptitude course
          setTopics(data[0].topics || []);
        } else {
          setTopics([]);
        }
      } catch (err) {
        console.error("Failed to fetch topics:", err);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-700 text-lg">Loading topics...</p>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-700 text-lg">
          No topics found for Aptitude course.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Aptitude Learning
        </h2>

        <div className="space-y-4">
          {topics.map((topic, index) => (
            <div key={index} className="border rounded-xl shadow-sm bg-gray-50">
              <button
                className="w-full text-left px-6 py-4 flex justify-between items-center"
                onClick={() => setOpenTopic(openTopic === index ? null : index)}
              >
                <span className="text-lg font-semibold text-gray-800">
                  {topic.topicTitle}
                </span>
                <span className="text-xl">
                  {openTopic === index ? "−" : "+"}
                </span>
              </button>

              {openTopic === index && (
                <div className="px-6 pb-4 text-gray-700">
                  {topic.subTopics?.map((sub, subIndex) => (
                    <div key={subIndex} className="mb-4">
                      <h3 className="font-medium text-gray-800 mb-2">
                        {sub.subTopicTitle}
                      </h3>
                      {sub.materials?.map((material, mIndex) => (
                        <a
                          key={mIndex}
                          href={material.filePath}
                          download
                          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all mr-2 mb-2"
                        >
                          {material.fileName || `PDF ${mIndex + 1}`}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// Practice Page Placeholder (We will build later)
export function AptitudePractice() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <h1 className="text-2xl font-semibold text-gray-800">
        Practice Module Coming Soon...
      </h1>
    </div>
  );
}
