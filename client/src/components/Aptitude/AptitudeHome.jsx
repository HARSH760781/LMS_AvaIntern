import React from "react";
import { BookOpen, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const topics = [
    {
      title: "Percentage Basics",
      pdf: "/pdfs/percentage.pdf",
      content:
        "Learn important concepts, formulas and tricks to solve percentage problems efficiently.",
    },
    {
      title: "Profit & Loss",
      pdf: "/pdfs/profit-loss.pdf",
      content:
        "Understand cost price, selling price, profit/loss formulas and shortcuts.",
    },
    {
      title: "Time & Work",
      pdf: "/pdfs/time-work.pdf",
      content:
        "Learn how to calculate efficiency, total work and work distribution.",
    },
  ];

  const [openTopic, setOpenTopic] = React.useState(null);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Aptitude Learning
        </h2>

        {/* Accordion */}
        <div className="space-y-4">
          {topics.map((topic, index) => (
            <div key={index} className="border rounded-xl shadow-sm bg-gray-50">
              <button
                className="w-full text-left px-6 py-4 flex justify-between items-center"
                onClick={() => setOpenTopic(openTopic === index ? null : index)}
              >
                <span className="text-lg font-semibold text-gray-800">
                  {topic.title}
                </span>
                <span className="text-xl">
                  {openTopic === index ? "−" : "+"}
                </span>
              </button>

              {openTopic === index && (
                <div className="px-6 pb-4 text-gray-700">
                  <p className="mb-4">{topic.content}</p>

                  {/* Download PDF Button */}
                  <a
                    href={topic.pdf}
                    download
                    className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all"
                  >
                    Download PDF
                  </a>
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
