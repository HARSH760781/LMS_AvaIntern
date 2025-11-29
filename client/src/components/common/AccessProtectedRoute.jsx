import { useEffect, useState } from "react";
import { ShieldAlert, Mail, Phone } from "lucide-react";

const AccessProtectedRoute = ({ children }) => {
  const [verified, setVerified] = useState(null);
  const [loading, setLoading] = useState(true);

  const email = localStorage.getItem("email");

  const API_KEY = "AIzaSyC2lNk6eWI53IdeeNvwfeXquRGBKAOndDY";
  const SHEET_ID = "18UnaTDvd7zXf8lZdxjh3QvARBTz-AmN4Y8f-_LlDzoA";
  const SHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A:A?key=${API_KEY}`;

  useEffect(() => {
    if (!email) {
      setVerified(false);
      setLoading(false);
      return;
    }

    const AccessProtectedRoute = async () => {
      try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();

        const allowedEmails = data.values.flat();

        setVerified(allowedEmails.includes(email));
      } catch (err) {
        console.error("Google Sheet Error:", err);
        setVerified(false);
      }
      setLoading(false);
    };

    AccessProtectedRoute();
  }, [email]);

  // Loading Screen (Optional)
  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white animate-wave1"></div>
          <div className="w-3 h-3 rounded-full bg-white animate-wave2"></div>
          <div className="w-3 h-3 rounded-full bg-white animate-wave3"></div>
        </div>

        <style>{`
        @keyframes wave {
          0% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-8px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.4; }
        }

        .animate-wave1 {
          animation: wave 0.6s infinite ease-in-out;
        }
        .animate-wave2 {
          animation: wave 0.6s infinite ease-in-out 0.15s;
        }
        .animate-wave3 {
          animation: wave 0.6s infinite ease-in-out 0.3s;
        }
      `}</style>
      </div>
    );

  if (!verified)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-8 max-w-md w-full text-center flex flex-col items-center gap-6 animate-fadeIn">
          {/* Icon */}
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-500/20 border border-red-400/30">
            <ShieldAlert size={42} className="text-red-400" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Access Denied
          </h2>
          <p className="text-gray-200 leading-relaxed">
            You are not authorized to access this portal. If you believe this is
            a mistake, please contact our support team.
          </p>

          {/* Support Section */}
          <div className="w-full text-left bg-white/10 border border-white/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3 text-white">
              <Mail size={20} className="text-blue-300" />
              <span className="text-sm">support@example.com</span>
            </div>

            <div className="flex items-center gap-3 text-white">
              <Phone size={20} className="text-green-300" />
              <span className="text-sm">+91 98765 43210</span>
            </div>
          </div>

          {/* Go Home Button */}
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 px-6 py-2 rounded-xl bg-red-200 hover:bg-white/30 border border-white/30 text-red-600 backdrop-blur-lg transition-all font-medium shadow-lg"
          >
            Back to Home
          </button>
        </div>

        {/* Fade-in Animation */}
        <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      </div>
    );

  // Authorized
  return children;
};

export default AccessProtectedRoute;
