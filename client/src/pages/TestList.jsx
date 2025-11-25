import React, { useEffect, useState } from "react";
import axios from "axios";
import { Folder, FileSpreadsheet } from "lucide-react";

const TestList = () => {
  const [tests, setTests] = useState([]);
  const serverURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTests = async () => {
      const res = await axios.get(`${serverURL}/api/tests`);
      setTests(res.data.tests);
    };
    fetchTests();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Folder /> Available Aptitude Tests
      </h2>

      {tests.map((test) => (
        <div
          key={test._id}
          className="border p-4 rounded-lg shadow-sm mb-4 hover:shadow-md transition"
        >
          <div className="font-bold text-lg">{test.testName}</div>
          <div className="text-sm text-gray-600">
            {test.subject} • {test.topic}
          </div>

          <div className="mt-3 flex gap-3 flex-wrap">
            {test.files.map((f) => (
              <a
                key={f._id}
                href={`${serverURL}/${f.path}`}
                target="_blank"
                className="flex items-center gap-2 px-3 py-1 border rounded shadow-sm bg-gray-50"
              >
                <FileSpreadsheet size={18} /> {f.originalName}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestList;
