import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminResults = () => {
  const [results, setResults] = useState({});
  const [selectedCollege, setSelectedCollege] = useState("");
  const [loading, setLoading] = useState(true);
  const serverURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${serverURL}/api/admin/all-results`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch");
        setResults(data.colleges || {});

        // Don't auto-select any college, let user choose
        // Remove the auto-selection logic
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const getScoreColor = (score, total) => {
    if (score === null) return "text-gray-500";
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600 font-semibold";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  // Convert students data to CSV
  const downloadCSV = () => {
    const students = results[selectedCollege] || [];
    if (students.length === 0) {
      toast.info("No data to download for this college");
      return;
    }

    const headers = [
      "Student",
      "Email",
      "Test",
      "Score",
      "Total",
      "Percentage",
      "Submitted Date",
      "Submitted Time",
    ];
    const rows = [];

    students.forEach((student) => {
      student.tests.forEach((test) => {
        const percentage =
          test.score !== null && test.total !== null
            ? ((test.score / test.total) * 100).toFixed(1) + "%"
            : "—";
        const submittedDate = test.submittedAt
          ? new Date(test.submittedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—";
        const submittedTime = test.submittedAt
          ? new Date(test.submittedAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—";

        rows.push([
          student.fullName,
          student.email,
          test.testTitle,
          test.score ?? "—",
          test.total ?? "—",
          percentage,
          submittedDate,
          submittedTime,
        ]);
      });
    });

    // Create CSV string
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    // Create link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedCollege}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6 font-sans bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const collegeNames = Object.keys(results);
  const students = selectedCollege ? results[selectedCollege] || [] : [];

  return (
    <div className="p-6 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Test Results Dashboard
            </h1>
            <p className="text-gray-600 text-sm">
              Overview of all test submissions across colleges
            </p>
          </div>
          {selectedCollege && students.length > 0 && (
            <button
              onClick={downloadCSV}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Download CSV
            </button>
          )}
        </div>

        {/* College Dropdown */}
        {/* College Dropdown */}
        {collegeNames.length > 0 && (
          <div className="mb-6 mx-3">
            <label className="block text-gray-700 font-medium mb-2">
              Select College :{"   "}
            </label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-60 mx-2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select a college
              </option>
              {collegeNames.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>
        )}

        {!selectedCollege ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏫</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Select a College
            </h3>
            <p className="text-gray-500 text-sm">
              Please select a college from the dropdown to view results.
            </p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Results Available for {selectedCollege}
            </h3>
            <p className="text-gray-500 text-sm">
              No test submissions have been recorded for this college yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Results Summary */}
            <div className="bg-blue-50 border-b border-blue-200 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {selectedCollege} - Results Summary
                  </h3>
                  <p className="text-sm text-blue-700">
                    {students.length} student(s) found
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">
                    Total Tests:{" "}
                    {students.reduce(
                      (total, student) => total + student.tests.length,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Test
                  </th>
                  <th className="text-center p-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-center p-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-center p-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) =>
                  student.tests.map((test, index) => (
                    <tr
                      key={`${student.userId}-${test.testId}-${index}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="font-medium text-gray-900 text-sm">
                          {student.fullName}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-600 text-sm">
                          {student.email}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-900 text-sm font-medium max-w-xs truncate">
                          {test.testTitle}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`text-sm font-medium ${getScoreColor(
                            test.score,
                            test.total
                          )}`}
                        >
                          {test.score !== null ? test.score : "—"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-gray-600 text-sm">
                          {test.total !== null ? test.total : "—"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {test.score !== null && test.total !== null ? (
                          <span
                            className={`text-sm font-medium ${getScoreColor(
                              test.score,
                              test.total
                            )}`}
                          >
                            {((test.score / test.total) * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-gray-500 text-sm">
                          {test.submittedAt
                            ? new Date(test.submittedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </div>
                        {test.submittedAt && (
                          <div className="text-gray-400 text-xs">
                            {new Date(test.submittedAt).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default AdminResults;
