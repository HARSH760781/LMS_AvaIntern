import React from "react";
import { PanelsTopLeft } from "lucide-react";
import CourseTab from "../../common/CourseTab";

const courseData = [
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/cpp.jpg",
    courseName: "100 C++ Programs",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/java.png",
    courseName: "100 Java Programs",
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/python.jpg",
    courseName: "100 Python Programs",
  },
];

const Competitive = () => {
  return (
    <div className="w-[95%] mx-auto border border-gray-200 shadow-lg rounded-xl p-2 py-3 my-6 bg-white hover:shadow-2xl transition-all duration-300">
      {/* Section Heading */}
      <div className="flex items-center gap-3 text-blue-700 px-4 text-2xl md:text-3xl font-bold my-3">
        <PanelsTopLeft className="w-7 h-7 text-blue-800" />
        <span> Competitive Coding</span>
      </div>

      {/* <hr className="border-blue-700 font-bold border-[2px] mt-3 mb-6 w-24 ml-4" /> */}

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6 px-3">
        {courseData.map((item, index) => (
          <CourseTab
            key={index}
            imageUrl={item.imageUrl}
            courseName={item.courseName}
          />
        ))}
      </div>
    </div>
  );
};

export default Competitive;
