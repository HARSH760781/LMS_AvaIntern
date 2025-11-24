import React from "react";
import { useNavigate } from "react-router-dom";
import { PanelsTopLeft } from "lucide-react";
import CourseTab from "../../common/CourseTab";

const courseData = [
  {
    imageUrl:
      "https://ik.imagekit.io/y7csnuuzj/Icons/APTITUDE.png?updatedAt=1763706236262",
    courseName: "Aptitude Tests",
    route: "/aptitude-tests", // Add your actual route here
  },
  {
    imageUrl:
      "https://ik.imagekit.io/y7csnuuzj/Icons/pROGRAMMING.png?updatedAt=1763706236186",
    courseName: "Programming Tests",
    route: "/programming-tests", // Add your actual route here
  },
  {
    imageUrl:
      "https://ik.imagekit.io/y7csnuuzj/Icons/tYPING.png?updatedAt=1763706236099",
    courseName: "Typing Tests",
    route: "/typing-tests", // Add your actual route here
  },
  {
    imageUrl: "https://ik.imagekit.io/y7csnuuzj/Icons/Test.png",
    courseName: "Live Tests",
    route: "/live-tests",
  },
];

const Hiring = () => {
  const navigate = useNavigate();

  const handleCourseClick = (courseName, route) => {
    console.log(`Navigating to ${courseName}: ${route}`);

    // You can add any additional logic here before navigation
    switch (courseName) {
      case "Aptitude Tests":
        // Add any specific logic for aptitude tests
        break;
      case "Programming Tests":
        // Add any specific logic for programming tests
        break;
      case "Typing Tests":
        // Add any specific logic for typing tests
        break;
      case "Live Tests":
        // Add any specific logic for live tests
        break;
      default:
        break;
    }

    // Navigate to the specified route
    navigate(route);
  };

  return (
    <div className="w-[95%] mx-auto border border-gray-200 shadow-xl rounded-xl p-4 my-5 bg-white hover:shadow-2xl transition">
      {/* Header */}
      <div className="flex items-center gap-3 text-blue-700 px-7 text-3xl font-bold font-sans m-3">
        <PanelsTopLeft className="w-7 h-7 text-gray-800" />
        <span>Hiring Assessments</span>
      </div>

      <hr className="px-5 border-black border-4 mt-1" />

      {/* Course Tabs Section */}
      <div className="courseTab-Section flex m-auto w-full justify-around p-1">
        {courseData.map((item, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => handleCourseClick(item.courseName, item.route)}
          >
            <CourseTab imageUrl={item.imageUrl} courseName={item.courseName} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hiring;
