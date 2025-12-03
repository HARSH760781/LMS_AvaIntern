import React, { useState } from "react";
import { PanelsTopLeft, X, Clock, AlertCircle } from "lucide-react";

const companies = [
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/tcs.png?updatedAt=1741696846833",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "TCS PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/flipkart.png",
    // pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Flipkart PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/zomato.png?updatedAt=1741291148543",
    // pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Zomato PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/icici_bank_logo.png?updatedAt=1741291144305",
    // pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "ICICI Bank PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/microsoft.png",
    // pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Microsoft PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/image.png",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/Cisco.pdf",
    fileName: "Cisco PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/Meta-Logo.png?updatedAt=1741291144175",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Meta PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/cognizant.png",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Cognizant PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/IBM.png?updatedAt=1741291144029",
    // pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "IBM PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/accenture.png",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Accenture PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/concentrix.png?updatedAt=1741291144248",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Concentrix PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/oppo.png",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Oppo PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/oracle.png",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Oracle PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/Amazon.jpg",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Amazon PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/godigit.png?updatedAt=1741291144006",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "GoDigit PYQs Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/deolite.jpg",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Deloitte PYQs Test",
  },
];

// Custom PDF Viewer Component
const PdfViewerModal = ({ material, onClose }) => {
  if (!material) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <PanelsTopLeft className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold truncate">{material.fileName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
            aria-label="Close PDF viewer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="h-[80vh]">
          <iframe
            src={`${material.filePath}#view=fitH&toolbar=0`}
            title={material.fileName}
            className="w-full h-full border-0"
            allow="fullscreen"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

// Coming Soon Modal Component
const ComingSoonModal = ({ companyName, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-gray-800 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Clock className="w-5 h-5 text-black" />
            </div>
            <h2 className="text-xl font-bold truncate">Coming Soon</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <Clock className="w-16 h-16 text-yellow-500" />
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-30 animate-pulse"></div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {companyName} PYQs Test
          </h3>

          <p className="text-gray-600 mb-4">
            The PYQs test for{" "}
            <span className="font-semibold">{companyName}</span> is currently
            being prepared and will be available soon.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                Our team is working hard to create high-quality practice
                materials. This PYQs test will be added shortly.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors duration-300"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

// Company Card Component
const CompanyCard = ({ item, onClick, hasPdf }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative bg-white border rounded-xl 
        flex items-center justify-center 
        h-20 sm:h-24 md:h-28 p-1 sm:p-2
        transition-all duration-300 cursor-pointer
        group
        ${
          hasPdf
            ? "border-gray-300 shadow-md hover:shadow-xl hover:scale-[1.03] hover:border-blue-400"
            : "border-gray-200 shadow-sm hover:shadow-md hover:border-yellow-300 opacity-80 hover:opacity-100"
        }
      `}
    >
      {/* Company Logo */}
      <img
        src={item.logo}
        alt={`${item.fileName.replace(" PYQs Test", "")} logo`}
        className="max-w-full max-h-full object-contain"
      />

      {/* Coming Soon Overlay */}
      {!hasPdf && (
        <>
          {/* Overlay */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-center px-2">
              <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
              <span className="text-xs font-semibold text-yellow-700">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Corner badge */}
          <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            !
          </div>
        </>
      )}
    </div>
  );
};

// Main Component
const CompanyPYQs = () => {
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [comingSoonCompany, setComingSoonCompany] = useState(null);

  const handleCompanyClick = (item) => {
    // Check if PDF is available
    const hasPdf = item.pdf && item.pdf.trim() !== "";

    if (hasPdf) {
      openPDF(item.pdf, item.fileName);
    } else {
      showComingSoon(item.fileName.replace(" PYQs Test", ""));
    }
  };

  const openPDF = (pdf, fileName) => {
    setSelectedPdf({ filePath: pdf, fileName });
  };

  const showComingSoon = (companyName) => {
    setComingSoonCompany(companyName);
  };

  const closeViewer = () => {
    setSelectedPdf(null);
  };

  const closeComingSoon = () => {
    setComingSoonCompany(null);
  };

  return (
    <>
      <div className="w-[95%] mx-auto border border-gray-200 shadow-xl rounded-xl p-4 my-5 bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 text-blue-700 px-2 text-2xl sm:text-3xl font-bold font-sans m-3 md:m-1 sm:m-1">
          <PanelsTopLeft className="w-7 h-7 text-gray-800" />
          <span>Company PYQs</span>
        </div>

        <hr className="px-5 border-gray-300 mb-4" />

        {/* Info Text */}
        <div className="px-2 mb-4">
          <p className="text-gray-600 text-sm">
            Click on company logos to access PYQs tests. Companies with a yellow
            badge are coming soon.
          </p>
        </div>

        {/* Grid */}
        <div
          className="
            grid gap-3
            grid-cols-3
            sm:grid-cols-4
            md:grid-cols-5
            lg:grid-cols-6
          "
        >
          {companies.map((item, index) => (
            <CompanyCard
              key={index}
              item={item}
              hasPdf={item.pdf && item.pdf.trim() !== ""}
              onClick={() => handleCompanyClick(item)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 px-1 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Available PYQs Test</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-700">Coming Soon</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-xs">
              {
                companies.filter((item) => item.pdf && item.pdf.trim() !== "")
                  .length
              }{" "}
              of {companies.length} available
            </span>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PdfViewerModal material={selectedPdf} onClose={closeViewer} />
      )}

      {/* Coming Soon Modal */}
      {comingSoonCompany && (
        <ComingSoonModal
          companyName={comingSoonCompany}
          onClose={closeComingSoon}
        />
      )}
    </>
  );
};

export default CompanyPYQs;
