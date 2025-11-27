import React, { useState, useEffect } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

const Profile = () => {
  const [imageError, setImageError] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();
  const serverURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${serverURL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        const data = await res.json();

        setUserDetail({
          name: data.fullName,
          email: data.email,
          role: data.role,
          profileImage: data.profileImage
            ? `${serverURL}/uploads/${data.profileImage}`
            : null,
          joinDate: data.joinDate,
        });
      } catch {
        localStorage.clear();
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate, serverURL]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const token = localStorage.getItem("token");

    try {
      await fetch(`${serverURL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {}

    localStorage.clear();
    navigate("/login", { replace: true });
    setIsLoggingOut(false);
  };

  const handleProfileNavigate = () => {
    navigate("/profile");
  };

  if (!userDetail) {
    return (
      <div className="py-6 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header / Cover */}
      <div
        className="h-28 bg-cover bg-center relative"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg">
              {userDetail.profileImage && !imageError ? (
                <img
                  src={userDetail.profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-white">
                  {userDetail.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="pt-14 pb-6 px-3 text-center">
        <h2 className="text-xl font-bold text-gray-900">{userDetail.name}</h2>
        <p className="text-gray-600 text-sm mt-1">{userDetail.email}</p>

        <div className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mt-3 mb-4">
          <User className="w-4 h-4 mr-1" />
          {userDetail.role}
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleProfileNavigate}
            className="flex-1 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium transition shadow"
          >
            <Settings className="w-4 h-4 mr-1" />
            Edit Profile
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg text-sm font-medium transition border border-gray-300 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4 mr-1" />
            {isLoggingOut ? "Logging..." : "Logout"}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-5 pt-4 border-t border-gray-200">
          Member since{" "}
          {userDetail.joinDate
            ? new Date(userDetail.joinDate).toLocaleDateString("en-GB")
            : "2025"}
        </p>
      </div>
    </div>
  );
};

export default Profile;
