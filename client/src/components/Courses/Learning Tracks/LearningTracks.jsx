import React from "react";
import { Menu, PanelsTopLeft } from "lucide-react";
import CourseTab from "../../common/CourseTab";

const courseDataFoundation = [
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/C.png",
    courseName: "C",
  },
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
  return (
    <div className=" w-[95%] mx-auto border border-gray-200 shadow-xl rounded-xl p-4 my-5 bg-white hover:shadow-2xl transition">
      <div className=" flex items-center gap-3 text-blue-700 px-7 text-3xl font-bold font-sans m-3">
        <PanelsTopLeft className="w-7 h-7 text-gray-800 " />
        <span>Learning Tracks</span>
      </div>
      <hr className=" px-5 border-black border-4 mt-1" />

      <h4 className="text-xl font-semibold px-7 mt-4 mb-2">
        Technical Foundation <hr />
      </h4>

      <div className="grid grid-cols-4 gap-6 p-4">
        {courseDataFoundation.map((item, index) => (
          <CourseTab
            key={index}
            imageUrl={item.imageUrl}
            courseName={item.courseName}
          />
        ))}
      </div>

      <h4 className="text-xl font-semibold px-7 mt-4 mb-2">
        Technical Advanced <hr />
      </h4>

      <div className="grid grid-cols-4 gap-6 p-4">
        {courseDataAdvance.map((item, index) => (
          <CourseTab
            key={index}
            imageUrl={item.imageUrl}
            courseName={item.courseName}
          />
        ))}
      </div>

      <h4 className="text-xl font-semibold px-7 mt-4 mb-2">
        Full Stack Development <hr />
      </h4>

      <div className="grid grid-cols-3 gap-7 mx-auto p-4">
        {courseDataFullStack.map((item, index) => (
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

export default LearningTracks;
