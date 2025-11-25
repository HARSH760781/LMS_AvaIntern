import React, { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  Building,
  ArrowLeft,
  Users,
  Mail,
  Phone,
  Calendar,
  Filter,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserPage = () => {
  const navigate = useNavigate();
  const serverURL = import.meta.env.VITE_BACKEND_URL;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState("");

  // Fetch users based on role
  const fetchUsersByRole = async (role) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch(`${serverURL}/api/admin/users?role=${role}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }

      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
    setLoading(false);
  };

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setSelectedCollege(""); // reset college filter when switching role
    fetchUsersByRole(role);
  };

  // Grouping students by college
  const groupByCollege = (students) => {
    return students.reduce((acc, student) => {
      const college = student.college || "Unknown College";
      if (!acc[college]) acc[college] = [];
      acc[college].push(student);
      return acc;
    }, {});
  };

  const groupedStudents = groupByCollege(users);
  const collegeList = Object.keys(groupedStudents);

  // Stats for dashboard
  const totalStudents = users.filter((user) => user.role === "student").length;
  const totalMentors = users.filter((user) => user.role === "mentor").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage students and mentors across your institution
            </p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-xl shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-300 font-medium flex items-center justify-center space-x-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Role Selection Cards */}
        {!selectedRole && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Students Card */}
            <div
              onClick={() => handleRoleClick("student")}
              className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Students
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  View and manage all student accounts, track progress, and
                  monitor performance
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  {/* <Users className="w-4 h-4" /> */}
                  {/* <span>{totalStudents} registered students</span> */}
                </div>
              </div>
            </div>

            {/* Mentors Card */}
            <div
              onClick={() => handleRoleClick("mentor")}
              className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <User className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Mentors
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Manage mentor profiles, assign courses, and oversee teaching
                  activities
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  {/* <Users className="w-4 h-4" /> */}
                  {/* <span>{totalMentors} active mentors</span> */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {selectedRole && (
          <div className="space-y-8">
            {/* Header with Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedRole === "student"
                        ? "bg-green-100 text-green-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {selectedRole === "student" ? (
                      <GraduationCap className="w-6 h-6" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 capitalize">
                      {selectedRole}s Management
                    </h2>
                    <p className="text-gray-600">
                      {users.length} {selectedRole}(s) found across{" "}
                      {collegeList.length} institutions
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setSelectedRole(null);
                      setUsers([]);
                      setSelectedCollege("");
                    }}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Change Role</span>
                  </button>
                </div>
              </div>
            </div>

            {/* College Filter Section */}
            {selectedRole === "student" && collegeList.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Filter className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filter by Institution
                  </h3>
                </div>
                <div className="max-w-md">
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={selectedCollege}
                      onChange={(e) => setSelectedCollege(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900 font-medium appearance-none"
                    >
                      <option value="">
                        All Institutions ({collegeList.length})
                      </option>
                      {collegeList.map((college, idx) => (
                        <option key={idx} value={college}>
                          {college}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Loading {selectedRole} data
                </h3>
                <p className="text-gray-600">
                  Please wait while we fetch the information...
                </p>
              </div>
            )}

            {/* Empty State */}
            {!loading && users.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No {selectedRole}s Found
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  There are currently no {selectedRole}s registered in the
                  system.
                  {selectedRole === "student"
                    ? " Students will appear here once they create accounts."
                    : " Mentors will appear here once they are added to the platform."}
                </p>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-300"
                >
                  Back to Role Selection
                </button>
              </div>
            )}

            {/* Students Table with College Filter */}
            {!loading && selectedRole === "student" && users.length > 0 && (
              <div className="space-y-6">
                {selectedCollege
                  ? // Single college view
                    groupedStudents[selectedCollege] && (
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Building className="w-6 h-6 text-blue-600" />
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                  {selectedCollege}
                                </h3>
                                <p className="text-gray-600">
                                  {groupedStudents[selectedCollege].length}{" "}
                                  students enrolled
                                </p>
                              </div>
                            </div>
                            <span className="px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-full">
                              {groupedStudents[selectedCollege].length} Students
                            </span>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  #
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Student
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Contact
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Branch
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Joined
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {groupedStudents[selectedCollege].map(
                                (user, idx) => (
                                  <tr
                                    key={user._id}
                                    className="hover:bg-gray-50 transition-colors duration-200"
                                  >
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                      {idx + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-semibold text-green-600">
                                          {user.fullName?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-900">
                                            {user.fullName}
                                          </div>
                                          <div className="text-sm text-gray-500 capitalize">
                                            {user.role}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-2 text-sm text-gray-900 mb-1">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>{user.email}</span>
                                      </div>
                                      {user.phone && (
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                          <Phone className="w-4 h-4 text-gray-400" />
                                          <span>{user.phone}</span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <BookOpen className="w-3 h-3 mr-1" />
                                        {user.branch || "Not specified"}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>
                                          {user.createdAt || user.joinDate
                                            ? new Date(
                                                user.createdAt || user.joinDate
                                              ).toLocaleDateString()
                                            : "N/A"}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  : // All colleges view
                    collegeList.map((college) => (
                      <div
                        key={college}
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Building className="w-5 h-5 text-gray-600" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                {college}
                              </h3>
                            </div>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 font-medium rounded-full text-sm">
                              {groupedStudents[college].length} students
                            </span>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Branch
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Joined
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {groupedStudents[college].map((user, idx) => (
                                <tr
                                  key={user._id}
                                  className="hover:bg-gray-50 transition-colors duration-200"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-semibold text-green-600 text-sm">
                                        {user.fullName?.charAt(0) || "?"}
                                      </div>
                                      <span className="font-medium text-gray-900">
                                        {user.fullName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">
                                    {user.email}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">
                                      {user.branch || "—"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500">
                                    {user.createdAt || user.joinDate
                                      ? new Date(
                                          user.createdAt || user.joinDate
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
              </div>
            )}

            {/* Mentors Table */}
            {!loading && selectedRole === "mentor" && users.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="w-6 h-6 text-purple-600" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          All Mentors
                        </h3>
                        <p className="text-gray-600">
                          {users.length} mentors in the system
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-purple-100 text-purple-800 font-semibold rounded-full">
                      {users.length} Mentors
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Mentor
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Institution
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user, idx) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-semibold text-purple-600">
                                {user.fullName?.charAt(0) || "?"}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {user.fullName}
                                </div>
                                <div className="text-sm text-gray-500 capitalize">
                                  {user.role}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-900 mb-1">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {user.college || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>
                                {user.createdAt || user.joinDate
                                  ? new Date(
                                      user.createdAt || user.joinDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;
