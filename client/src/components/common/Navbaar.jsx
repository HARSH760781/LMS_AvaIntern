import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const fullName = localStorage.getItem("fullName");
  const profileImage = localStorage.getItem("profileImage");

  const serverURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  const handleLogout = async () => {
    try {
      await fetch(`${serverURL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            onClick={() => navigate("/")}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EduLMS
            </h1>
          </motion.div>

          <div className="flex items-center space-x-4">
            {/* ADMIN BUTTON */}
            {isLoggedIn && role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md transition-colors"
              >
                <Shield className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Admin</span>
              </button>
            )}

            {/* USER PROFILE */}
            {isLoggedIn && (
              <motion.div
                className="relative"
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
              >
                <button className="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded-lg">
                  <img
                    src={`http://localhost:5000/uploads/${profileImage}`}
                    className="w-8 h-8 rounded-full object-fill"
                    alt="profile"
                  />
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showProfileDropdown && (
                  <motion.div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-xl">
                    <div className="px-4 py-2 border-b">
                      <p className="text-md font-medium">{fullName}</p>
                    </div>

                    <div
                      onClick={() => navigate("/profile")}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </div>

                    <div className="border-t">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* LOGIN BUTTON */}
            {!isLoggedIn && (
              <motion.button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"
              >
                <LogIn className="w-4 h-4 inline mr-2" /> Login
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
