// src/components/common/PdfViewer.jsx
import React, { useState, useEffect } from "react";
import { X, Minus, Plus, Maximize } from "lucide-react";

export default function PdfViewer({ material, onClose, serverURL }) {
  const [scale, setScale] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!material) return null;

  const pdfUrl = `${serverURL}/${material.filePath}#toolbar=0&navpanes=0&scrollbar=0`;

  const zoomIn = () => setScale((p) => Math.min(p + 0.2, 3));
  const zoomOut = () => setScale((p) => Math.max(p - 0.2, 0.6));
  const resetZoom = () => setScale(1.2);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "=":
          case "+":
            e.preventDefault();
            zoomIn();
            break;
          case "-":
            e.preventDefault();
            zoomOut();
            break;
          case "0":
            e.preventDefault();
            resetZoom();
            break;
        }
      }
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [onClose]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isFullscreen ? "p-0" : "p-4"
      }`}
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    >
      <div
        className={`bg-green-300 rounded-2xl flex flex-col shadow-2xl border border-gray-200 transition-all duration-300 ${
          isFullscreen
            ? "w-full h-full rounded-none"
            : "w-full max-w-7xl h-[95vh]"
        }`}
      >
        {/* Minimal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-blue-400 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900 truncate max-w-2xl">
              {material.fileName}
            </h2>
          </div>

          {/* Compact Controls */}
          <div className="flex items-center space-x-3">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <span className="text-sm text-gray-600 font-medium">Zoom:</span>
              <button
                onClick={zoomOut}
                disabled={scale <= 0.6}
                className="p-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-200 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Zoom Out (Ctrl -)"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="text-sm font-medium text-gray-700 min-w-[45px] text-center">
                {Math.round(scale * 100)}%
              </span>

              <button
                onClick={zoomIn}
                disabled={scale >= 3}
                className="p-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-200 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Zoom In (Ctrl +)"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={resetZoom}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-all duration-200"
                title="Reset Zoom (Ctrl 0)"
              >
                Reset
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200"
              title={
                isFullscreen
                  ? "Exit Fullscreen (F11)"
                  : "Enter Fullscreen (F11)"
              }
            >
              <Maximize className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Container - Fixed size, only content zooms */}
        <div className="flex-1 bg-gray-50 relative overflow-auto">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-700 text-sm">Loading PDF document...</p>
              </div>
            </div>
          )}

          {/* PDF Content with Zoom - This container scrolls */}
          <div className="w-full h-full flex items-start justify-center p-8">
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              <iframe
                src={pdfUrl}
                className="border-0"
                title={material.fileName || "PDF Document"}
                onLoad={handleIframeLoad}
                style={{
                  width: "816px", // Standard A4 width in pixels at 96dpi
                  height: "1056px", // Standard A4 height
                  opacity: isLoading ? 0 : 1,
                  transition: "opacity 0.3s ease-in-out",
                }}
              />
            </div>
          </div>

          {/* Help Text */}
          {!isLoading && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="flex items-center space-x-4">
                <span>Scroll to navigate • Ctrl+/- to zoom</span>
              </span>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Current zoom: {Math.round(scale * 100)}%</span>
              <span>•</span>
              <span>{isFullscreen ? "Fullscreen mode" : "Windowed mode"}</span>
            </div>
            <span>Secure PDF Viewer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
