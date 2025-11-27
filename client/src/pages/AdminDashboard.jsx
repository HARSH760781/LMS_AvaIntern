import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  User,
  GraduationCap,
  BookOpen,
  CreditCard,
  Settings,
  FileText,
  RefreshCw,
  Clock,
  BarChart3,
  Shield,
  Database,
  School,
  TestTube,
  Cog,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Cpu,
  Menu,
  X,
} from "lucide-react";

import StatCard from "../components/Admin/StatCard";
import MetricCard from "../components/Admin/MetricCard";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const serverURL = import.meta.env.VITE_BACKEND_URL;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [adminData, setAdminData] = useState({
    name: "Administrator",
    status: "Online",
    totalUsers: 0,
    totalStudents: 0,
    totalMentors: 0,
    activeUsers: 0,
    satisfactionRate: 94.2,
    completionRate: 87.5,
    currentTime: "",
    currentDate: "",
    lastUpdate: "",
    systemStats: {
      serverLoad: 45,
      databaseStatus: "Healthy",
      uptime: "99.9%",
      responseTime: "125ms",
      storageUsed: "65.3%",
      activeSessions: 207,
      networkLatency: "32ms",
      errorRate: "0.2%",
    },
    platformMetrics: {
      coursesPublished: 156,
      assignmentsSubmitted: 2847,
      examsCompleted: 1923,
      averageScore: 83.7,
    },
    applications: [
      { name: "Settings", description: "System configuration", icon: Cog },
      { name: "Credits", description: "Credit management", icon: CreditCard },
      { name: "Users", description: "User management", icon: Users },
      { name: "TMS", description: "Training management", icon: School },
      { name: "LMS", description: "Learning portal", icon: BookOpen },
      { name: "Tests", description: "Assessment system", icon: TestTube },
      { name: "Database", description: "Data management", icon: Database },
      {
        name: "Analytics",
        description: "Performance insights",
        icon: BarChart3,
      },
    ],
  });

  // --- Utility Functions ---
  const getCurrentAdmin = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return null;
    }
    return {
      name: localStorage.getItem("fullName") || "Administrator",
      email: localStorage.getItem("email") || "admin@system.com",
      role: localStorage.getItem("role") || "admin",
    };
  };

  const getDateTime = () => {
    const now = new Date();
    return {
      currentTime: now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      currentDate: now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      lastUpdate: `Last updated: ${now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`,
    };
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const res = await fetch(`${serverURL}/api/admin/user-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch user stats:", res.statusText);
        return null;
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching user stats:", err);
      return null;
    }
  };

  // --- Initialize Dashboard ---
  useEffect(() => {
    const initializeDashboard = async () => {
      const admin = getCurrentAdmin();
      const timeData = getDateTime();
      const userStats = await fetchUserStats();

      setAdminData((prev) => ({
        ...prev,
        name: admin?.name || prev.name,
        ...timeData,
        ...(userStats && {
          totalUsers: userStats.totalUsers,
          totalStudents: userStats.totalStudents,
          totalMentors: userStats.totalMentors,
          activeUsers: userStats.activeUsers,
        }),
      }));
    };

    initializeDashboard();

    // Update clock every second
    const timer = setInterval(() => {
      const timeData = getDateTime();
      setAdminData((prev) => ({ ...prev, ...timeData }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --- Dynamic stats updater (10s interval) ---
  useEffect(() => {
    const updateDynamicStats = () => {
      setAdminData((prev) => ({
        ...prev,
        satisfactionRate: Number((90 + Math.random() * 10).toFixed(1)),
        completionRate: Number((90 + Math.random() * 10).toFixed(1)),
        systemStats: {
          ...prev.systemStats,
          serverLoad: Math.floor(40 + Math.random() * 20),
          responseTime: `${80 + Math.floor(Math.random() * 70)}ms`,
          storageUsed: `${60 + Math.floor(Math.random() * 10)}%`,
          networkLatency: `${25 + Math.floor(Math.random() * 15)}ms`,
          activeSessions: 180 + Math.floor(Math.random() * 80),
          errorRate: `${(0.1 + Math.random() * 0.4).toFixed(2)}%`,
        },
      }));
    };

    updateDynamicStats();
    const interval = setInterval(updateDynamicStats, 10_000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    const admin = getCurrentAdmin();
    const timeData = getDateTime();

    setAdminData((prev) => ({
      ...prev,
      name: admin?.name || prev.name,
      ...timeData,
    }));

    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleProfileClick = () => navigate("/profile");

  const getStatusColor = (value, type = "percentage") => {
    if (type === "percentage") {
      if (value >= 90) return "text-green-400";
      if (value >= 80) return "text-yellow-400";
      return "text-red-400";
    }
    if (value <= 30) return "text-green-400";
    if (value <= 70) return "text-yellow-400";
    return "text-red-400";
  };

  // Close mobile menu when clicking on a link
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Menu Button */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-800">
              {adminData.currentTime}
            </div>
            <div className="text-xs text-gray-600">{adminData.currentDate}</div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg border border-blue-300 p-4 sm:p-6 mb-4 sm:mb-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <p className="text-blue-100 text-sm sm:text-base">
                  Welcome back,{" "}
                  <strong className="text-white">{adminData.name}</strong>
                </p>
                <div className="flex items-center space-x-1 bg-green-500 bg-opacity-20 text-green-300 px-2 py-1 rounded-full text-xs sm:text-sm border border-green-500 border-opacity-30 w-fit">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{adminData.status}</span>
                </div>
              </div>
            </div>

            {/* Desktop Time & Refresh */}
            <div className="hidden lg:flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {adminData.currentTime}
                </div>
                <div className="text-xs sm:text-sm text-blue-200">
                  {adminData.currentDate}
                </div>
              </div>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 ${
                  isRefreshing
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95"
                } text-white shadow-lg text-sm sm:text-base`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            </div>

            {/* Mobile Refresh Button */}
            <div className="lg:hidden flex justify-end mt-4">
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isRefreshing
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white shadow-lg text-sm`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <StatCard
                value={adminData.totalUsers}
                label="Total Users"
                Icon={Users}
                gradientFrom="from-blue-600"
                gradientTo="to-blue-800"
                border="border-blue-300"
                iconColor="text-blue-300"
                bgOpacity="bg-blue-500 bg-opacity-20 border-blue-400 border-opacity-30"
              />
              <StatCard
                value={adminData.totalStudents}
                label="Students"
                Icon={GraduationCap}
                gradientFrom="from-green-600"
                gradientTo="to-green-800"
                border="border-green-300"
                iconColor="text-green-300"
                bgOpacity="bg-green-500 bg-opacity-20 border-green-400 border-opacity-30"
              />
              <StatCard
                value={adminData.totalMentors}
                label="Mentors"
                Icon={User}
                gradientFrom="from-purple-600"
                gradientTo="to-purple-800"
                border="border-purple-300"
                iconColor="text-purple-300"
                bgOpacity="bg-purple-500 bg-opacity-20 border-purple-400 border-opacity-30"
              />
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <StatCard
                value={adminData.activeUsers}
                label="Active Users"
                Icon={TrendingUp}
                gradientFrom="from-orange-600"
                gradientTo="to-orange-800"
                border="border-orange-300"
                iconColor="text-orange-300"
                bgOpacity="bg-orange-500 bg-opacity-20 border-orange-400 border-opacity-30"
              />
              <StatCard
                value={`${adminData.satisfactionRate}%`}
                label="Satisfaction Rate"
                Icon={BarChart3}
                gradientFrom="from-teal-600"
                gradientTo="to-teal-800"
                border="border-teal-300"
                iconColor="text-teal-300"
                bgOpacity="bg-teal-500 bg-opacity-20 border-teal-400 border-opacity-30"
              />
              <StatCard
                value={`${adminData.completionRate}%`}
                label="Completion Rate"
                Icon={School}
                gradientFrom="from-indigo-600"
                gradientTo="to-indigo-800"
                border="border-indigo-300"
                iconColor="text-indigo-300"
                bgOpacity="bg-indigo-500 bg-opacity-20 border-indigo-400 border-opacity-30"
              />
            </div>

            {/* Platform Metrics */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl sm:rounded-2xl shadow-lg border border-gray-600 p-4 sm:p-6 text-white">
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
                <h3 className="font-semibold text-white text-lg sm:text-xl">
                  Platform Metrics
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard
                  value={adminData.platformMetrics.coursesPublished}
                  label="Courses"
                />
                <MetricCard
                  value={adminData.platformMetrics.assignmentsSubmitted.toLocaleString()}
                  label="Assignments"
                />
                <MetricCard
                  value={adminData.platformMetrics.examsCompleted.toLocaleString()}
                  label="Exams"
                />
                <MetricCard
                  value={`${adminData.platformMetrics.averageScore}%`}
                  label="Avg Score"
                />
              </div>
            </div>

            {/* Applications Section */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl sm:rounded-2xl shadow-lg border border-gray-600 p-4 sm:p-6 text-white">
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
                <h3 className="font-semibold text-white text-lg sm:text-xl">
                  System Applications
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Profile Setting */}
                <div
                  onClick={() => handleNavigation("/profile")}
                  className="bg-gray-800 bg-opacity-50 rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:scale-105 group border border-gray-600 text-center"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 border border-blue-400 border-opacity-30 group-hover:bg-blue-500 group-hover:bg-opacity-30 transition-colors">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-300 group-hover:text-white" />
                  </div>
                  <p className="font-medium text-white text-xs sm:text-sm mb-1">
                    Profile Setting
                  </p>
                  <p className="text-xs text-gray-300 group-hover:text-gray-200 leading-tight">
                    Manage your profile
                  </p>
                </div>

                {/* Users */}
                <div
                  onClick={() => handleNavigation("/users")}
                  className="bg-gray-800 bg-opacity-50 rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:scale-105 group border border-gray-600 text-center"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 border border-green-400 border-opacity-30 group-hover:bg-green-500 group-hover:bg-opacity-30 transition-colors">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-300 group-hover:text-white" />
                  </div>
                  <p className="font-medium text-white text-xs sm:text-sm mb-1">
                    Users
                  </p>
                  <p className="text-xs text-gray-300 group-hover:text-gray-200 leading-tight">
                    Manage all users
                  </p>
                </div>

                {/* Test */}
                <div
                  onClick={() => handleNavigation("/test")}
                  className="bg-gray-800 bg-opacity-50 rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:scale-105 group border border-gray-600 text-center"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-500 bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 border border-yellow-400 border-opacity-30 group-hover:bg-yellow-500 group-hover:bg-opacity-30 transition-colors">
                    <TestTube className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-300 group-hover:text-white" />
                  </div>
                  <p className="font-medium text-white text-xs sm:text-sm mb-1">
                    Test
                  </p>
                  <p className="text-xs text-gray-300 group-hover:text-gray-200 leading-tight">
                    Upload Tests for College
                  </p>
                </div>

                {/* Feedback */}
                <div
                  onClick={() => handleNavigation("/feedback")}
                  className="bg-gray-800 bg-opacity-50 rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:scale-105 group border border-gray-600 text-center"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 border border-red-400 border-opacity-30 group-hover:bg-red-500 group-hover:bg-opacity-30 transition-colors">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-300 group-hover:text-white" />
                  </div>
                  <p className="font-medium text-white text-xs sm:text-sm mb-1">
                    Feedback
                  </p>
                  <p className="text-xs text-gray-300 group-hover:text-gray-200 leading-tight">
                    View user feedback
                  </p>
                </div>

                {/* Results */}
                <div
                  onClick={() => handleNavigation("/admin/results")}
                  className="bg-gray-800 bg-opacity-50 rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:scale-105 group border border-gray-600 text-center"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-fuchsia-500 bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 border border-fuchsia-400 border-opacity-30 group-hover:bg-fuchsia-500 group-hover:bg-opacity-30 transition-colors">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-fuchsia-300 group-hover:text-white" />
                  </div>
                  <p className="font-medium text-white text-xs sm:text-sm mb-1">
                    Get Results
                  </p>
                  <p className="text-xs text-gray-300 group-hover:text-gray-200 leading-tight">
                    View user Result
                  </p>
                </div>

                {/* Upload Test Based on Topic */}
                <div
                  onClick={() => handleNavigation("/upload-options")}
                  className="bg-gray-800 bg-opacity-50 rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:scale-105 group border border-gray-600 text-center"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-500 bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 border border-orange-400 border-opacity-30 group-hover:bg-orange-500 group-hover:bg-opacity-30 transition-colors">
                    <TestTube className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-300 group-hover:text-white" />
                  </div>
                  <p className="font-medium text-white text-xs sm:text-sm mb-1">
                    Upload Test
                  </p>
                  <p className="text-xs text-gray-300 group-hover:text-gray-200 leading-tight">
                    Upload Test for Topic
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div
            className={`space-y-4 sm:space-y-6 ${
              isMobileMenuOpen ? "block" : "hidden lg:block"
            }`}
          >
            {/* Profile */}
            <div
              onClick={handleProfileClick}
              className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl sm:rounded-2xl shadow-lg border border-blue-300 p-4 sm:p-6 text-white hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center border border-blue-400 border-opacity-30 group-hover:bg-blue-500 group-hover:bg-opacity-30 transition-colors">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base sm:text-lg">
                    {adminData.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-200 group-hover:text-blue-100">
                    System Administrator
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-blue-200 group-hover:text-blue-100 text-center border-t border-blue-500 pt-2 sm:pt-3">
                Click to manage profile settings
              </p>
            </div>

            {/* System Status */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl sm:rounded-2xl shadow-lg border border-gray-600 p-4 sm:p-6 text-white">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                <h3 className="font-semibold text-white text-base sm:text-lg">
                  System Status
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {Object.entries(adminData.systemStats).map(([key, val]) => (
                  <div className="flex justify-between items-center" key={key}>
                    <span className="text-xs sm:text-sm text-gray-300">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span
                      className={`text-xs sm:text-sm ${getStatusColor(
                        parseFloat(val),
                        "percentage"
                      )}`}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
