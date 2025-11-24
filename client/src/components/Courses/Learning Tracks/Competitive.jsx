import React from "react";
import { Menu, PanelsTopLeft } from "lucide-react";
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
    <div className=" w-[95%] mx-auto border border-gray-200 shadow-xl rounded-xl p-4 my-5 bg-white hover:shadow-2xl transition">
      <div className=" flex items-center gap-3 text-blue-700 px-7 text-3xl font-bold font-sans m-3">
        <PanelsTopLeft className="w-7 h-7 text-gray-800 " />
        <span>Competetive Coding</span>
      </div>
      <hr className=" px-5 border-black border-4 mt-1" />

      <div className="courseTab-Section flex m-auto w-full justify-around p-1">
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
