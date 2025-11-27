import React from "react";
import { useNavigate } from "react-router-dom";
import { PanelsTopLeft, ArrowRight } from "lucide-react";
import CourseTab from "../../common/CourseTab";

const courseData = [
  {
    imageUrl:
      "https://ik.imagekit.io/y7csnuuzj/Icons/APTITUDE.png?updatedAt=1763706236262",
    courseName: "Aptitude Tests",
    route: "/aptitude-tests",
    description: "Master quantitative and logical reasoning",
  },
  {
    imageUrl:
      "https://ik.imagekit.io/y7csnuuzj/Icons/pROGRAMMING.png?updatedAt=1763706236186",
    courseName: "Programming Tests",
    route: "/programming-tests",
    description: "Code and solve complex problems",
  },
  {
    imageUrl:
      "https://ik.imagekit.io/y7csnuuzj/Icons/tYPING.png?updatedAt=1763706236099",
    courseName: "Typing Tests",
    route: "/typing-tests",
    description: "Improve your speed & accuracy",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/Test.png",
    courseName: "Live Tests",
    route: "/live-tests",
    description: "Real-time assessment challenges",
  },
];

const Hiring = () => {
  const navigate = useNavigate();

  const handleCourseClick = (route) => {
    navigate(`/course/${route}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <PanelsTopLeft className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Hiring Assessments
            </h2>
            <p className="text-gray-600 text-sm mt-1">Prepare for placements</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>

      {/* Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        {courseData.map((item, index) => (
          <div
            key={index}
            onClick={() => handleCourseClick(item.route)}
            className="cursor-pointer h-full"
          >
            <CourseTab
              imageUrl={item.imageUrl}
              courseName={item.courseName}
              description={item.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hiring;
