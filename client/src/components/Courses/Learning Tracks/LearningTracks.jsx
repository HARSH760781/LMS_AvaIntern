import React from "react";
import { PanelsTopLeft, BookOpen, TrendingUp, Layers } from "lucide-react";
import CourseTab from "../../common/CourseTab";

const courseDataFoundation = [
  { imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/C.png", courseName: "C" },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/cpp.jpg",
    courseName: "CPP",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/python.jpg",
    courseName: "Python",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/java.png",
    courseName: "Java",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/HTML.png",
    courseName: "HTML",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/JS.png",
    courseName: "JavaScript",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/SQL.png",
    courseName: "SQL",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/MongoDB.png",
    courseName: "MongoDB",
  },
];

const courseDataAdvance = [
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/DSA.png",
    courseName: "Data Structures",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/Algorithms.png",
    courseName: "Algorithms",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/advance%20Java.png",
    courseName: "Advance Java",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/python.jpg",
    courseName: "Advance Python",
  },
];

const courseDataFullStack = [
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/mern.jpg",
    courseName: "MERN Full Stack",
  },
  {
    imageUrl:
      "https://ik.imagekit.io/y7csnuuzj/Icons/java-fullstack.png?updatedAt=1763709724019",
    courseName: "Java Full Stack",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/python-fs.png",
    courseName: "Python Full Stack",
  },
];

const LearningTracks = () => {
  const trackSections = [
    {
      title: "Technical Foundation",
      icon: <BookOpen className="w-5 h-5" />,
      color: "blue",
      courses: courseDataFoundation,
    },
    {
      title: "Technical Advanced",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "green",
      courses: courseDataAdvance,
    },
    {
      title: "Full Stack Development",
      icon: <Layers className="w-5 h-5" />,
      color: "purple",
      courses: courseDataFullStack,
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
    };
    return colors[color] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <PanelsTopLeft className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Learning Tracks
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Structured learning paths for your career
            </p>
          </div>
        </div>
      </div>

      {/* Track Sections */}
      <div className="space-y-8">
        {trackSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${getColorClasses(
                  section.color
                )} rounded-lg flex items-center justify-center shadow-lg`}
              >
                {section.icon}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {section.title}
                </h3>
                <div
                  className={`w-16 h-1 bg-gradient-to-r ${getColorClasses(
                    section.color
                  )} rounded-full mt-1`}
                ></div>
              </div>
            </div>

            {/* Courses Grid */}
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ${
                section.courses.length === 3 ? "lg:grid-cols-3" : ""
              }`}
            >
              {section.courses.map((item, index) => (
                <CourseTab
                  key={index}
                  imageUrl={item.imageUrl}
                  courseName={item.courseName}
                  category="Learning Tracks"
                  size="small"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningTracks;
