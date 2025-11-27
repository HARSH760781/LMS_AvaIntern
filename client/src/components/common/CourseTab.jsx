import React from "react";
import { useNavigate } from "react-router-dom";

const CourseTab = ({
  imageUrl,
  courseName = "",
  category = "",
  description = "",
  size = "compact",
  isSingleCard = false,
}) => {
  const navigate = useNavigate();

  const slugify = (str = "") =>
    String(str)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\+\+/g, "pp")
      .replace(/[+]/g, "plus");

  const slugCourse = slugify(courseName);
  const slugCategory = slugify(category);

  const handleClick = () => {
    if (!slugCategory) navigate(`/course/${slugCourse}`);
    else navigate(`/course/${slugCategory}/${slugCourse}`);
  };

  const sizeConfig = {
    compact: {
      container: "w-full",
      image: "w-16 h-16 sm:w-20 sm:h-20",
      text: "text-xs sm:text-sm",
      padding: "p-4",
    },
    medium: {
      container: "w-full",
      image: "w-20 h-20 sm:w-24 sm:h-24",
      text: "text-sm sm:text-base",
      padding: "p-5",
    },
  };

  const config = sizeConfig[size] || sizeConfig.compact;

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white border border-gray-200 shadow-md rounded-xl 
        flex flex-col items-center justify-between 
        hover:shadow-lg transition cursor-pointer
        ${config.padding}
        h-full
        ${isSingleCard ? "single-card" : config.container}
      `}
    >
      <img
        src={imageUrl}
        alt={courseName}
        className={`${config.image} object-contain`}
      />

      <h5
        className={`text-center font-semibold text-gray-900 ${config.text} mt-2`}
      >
        {courseName}
      </h5>

      {description && (
        <p className="text-center text-gray-600 text-xs sm:text-sm mt-1">
          {description}
        </p>
      )}
    </div>
  );
};

export default CourseTab;
