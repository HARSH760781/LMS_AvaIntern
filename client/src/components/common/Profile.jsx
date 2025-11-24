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

      // ✅ Check if token exists before making API call
      if (!token) {
        console.log("❌ No token found, redirecting to login");
        navigate("/login");
        return;
      }

      try {
        console.log(
          "🔐 Fetching user with token:",
          token.substring(0, 20) + "..."
        );

        const res = await fetch(`${serverURL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            console.log("❌ Token invalid, clearing storage and redirecting");
            localStorage.clear();
            navigate("/login");
            return;
          }
          throw new Error(`Failed to fetch user details: ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ User data fetched successfully");
        setUserDetail({
          name: data.fullName,
          email: data.email,
          role: data.role,
          profileImage: data.profileImage
            ? `${serverURL}/uploads/${data.profileImage}`
            : null,
          joinDate: data.joinDate,
        });
      } catch (err) {
        console.error("💥 Fetch user error:", err);
        // If there's an error, clear storage and redirect
        localStorage.clear();
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate, serverURL]);

  // 🔹 FIXED: Logout handler with proper cleanup
  const handleLogout = async () => {
    setIsLoggingOut(true);

    // ✅ Get token BEFORE any operations
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("⚠️ No token found, proceeding with client logout");
      localStorage.clear();
      navigate("/login");
      return;
    }

    try {
      console.log("🔄 Calling logout API...");

      const response = await fetch(`${serverURL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Logout API successful:", result);
      } else {
        console.warn("⚠️ Logout API returned:", response.status);
        // Still proceed with logout even if API fails
      }
    } catch (error) {
      console.error("💥 Logout API error:", error);
      // Continue with client-side logout even if API fails
    } finally {
      // ✅ Clear ALL localStorage items
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("fullName");
      localStorage.removeItem("email");
      localStorage.removeItem("profileImage");

      console.log("🧹 LocalStorage cleared, redirecting to login...");

      // ✅ Use replace instead of navigate to prevent back button issues
      navigate("/login", { replace: true });
      setIsLoggingOut(false);
    }
  };

  // 🔹 Handle Profile navigation
  const handleProfileNavigate = () => {
    navigate("/profile"); // Make sure this matches your actual profile page route
  };

  if (!userDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-0 px-4">
      <div className="container max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header / Cover */}
          <div
            className="h-32 bg-cover bg-center relative"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")',
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-28 h-28 bg-white rounded-full p-1 shadow-lg">
                  {userDetail.profileImage && !imageError ? (
                    <img
                      src={userDetail.profileImage}
                      alt={userDetail.name || "User profile"}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white">
                      {userDetail.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-6 px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {userDetail.name}
            </h2>
            <p className="text-gray-600 mb-3">{userDetail.email}</p>
            <div className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-4">
              <User className="w-4 h-4 mr-1" />
              {userDetail.role}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleProfileNavigate}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Settings className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all duration-200 border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-5 h-5" />
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Member since {"  "}
                {userDetail.joinDate
                  ? new Date(userDetail.joinDate).toLocaleDateString("en-GB")
                  : "2025"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
