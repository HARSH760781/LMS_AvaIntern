// src/components/common/SimplePdfViewer.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  FileText,
} from "lucide-react";

export default function SimplePdfViewer({ material, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  if (!material) return null;

  const pdfUrl = material.fileId
    ? `https://drive.google.com/file/d/${material.fileId}/preview?rm=minimal&view=fitH`
    : material.fileUrl || material.directViewUrl || "";

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 20, 300));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 20, 40));
  const resetZoom = () => setZoomLevel(100);

  const toggleFullscreen = () => {
    if (!isFullscreen) containerRef.current.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  useEffect(() => {
    const listener = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  const handleIframeLoad = () => setLoading(false);

  const formatSize = (b) =>
    !b
      ? "Unknown"
      : b < 1024
      ? `${b} B`
      : b < 1024 * 1024
      ? `${(b / 1024).toFixed(0)} KB`
      : `${(b / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between bg-gray-900 text-white p-3 md:p-4 gap-3 border-b border-gray-700">
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="bg-blue-600 p-2 md:p-2.5 rounded-lg">
            <FileText className="w-5 h-5 md:w-6 md:h-6" />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h5
              className="font-semibold text-sm md:text-base whitespace-normal break-normal
               line-clamp-2 leading-snug"
            >
              {material.fileName}
            </h5>

            <p
              className="text-gray-400 text-xs md:text-sm whitespace-normal break-normal
               line-clamp-1 leading-snug"
            >
              {formatSize(material.fileSize)}
              {material.courseTitle && ` • ${material.courseTitle}`}
            </p>
          </div>
        </div>

        {/* Right Section Buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 md:p-2 hover:bg-gray-700 rounded"
            >
              <ZoomOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <span className="px-2 text-xs md:text-sm">{zoomLevel}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 md:p-2 hover:bg-gray-700 rounded"
            >
              <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 md:p-2 hover:bg-gray-700 rounded-lg"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <Maximize2 className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 md:p-2 text-red-400 hover:bg-red-800/30 rounded-lg"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-2 md:p-3 overflow-hidden"
      >
        {loading && (
          <div className="absolute text-white flex flex-col items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
            <p className="mt-3 text-sm md:text-base">Loading PDF…</p>
          </div>
        )}

        {/* PDF Viewer */}
        <div
          className="bg-white shadow-2xl relative rounded-lg overflow-hidden"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "center center",
          }}
        >
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            onLoad={handleIframeLoad}
            className="border-0"
            style={{
              width: "min(95vw, 900px)",
              height: "min(80vh, 1100px)",
            }}
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-2 md:py-3 flex justify-center">
        <div className="bg-gray-900/90 p-2 md:p-3 rounded-xl flex gap-2 md:gap-3">
          <button
            onClick={resetZoom}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs md:text-sm rounded-lg"
          >
            Reset Zoom
          </button>
        </div>
      </div>
    </div>
  );
}
