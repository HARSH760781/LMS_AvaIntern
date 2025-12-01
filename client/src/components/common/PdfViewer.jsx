import React, { useState, useEffect } from "react";
import { X, Minus, Plus, Maximize, Minimize } from "lucide-react";

export default function PdfViewer({ material, onClose, serverURL }) {
  const [scale, setScale] = useState(1.1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!material) return null;

  const pdfUrl = `${serverURL}/${material.filePath}#toolbar=0&navpanes=0&scrollbar=0`;

  // Zoom Controls
  const zoomIn = () => setScale((p) => Math.min(p + 0.15, 3));
  const zoomOut = () => setScale((p) => Math.max(p - 0.15, 0.5));
  const resetZoom = () => setScale(1.1);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeys = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          zoomIn();
        } else if (e.key === "-") {
          e.preventDefault();
          zoomOut();
        } else if (e.key === "0") {
          e.preventDefault();
          resetZoom();
        }
      }

      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, []);

  const handleIframeLoad = () => setIsLoading(false);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        isFullscreen ? "p-0" : "p-5"
      }`}
      style={{
        backdropFilter: "blur(12px)",
        background: "rgba(0,0,0,0.5)",
      }}
    >
      {/* Viewer Container */}
      <div
        className={`flex flex-col shadow-2xl bg-white/20 rounded-2xl border border-white/30 backdrop-blur-xl transition-all duration-500 ${
          isFullscreen
            ? "w-full h-full rounded-none"
            : "w-full max-w-7xl h-[95vh]"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3 bg-white/30 border-b border-white/20 rounded-t-2xl">
          <h2 className="text-white font-semibold text-lg tracking-wide truncate">
            {material.fileName}
          </h2>

          <div className="flex items-center space-x-3">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-xl border border-white/30">
              <button
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className="p-1 hover:bg-white/20 rounded disabled:opacity-30"
              >
                <Minus className="text-white w-4 h-4" />
              </button>

              <span className="text-white text-sm min-w-[45px] text-center">
                {Math.round(scale * 100)}%
              </span>

              <button
                onClick={zoomIn}
                disabled={scale >= 3}
                className="p-1 hover:bg-white/20 rounded disabled:opacity-30"
              >
                <Plus className="text-white w-4 h-4" />
              </button>

              <button
                onClick={resetZoom}
                className="text-white text-xs ml-2 hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-xl border border-white/30"
            >
              {isFullscreen ? (
                <Minimize className="text-white w-4 h-4" />
              ) : (
                <Maximize className="text-white w-4 h-4" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-400/40 rounded-xl bg-red-500/20"
            >
              <X className="text-white w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF BODY */}
        <div className="flex-1 relative overflow-auto bg-gray-100/40">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-md">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-800 mt-3 font-medium">
                  Loading your document…
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-center items-start p-10">
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
                transition: "transform 0.25s ease",
              }}
              className="bg-white shadow-xl rounded-lg"
            >
              <iframe
                src={pdfUrl}
                onLoad={handleIframeLoad}
                className="border-0 rounded-lg"
                style={{
                  width: "816px",
                  height: "1056px",
                }}
                title="PDF"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-2 bg-white/30 border-t border-white/20 text-white text-xs tracking-wide flex justify-between">
          <span>Zoom: {Math.round(scale * 100)}%</span>
          <span>{isFullscreen ? "Fullscreen mode" : "Normal mode"}</span>
          <span>Secure PDF Viewer</span>
        </div>
      </div>
    </div>
  );
}
