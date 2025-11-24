import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  PlusCircle,
  X,
  Clock,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Play,
  Pause,
} from "lucide-react";
import { toast } from "react-hot-toast";

const TestManager = () => {
  const serverURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const [tests, setTests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(60); // minutes
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch tests using Fetch API
  const fetchTests = async () => {
    try {
      const response = await fetch(`${serverURL}/api/tests`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTests(data.tests || []);
    } catch (err) {
      console.error("Error fetching tests:", err);
      toast.error(
        err.message.includes("404")
          ? "Endpoint not found! Check backend route."
          : "Failed to load tests"
      );
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const validateFields = () => {
    const newErrors = {};
    if (!college.trim()) newErrors.college = "College is required.";
    if (!branch.trim()) newErrors.branch = "Branch is required.";
    if (!title.trim()) newErrors.title = "Test title is required.";
    if (!topic.trim()) newErrors.topic = "Test topic is required.";
    if (!duration || duration < 1)
      newErrors.duration = "Duration must be at least 1 minute.";
    if (!startTime) newErrors.startTime = "Start time is required.";
    if (!endTime) newErrors.endTime = "End time is required.";
    if (new Date(startTime) >= new Date(endTime))
      newErrors.endTime = "End time must be after start time.";
    if (!file) newErrors.file = "Please upload an Excel file.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    const formData = new FormData();
    formData.append("college", college);
    formData.append("branch", branch);
    formData.append("title", title);
    formData.append("topic", topic);
    formData.append("duration", duration);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await fetch(`${serverURL}/api/tests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific field validation errors
        if (data.missing) {
          const fieldErrors = {};
          Object.keys(data.missing).forEach((key) => {
            if (data.missing[key]) {
              fieldErrors[key] = `${key} is required`;
            }
          });
          setErrors(fieldErrors);
          throw new Error("Please fill all required fields");
        }
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      toast.success("Test created successfully!");
      setShowModal(false);
      resetForm();
      fetchTests();
    } catch (err) {
      console.error("Error creating test:", err);
      if (!err.message.includes("Please fill all required fields")) {
        toast.error(err.message || "Failed to create test");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCollege("");
    setBranch("");
    setTitle("");
    setTopic("");
    setDuration(60);
    setStartTime("");
    setEndTime("");
    setFile(null);
    setErrors({});
  };

  // Delete Handler
  const deleteTest = async (id) => {
    try {
      const res = await fetch(`${serverURL}/api/tests/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete test");
        return;
      }

      toast.success("Test deleted successfully");
      fetchTests();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const toggleTestStatus = async (testId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active";

      console.log(
        `🔄 Updating test ${testId} from ${currentStatus} to ${newStatus}`
      );

      const response = await fetch(`${serverURL}/api/tests/${testId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      // console.log("✅ Status update successful:", data);
      toast.success(`Test ${newStatus === "active" ? "activated" : "paused"}!`);
      fetchTests();
    } catch (err) {
      console.error("❌ Error updating test status:", err);
      toast.error(err.message || "Failed to update test status");
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      paused: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isTestActive = (test) => {
    const now = new Date();
    const start = new Date(test.startTime);
    const end = new Date(test.endTime);
    return now >= start && now <= end && test.status === "active";
  };

  // Filter and sort tests
  const filteredTests = tests.filter((test) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active") return isTestActive(test);
    return test.status === filterStatus;
  });

  const sortedTests = [...filteredTests].sort((a, b) => {
    let valA, valB;

    switch (sortKey) {
      case "title":
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
        break;
      case "duration":
        valA = a.duration;
        valB = b.duration;
        break;
      case "startTime":
        valA = new Date(a.startTime);
        valB = new Date(b.startTime);
        break;
      case "status":
        valA = a.status;
        valB = b.status;
        break;
      case "createdAt":
      default:
        valA = new Date(a.createdAt);
        valB = new Date(b.createdAt);
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="p-6 mx-auto min-h-screen w-[95%]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Test Management</h1>
          <p className="text-gray-600">Manage and monitor all tests</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Test</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">Filter by:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Tests</option>
            <option value="active">Active Now</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setSortKey("title");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  Test Details
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setSortKey("duration");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  Duration
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setSortKey("startTime");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  Schedule
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setSortKey("status");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTests.length > 0 ? (
                sortedTests.map((test) => (
                  <tr key={test._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {test.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {test.college} • {test.branch}
                          </div>
                          <div className="text-xs text-gray-400">
                            {test.topic}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 text-gray-700">
                        <Clock className="w-4 h-4" />
                        <span>{test.duration} mins</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center space-x-1 text-gray-700">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(test.startTime)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(test.startTime)} -{" "}
                          {formatTime(test.endTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          test.status
                        )}`}
                      >
                        {isTestActive(test) && "🔴 Live - "}
                        {test.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            toggleTestStatus(test._id, test.status)
                          }
                          className={`p-1 rounded ${
                            test.status === "active" || isTestActive(test)
                              ? "text-yellow-600 hover:bg-yellow-100"
                              : "text-green-600 hover:bg-green-100"
                          }`}
                          title={
                            test.status === "active"
                              ? "Pause Test"
                              : "Activate Test"
                          }
                        >
                          {test.status === "active" || isTestActive(test) ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Edit Test"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTest(test._id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Delete Test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <div>No tests found</div>
                    <button
                      onClick={() => setShowModal(true)}
                      className="text-blue-600 hover:text-blue-800 mt-2"
                    >
                      Create your first test
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Test Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <UploadCloud className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Create New Test
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 mb-1">
                      College Name *
                    </label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter college name"
                    />
                    {errors.college && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.college}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">
                      Branch Name *
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter branch name"
                    />
                    {errors.branch && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.branch}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter test title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">
                    Test Topic *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter test topic"
                  />
                  {errors.topic && (
                    <p className="text-red-500 text-sm mt-1">{errors.topic}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-600 mb-1">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.duration && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.duration}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.startTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.startTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.endTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">
                    Test File (Excel) *
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.file && (
                    <p className="text-red-500 text-sm mt-1">{errors.file}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Upload Excel file containing test questions
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center space-x-2 py-3 mt-4 rounded-xl bg-blue-600 text-white font-semibold ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Test...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      <span>Create Test</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestManager;
