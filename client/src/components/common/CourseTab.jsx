import { useNavigate } from "react-router-dom";

const CourseTab = ({ imageUrl, courseName = "", category = "" }) => {
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
    // if category is empty → navigate to simple course page
    if (!slugCategory) {
      navigate(`/course/${slugCourse}`);
    } else {
      navigate(`/course/${slugCategory}/${slugCourse}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="w-40 bg-white border h-full border-gray-200 shadow-md rounded-xl flex flex-col items-center justify-between p-2 hover:shadow-lg transition cursor-pointer"
    >
      <img
        src={imageUrl}
        alt={courseName}
        className="w-20 h-20 object-contain"
      />

      <h5 className="text-center text-sm font-semibold text-gray-800">
        {courseName || "Course"}
      </h5>
    </div>
  );
};

export default CourseTab;
