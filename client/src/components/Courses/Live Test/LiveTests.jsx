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
        // console.log(data);

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
    <div className="border rounded-xl p-5 shadow animate-pulse bg-white/70">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
      <div className="h-10 bg-gray-300 rounded"></div>
    </div>
  );

  return (
    <div className="w-[90%] mx-auto pt-10 pb-16">
      <h1 className="text-4xl font-extrabold mb-6 text-[#1F3A8A] tracking-tight">
        Available Live Tests
      </h1>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tests.length === 0 && (
        <div className="flex flex-col items-center mt-20 opacity-90">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="No Tests"
            className="w-40 opacity-80"
          />
          <h2 className="text-2xl font-semibold text-gray-700 mt-5">
            No Tests Available
          </h2>
          <p className="mt-2 text-gray-500 text-center max-w-md">
            There are currently no live tests scheduled for your college and
            branch. Please check again later.
          </p>
        </div>
      )}

      {/* Tests Grid */}
      {!loading && tests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {tests.map((test) => (
            <div
              key={test._id}
              className="border rounded-xl shadow-md p-6 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <h2 className="text-2xl font-bold text-gray-900">{test.title}</h2>

              <span className="inline-block mt-3 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                {test.topic}
              </span>

              <p className="mt-4 text-gray-700">
                ⏳ Duration:{" "}
                <span className="font-medium">{test.duration} minutes</span>
              </p>

              <button
                className="
                  mt-6 px-5 py-3 
                  w-full text-white font-medium rounded-xl
                  bg-linear-to-r from-blue-600 to-blue-700
                  hover:from-blue-700 hover:to-blue-800
                  transition-all duration-300
                "
                onClick={() => navigate(`/start-test/${test._id}`)}
              >
                Start Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveTests;
