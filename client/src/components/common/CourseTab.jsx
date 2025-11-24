const CourseTab = ({ imageUrl, courseName }) => {
  return (
    <div className="w-40 bg-white border h-full border-gray-200 shadow-md rounded-xl flex flex-col items-center justify-between p-2 hover:shadow-lg transition cursor-pointer">
      <img
        src={imageUrl}
        alt={courseName}
        className="w-20 h-20 object-contain"
      />

      <h5 className="text-center text-sm font-semibold text-gray-800">
        {courseName}
      </h5>
    </div>
  );
};

export default CourseTab;
