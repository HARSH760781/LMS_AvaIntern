import React from "react";
import { PanelsTopLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CourseTab from "../../common/CourseTab";

const courseData = [
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/quant.jpg",
    courseName: "Quantitative Aptitude",
    description: "Master math and calculations",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/logicall.png",
    courseName: "Logical Reasoning",
    description: "Enhance analytical thinking",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/cp.png",
    courseName: "Competitive Programming",
    description: "Solve advanced coding problems",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/interview.jpg",
    courseName: "Interview Skills",
    description: "Ace behavioral & technical interviews",
  },
];

const CRT = () => {
  const navigate = useNavigate();

  const slugify = (str) => str.toLowerCase().replace(/ /g, "-");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <PanelsTopLeft className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              CRT Modules
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Campus Recruitment Training
            </p>
          </div>
        </div>

        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>

      {/* Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        {courseData.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(`/course/${slugify(item.courseName)}`)}
            className="cursor-pointer"
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

export default CRT;
