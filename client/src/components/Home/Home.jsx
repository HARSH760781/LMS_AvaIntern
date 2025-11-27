import React, { useState, useEffect } from "react";
import { Calendar, User } from "lucide-react";
import About from "../About/About";
import Profile from "../common/Profile";
import Hiring from "../Courses/Hiring Assessment/Hiring";
import CRT from "../Courses/CRT Module/CRT";
import LearningTracks from "../Courses/Learning Tracks/LearningTracks";
import Competitive from "../Courses/Learning Tracks/Competitive";
import CompanyMocks from "../Courses/Mocks/CompanyMocks";

const Home = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const userDetail = {
    name: localStorage.getItem("fullName"),
    profileImage: localStorage.getItem("profileImage"),
    email: localStorage.getItem("email"),
  };

  useEffect(() => {
    setTimeout(() => {
      setUserProfile({ name: "John Doe" });
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-6">
      {/* Mobile Profile Button - Only visible on small screens */}
      <div className="xl:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowMobileProfile(!showMobileProfile)}
          className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <User className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Mobile Profile Overlay */}
      {showMobileProfile && (
        <div className="xl:hidden fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Profile
              </h3>
              <button
                onClick={() => setShowMobileProfile(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
            <div className="p-4">
              <Profile />
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Welcome,{" "}
              <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {userDetail?.name || "User"}
              </span>
              !
            </h1>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Ready to accelerate your learning journey with personalized
              assessments and tracks
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                  Here's what's happening with your account today. Stay focused
                  and keep progressing!
                </p>
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">
                    Active Now
                  </span>
                </div>
              </div>

              {/* Calendar Section */}
              <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-gray-900">
                    {new Date().getDate()}/{new Date().getMonth() + 1}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date().getFullYear()}
                  </span>
                  <span className="text-xs text-blue-600 font-semibold mt-1">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Content - Main Sections */}
          <div className="xl:w-[70%] space-y-6">
            <About />
            <Hiring />
            <CRT />
            <LearningTracks />
            <Competitive />
            <CompanyMocks />
          </div>

          {/* Right Sidebar - Profile - Only visible on xl screens and above */}
          <div className="hidden xl:block xl:w-[30%]">
            <div className="sticky top-6">
              <Profile />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
