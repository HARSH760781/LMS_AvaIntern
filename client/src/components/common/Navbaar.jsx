import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "../../assets/ava logo.png";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Shield,
  Menu,
  X,
  ExternalLink,
  Zap,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const fullName = localStorage.getItem("fullName");
  const profileImage = localStorage.getItem("profileImage");
  const serverURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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

  const handleSwitchToLMS = () => {
    window.open("https://avainternlms.in", "_blank");
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <img
            src={logo}
            alt="EduLMS Logo"
            className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain"
          />
        </div>

        {/* Desktop Menu - Right side buttons */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Switch to LMS Button - Only visible on desktop */}
          {!isMobile && (
            <button
              onClick={handleSwitchToLMS}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-700 rounded-lg transition-colors hover:bg-blue-50  hover:border-blue-300"
            >
              <Zap className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium">Switch to LMS</span>
            </button>
          )}

          {/* Admin - Only for logged-in admins */}
          {isLoggedIn && role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 rounded-md transition-colors hover:bg-blue-50"
            >
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Admin</span>
            </button>
          )}

          {/* Profile (logged in) OR Login (not logged in) */}
          {isLoggedIn ? (
            <motion.div
              className="relative"
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <button className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-50 rounded-lg  hover:border-blue-300 transition-colors">
                <img
                  src={`${serverURL}/uploads/${profileImage}`}
                  className="w-8 h-8 rounded-full object-fill"
                  alt="profile"
                />
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showProfileDropdown && (
                <motion.div className="absolute right-0 mt-2 w-56 bg-white  rounded-lg shadow-xl z-50">
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

                  {/* Switch to LMS in dropdown - Always available in dropdown */}
                  <div
                    onClick={handleSwitchToLMS}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>Switch to LMS</span>
                    <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
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
          ) : (
            // Login button when not logged in
            <div className="flex items-center space-x-6">
              {/* Switch to LMS Button for non-logged in desktop users */}
              {!isMobile && (
                <button
                  onClick={handleSwitchToLMS}
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-700 rounded-lg transition-colors hover:bg-blue-50 border border-gray-200 hover:border-blue-300"
                >
                  <Zap className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-sm font-medium">Switch to LMS</span>
                </button>
              )}

              <motion.button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4 inline mr-2" /> Login
              </motion.button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            className="p-2 rounded-md border hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <div className="flex flex-col space-y-3 p-4">
            {/* Switch to LMS - Always in mobile menu */}
            <button
              onClick={handleSwitchToLMS}
              className="flex items-center justify-between px-4 py-3 text-gray-700 hover:text-blue-600 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center">
                <Zap className="w-5 h-5 mr-3 text-blue-600" />
                <span className="text-sm font-medium">Switch to LMS</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </button>

            {/* Admin - Mobile */}
            {isLoggedIn && role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Shield className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">Admin Dashboard</span>
              </button>
            )}

            {isLoggedIn ? (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <User className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">My Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-md border border-red-200 hover:border-red-300 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              // Login button when not logged in - Mobile
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-5 h-5 inline mr-2" /> Login
              </button>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
