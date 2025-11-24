import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import About from "../About/About";
import Profile from "../common/Profile";
import Hiring from "../Courses/Hiring Assessment/Hiring";
import CRT from "../Courses/CRT Module/CRT";
import LearningTracks from "../Courses/Learning Tracks/LearningTracks";
import Competitive from "../Courses/Learning Tracks/Competitive";
import CompanyMocks from "../Courses/Mocks/CompanyMocks";
const Home = () => {
  const [userProfile, setUserProfile] = useState(null);
  const userDetail = {
    name: localStorage.getItem("fullName"),
    profileImage: localStorage.getItem("profileImage"),
    email: localStorage.getItem("email"),
  };
  // console.log(userDetail);
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUserProfile({ name: "John Doe" });
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-5 ">
      <div className="mx-auto flex w-full">
        {/* Profile Name Tab Only */}
        <div className="bg-white rounded-xl w-[80%]  mx-auto  shadow-md border border-gray-200 p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome,{" "}
              <span className="text-blue-600">
                {userDetail?.name || "User"}
              </span>{" "}
              !
            </h1>
          </div>

          {/* Dynamic Content Placeholder */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-start">
              {/* Left side - Text content */}
              <div className="flex-1">
                <p className="text-gray-600 text-start">
                  Here's what's happening with your account today.
                  <strong className="text-gray-900 block mt-1">
                    {userDetail?.name}
                  </strong>
                </p>
              </div>

              {/* Right side - Calendar icon with today's day in Date/Month/Year format */}
              <div className="flex flex-col items-center ml-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date().getDate()}/{new Date().getMonth() + 1}/
                  {new Date().getFullYear()}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleDateString("en-US", { weekday: "long" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="w-[70%] m-2 p-2 shadow-2xl border">
          <About />
          <Hiring />
          <CRT />
          <LearningTracks />
          <Competitive />
          <CompanyMocks />
        </div>
        <div className="w-[30%] h-fit m-2 p-2 shadow-2xl border">
          <Profile />
        </div>
      </div>
    </div>
  );
};

export default Home;
