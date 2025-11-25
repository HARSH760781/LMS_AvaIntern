import React from "react";
import { PanelsTopLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CourseTab from "../../common/CourseTab";

const courseData = [
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/quant.jpg",
    courseName: "Quantitative Aptitude",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/logicall.png",
    courseName: "Logical Reasoning",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/cp.png",
    courseName: "Competitive Programming",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/interview.jpg",
    courseName: "Interview Skills",
  },
];

const CRT = () => {
  const navigate = useNavigate();

  // Convert name → route-safe string
  const toSlug = (str) => str.toLowerCase().replace(/ /g, "-");

  return (
    <div className="w-[95%] mx-auto border border-gray-200 shadow-md rounded-xl p-6 my-6 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 text-blue-700 text-2xl font-bold px-2">
        <PanelsTopLeft className="w-7 h-7 text-gray-800" />
        <span>CRT Modules</span>
      </div>

      <hr className="border-gray-300 mt-3 mb-5" />

      {/* Course Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {courseData.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(`/course/${toSlug(item.courseName)}`)}
            className="cursor-pointer"
          >
            <CourseTab imageUrl={item.imageUrl} courseName={item.courseName} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CRT;
