// src/components/common/ResponsivePdfViewer.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Maximize2,
  PanelTop,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function ResponsivePdfViewer({
  material,
  onClose,
  serverURL = "",
}) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  if (!material) return null;

  // Build the correct PDF URL for Google Drive
  const getPdfUrl = () => {
    // Check if we have fileId to build proper Google Drive URL
    if (material.fileId) {
      // First try: Preview URL with minimal interface
      return `https://drive.google.com/file/d/${material.fileId}/preview?rm=minimal&view=fitH&toolbar=0&navpanes=0`;
    }

    // Fallback to fileUrl if available
    if (material.fileUrl) {
      return material.fileUrl;
    }

    // Fallback to directViewUrl
    if (material.directViewUrl) {
      return material.directViewUrl;
    }

    // Last resort: serverURL + filePath
    if (serverURL && material.filePath) {
      return `${serverURL}/${material.filePath}`;
    }

    return "";
  };

  const pdfUrl = getPdfUrl();

  // Alternative URL if preview fails - try different formats
  const getAlternativeUrls = () => {
    const urls = [];

    if (material.fileId) {
      // 1. Direct view (might work differently)
      urls.push(`https://drive.google.com/file/d/${material.fileId}/view`);

      // 2. Download URL (as fallback)
      if (material.downloadUrl) {
        urls.push(material.downloadUrl);
      }

      // 3. Direct PDF link
      urls.push(
        `https://drive.google.com/uc?id=${material.fileId}&export=download`
      );
    }

    if (material.directViewUrl) {
      urls.push(material.directViewUrl);
    }

    if (material.fileUrl) {
      urls.push(material.fileUrl);
    }

    return urls.filter((url) => url && url !== pdfUrl);
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

      // Escape to close
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [material, onClose]);

  // Listen for iframe messages to detect access errors
  useEffect(() => {
    const handleMessage = (event) => {
      // Check if message indicates access error
      if (event.data && typeof event.data === "string") {
        if (
          event.data.includes("access") ||
          event.data.includes("permission")
        ) {
          setAccessError(true);
          setLoading(false);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Handle iframe load and error
  const handleIframeLoad = () => {
    setLoading(false);

    // Check if iframe content indicates access error
    setTimeout(() => {
      try {
        const iframe = iframeRef.current;
        if (iframe) {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow.document;
          const bodyText = iframeDoc.body?.innerText || "";

          if (
            bodyText.includes("need access") ||
            bodyText.includes("You need access") ||
            bodyText.includes("Request access")
          ) {
            setAccessError(true);
          }
        }
      } catch (e) {
        // Cross-origin restrictions, check by URL pattern
        const iframeSrc = iframeRef.current?.src || "";
        if (
          iframeSrc.includes("accounts.google.com") ||
          iframeSrc.includes("/ServiceLogin")
        ) {
          setAccessError(true);
        }
      }
    }, 1000);
  };

  const handleIframeError = () => {
    setLoading(false);
    setAccessError(true);
  };

  // Try alternative URL
  const tryAlternativeUrl = (urlIndex = 0) => {
    const altUrls = getAlternativeUrls();
    if (urlIndex < altUrls.length && iframeRef.current) {
      setLoading(true);
      setAccessError(false);
      iframeRef.current.src = altUrls[urlIndex];
    } else {
      setShowFallback(true);
    }
  };

  // Instructions to fix Google Drive sharing
  const sharingInstructions = `
To make this PDF accessible:

1. Open the file in Google Drive
2. Click the "Share" button
3. Under "General access", click "Restricted"
4. Change it to "Anyone with the link"
5. Set permission to "Viewer" (not Editor)
6. Click "Done"
7. Wait a minute, then refresh this page
  `;

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
            <div>
              <h2 className="text-xl font-bold truncate max-w-md">
                {material.fileName}
              </h2>
              {material.fileSize && (
                <p className="text-sm text-blue-200">
                  {Math.round(material.fileSize / 1024)} KB • PDF Document
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-30 transition-all duration-200"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-30 transition-all duration-200"
              aria-label="Close PDF viewer"
              title="Close (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && !accessError && !showFallback && (
          <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg">
              Loading PDF from Google Drive...
            </p>
          </div>
        )}

        {/* Access Error */}
        {accessError && !showFallback && (
          <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Access Required
            </h3>
            <p className="text-gray-600 text-center mb-4 max-w-md">
              This PDF is not publicly accessible. The file needs to be shared
              with "Anyone with the link" permission in Google Drive.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 max-w-md">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">
                    Fix Instructions:
                  </p>
                  <ol className="text-yellow-700 mt-1 list-decimal list-inside space-y-1">
                    <li>Open the file in Google Drive</li>
                    <li>Click "Share" button</li>
                    <li>Change "Restricted" to "Anyone with the link"</li>
                    <li>Set permission to "Viewer"</li>
                    <li>Click "Done" and wait 1 minute</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => {
                  setLoading(true);
                  setAccessError(false);
                  if (iframeRef.current) {
                    iframeRef.current.src = pdfUrl; // Reload original
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>Try Again</span>
              </button>

              <button
                onClick={() => tryAlternativeUrl(0)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Try Alternative URL
              </button>

              <button
                onClick={() => setShowFallback(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                Use Fallback Viewer
              </button>
            </div>
          </div>
        )}

        {/* Fallback Viewer */}
        {showFallback && (
          <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ExternalLink className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Open PDF Externally
            </h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Google Drive access is restricted. You can open the PDF in a new
              tab instead.
            </p>

            <div className="flex flex-col gap-3 max-w-md w-full">
              {getAlternativeUrls().map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-between"
                >
                  <span className="truncate">Open PDF in new tab</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              ))}

              <button
                onClick={() => {
                  setShowFallback(false);
                  setAccessError(false);
                  setLoading(true);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors mt-2"
              >
                Back to Viewer
              </button>
            </div>
          </div>
        )}

        {/* PDF Viewer (hidden when error or fallback is shown) */}
        {!accessError && !showFallback && (
          <div className="h-[75vh] relative">
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              title={material.fileName}
              className="w-full h-full border-0"
              allow="fullscreen"
              loading="lazy"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin"
              referrerPolicy="no-referrer"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "0 0",
                width: `${100 * (100 / zoomLevel)}%`,
                height: `${100 * (100 / zoomLevel)}%`,
                transition: "transform 0.2s ease",
              }}
            />

            {/* Security notice */}
            {/*
             */}
          </div>
        )}
      </div>
    </div>
  );
}
