import React, { useState, useEffect } from "react";
import { User, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserPage = () => {
  const navigate = useNavigate();
  const serverURL = import.meta.env.VITE_BACKEND_URL;

  const [selectedRole, setSelectedRole] = useState(null); // "student" or "mentor"
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsersByRole = async (role) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // make sure token is stored
      if (!token) throw new Error("No token found");

      const res = await fetch(`${serverURL}/api/admin/users?role=${role}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ⚠ important
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
    fetchUsersByRole(role);
  };

  // Group students by college
  const groupByCollege = (students) => {
    return students.reduce((acc, student) => {
      const college = student.college || "Unknown College";
      if (!acc[college]) acc[college] = [];
      acc[college].push(student);
      return acc;
    }, {});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            User Management
          </h1>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm text-sm"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Role Selection */}
        {!selectedRole && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => handleRoleClick("student")}
              className="bg-white rounded-lg shadow p-5 cursor-pointer hover:shadow-md transition transform hover:-translate-y-1 flex flex-col items-center justify-center"
            >
              <GraduationCap className="w-12 h-12 text-green-600 mb-2" />
              <h2 className="text-lg font-semibold text-gray-900">Students</h2>
              <p className="text-gray-500 mt-1 text-center text-sm">
                View and manage all students
              </p>
            </div>

            <div
              onClick={() => handleRoleClick("mentor")}
              className="bg-white rounded-lg shadow p-5 cursor-pointer hover:shadow-md transition transform hover:-translate-y-1 flex flex-col items-center justify-center"
            >
              <User className="w-12 h-12 text-purple-600 mb-2" />
              <h2 className="text-lg font-semibold text-gray-900">Mentors</h2>
              <p className="text-gray-500 mt-1 text-center text-sm">
                View and manage all mentors
              </p>
            </div>
          </div>
        )}

        {/* Users Table */}
        {selectedRole && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-800 capitalize">
                {selectedRole}s
              </h2>
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setUsers([]);
                }}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
              >
                Back
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-gray-200"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No {selectedRole}s found.
              </div>
            ) : selectedRole === "student" ? (
              Object.entries(groupByCollege(users)).map(
                ([college, students]) => (
                  <div key={college} className="bg-white shadow rounded-lg p-4">
                    <h3 className="text-md font-semibold mb-3 text-gray-700">
                      {college}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">
                              S.No
                            </th>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">
                              Phone
                            </th>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">
                              Joined
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {students.map((user, idx) => (
                            <tr
                              key={user._id || user.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-2 text-gray-500">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-2 flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                  {user.fullName
                                    ? user.fullName.charAt(0).toUpperCase()
                                    : "?"}
                                </div>
                                <span className="text-gray-900">
                                  {user.fullName || "Unnamed Student"}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-gray-500">
                                {user.email}
                              </td>
                              <td className="px-4 py-2 text-gray-500">
                                {user.phone}
                              </td>
                              <td className="px-4 py-2 text-gray-500 capitalize">
                                {user.role}
                              </td>
                              <td className="px-4 py-2 text-gray-500">
                                {new Date(user.joinDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="bg-white shadow rounded-lg p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user, idx) => (
                        <tr
                          key={user._id || user.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-2 flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm">
                              {user.fullName
                                ? user.fullName.charAt(0).toUpperCase()
                                : "?"}
                            </div>
                            <span className="text-gray-900">
                              {user.fullName || "Unnamed Mentor"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-4 py-2 text-gray-500">
                            {user.phone}
                          </td>
                          <td className="px-4 py-2 text-gray-500 capitalize">
                            {user.role}
                          </td>
                          <td className="px-4 py-2 text-gray-500">
                            {new Date(user.joinDate).toLocaleDateString()}
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
