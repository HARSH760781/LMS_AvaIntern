// src/components/common/ResponsivePdfViewer.jsx
import React, { useState, useRef, useEffect } from "react";
import { X, Minus, Plus, Maximize2, PanelTop } from "lucide-react";

export default function ResponsivePdfViewer({
  material,
  onClose,
  serverURL = "",
}) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  if (!material) return null;

  // Build the PDF URL
  const pdfUrl = serverURL
    ? `${serverURL}/${material.filePath}#view=fitH&toolbar=0`
    : `${material.filePath}#view=fitH&toolbar=0`;

  // Zoom Controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          containerRef.current.webkitRequestFullscreen();
        } else if (containerRef.current.msRequestFullscreen) {
          containerRef.current.msRequestFullscreen();
        }
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!material) return;

      // Ctrl + Plus or Ctrl + = for zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        handleZoomIn();
      }
      // Ctrl + Minus for zoom out
      else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      }
      // Ctrl + 0 for reset zoom
      else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        handleZoomReset();
      }
      // Escape to close
      else if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [material, onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
    >
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <PanelTop className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold truncate">{material.fileName}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            {/* <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom Out"
                disabled={zoomLevel <= 50}
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                onClick={handleZoomReset}
                className="px-2 py-1 text-sm font-medium min-w-[60px] text-center hover:bg-white hover:bg-opacity-30 rounded transition-all duration-200"
                aria-label="Reset Zoom"
              >
                {zoomLevel}%
              </button>

              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom In"
                disabled={zoomLevel >= 200}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div> */}

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-30 transition-all duration-200"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-30 transition-all duration-200"
              aria-label="Close PDF viewer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg">Loading PDF...</p>
          </div>
        )}

        {/* PDF Viewer */}
        <div className="h-[75vh] relative">
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            title={material.fileName}
            className="w-full h-full border-0"
            allow="fullscreen"
            loading="lazy"
            onLoad={() => setLoading(false)}
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "0 0",
              width: `${100 * (100 / zoomLevel)}%`,
              height: `${100 * (100 / zoomLevel)}%`,
              transition: "transform 0.2s ease",
            }}
          />

          {/* Zoom Hint
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
            Use <kbd className="px-2 py-1 bg-gray-800 rounded mx-1">Ctrl</kbd> +
            <kbd className="px-2 py-1 bg-gray-800 rounded mx-1">+</kbd> /
            <kbd className="px-2 py-1 bg-gray-800 rounded mx-1">-</kbd> to zoom
            •<kbd className="px-2 py-1 bg-gray-800 rounded mx-1">Esc</kbd> to
            close
          </div> */}
        </div>
      </div>
    </div>
  );
}
