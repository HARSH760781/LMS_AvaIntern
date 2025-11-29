import { useNavigate } from "react-router-dom";
import { Shield, Home, AlertTriangle, Lock, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

const Unauthorized = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const pulseInterval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 2000);
    return () => clearInterval(pulseInterval);
  }, []);

  const handleGoHome = () => {
    setIsVisible(false);
    setTimeout(() => navigate("/"), 300);
  };

  const handleContactSupport = () => {
    window.open(
      "mailto:support@yourapp.com?subject=Unauthorized Access Issue",
      "_blank"
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 z-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-red-500/5 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl animate-ping"></div>
      </div>

      {/* Main Card */}
      <div
        className={`
        relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 
        transform transition-all duration-500 ease-out
        ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        w-full max-w-md
      `}
      >
        {/* Header with Icon */}
        <div className="relative p-8 text-center border-b border-gray-100">
          {/* Animated Icon Container */}
          <div
            className={`
            relative mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 
            rounded-2xl flex items-center justify-center shadow-lg
            transform transition-transform duration-1000
            ${pulse ? "scale-110" : "scale-100"}
          `}
          >
            <Shield className="w-10 h-10 text-white" />
            <div className="absolute inset-0 border-2 border-red-400/50 rounded-2xl animate-ping"></div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 text-sm">Authorization Required</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Error Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-red-800 text-sm">
                  Permission Denied
                </p>
                <p className="text-red-600 text-sm mt-1">
                  You don't have the necessary permissions to access this
                  resource.
                </p>
              </div>
            </div>

            {/* Possible Reasons */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Possible reasons:
              </h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  Your session may have expired
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  Insufficient user privileges
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  Resource requires special access
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 
                       text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl 
                       transform hover:-translate-y-0.5 transition-all duration-200 
                       hover:from-blue-700 hover:to-blue-800 group"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Return to Homepage</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleContactSupport}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 
                       text-gray-700 rounded-2xl font-medium border-2 border-gray-200 
                       hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <span>Contact Support</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Error Code:{" "}
            <span className="font-mono text-gray-700">403_FORBIDDEN</span>
          </p>
        </div>

        {/* Security Badge */}
        <div className="absolute -top-3 -right-3">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            SECURED
          </div>
        </div>
      </div>

      {/* Floating Security Elements */}
      <div className="absolute bottom-8 left-8 opacity-40">
        <div className="flex items-center gap-2 text-white/60">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono">System Protected</span>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
