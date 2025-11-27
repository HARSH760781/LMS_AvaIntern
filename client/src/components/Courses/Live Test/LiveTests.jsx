import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LiveTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const serverURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${serverURL}/api/tests/user-tests`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Error fetching tests:", data.message);
          setTests([]);
        } else {
          setTests(data.tests || []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }

      setLoading(false);
    };

    fetchTests();
  }, []);

  // Skeleton loader
  const SkeletonCard = () => (
    <div className="border rounded-xl p-4 sm:p-5 shadow animate-pulse bg-white/70">
      <div className="h-5 sm:h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
      <div className="h-8 sm:h-10 bg-gray-300 rounded"></div>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto py-6 sm:py-10 lg:py-16 max-w-7xl">
      {/* Header */}
      <div className="text-center sm:text-left mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold sm:font-extrabold mb-3 sm:mb-4 text-gray-900 tracking-tight">
          Available Live Tests
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto sm:mx-0">
          Practice with timed assessments and improve your skills
        </p>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tests.length === 0 && (
        <div className="flex flex-col items-center mt-10 sm:mt-20 opacity-90 px-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="No Tests"
            className="w-24 sm:w-32 lg:w-40 opacity-80"
          />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mt-4 sm:mt-5 text-center">
            No Tests Available
          </h2>
          <p className="mt-2 sm:mt-3 text-gray-500 text-center text-sm sm:text-base max-w-md">
            There are currently no live tests scheduled for your college and
            branch. Please check again later.
          </p>
        </div>
      )}

      {/* Tests Grid */}
      {!loading && tests.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {tests.map((test) => (
            <div
              key={test._id}
              className="border rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md p-4 sm:p-6 bg-white hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Test Title */}
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 line-clamp-2">
                {test.title}
              </h2>

              {/* Topic Badge */}
              <span className="inline-block mt-2 sm:mt-3 px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-full">
                {test.topic}
              </span>

              {/* Duration */}
              <p className="mt-3 sm:mt-4 text-gray-700 text-sm sm:text-base">
                ⏳ Duration:{" "}
                <span className="font-medium">{test.duration} minutes</span>
              </p>

              {/* Questions Count (if available) */}
              {test.totalQuestions && (
                <p className="mt-2 text-gray-600 text-sm sm:text-base">
                  📊 Questions:{" "}
                  <span className="font-medium">{test.totalQuestions}</span>
                </p>
              )}

              {/* Start Button */}
              <button
                className="
                  mt-4 sm:mt-6 px-4 sm:px-5 py-2.5 sm:py-3 
                  w-full text-white font-medium rounded-lg sm:rounded-xl
                  bg-gradient-to-r from-blue-600 to-blue-700
                  hover:from-blue-700 hover:to-blue-800
                  transition-all duration-300
                  text-sm sm:text-base
                  hover:shadow-lg
                "
                onClick={() => navigate(`/start-test/${test._id}`)}
              >
                Start Test
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button (if pagination needed) */}
      {!loading && tests.length > 0 && tests.length >= 8 && (
        <div className="flex justify-center mt-8 sm:mt-12">
          <button className="px-6 sm:px-8 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base">
            Load More Tests
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveTests;
