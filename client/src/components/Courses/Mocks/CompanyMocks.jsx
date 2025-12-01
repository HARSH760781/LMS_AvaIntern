import React, { useState } from "react";
import { PanelsTopLeft, X } from "lucide-react";

const companies = [
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/tcs.png?updatedAt=1741696846833",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "TCS Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/flipkart.png",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Flipkart Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/zomato.png?updatedAt=1741291148543",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Zomato Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/icici_bank_logo.png?updatedAt=1741291144305",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "ICICI Bank Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/microsoft.png",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Microsoft Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/Meta-Logo.png?updatedAt=1741291144175",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Meta Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/cognizant.png",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Cognizant Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/IBM.png?updatedAt=1741291144029",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "IBM Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/accenture.png",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Accenture Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/concentrix.png?updatedAt=1741291144248",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Concentrix Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/oppo.png",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Oppo Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/oracle.png",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Oracle Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/Amazon.jpg",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Amazon Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/godigit.png?updatedAt=1741291144006",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "GoDigit Mock Test",
  },
  {
    logo: "https://ik.imagekit.io/y7csnuuzj/Icons/deolite.jpg",
    pdf: "https://ik.imagekit.io/y7csnuuzj/Icons/100%20CPP%20.pdf",
    fileName: "Deloitte Mock Test",
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

// Main Component
const CompanyMocks = () => {
  const [selectedPdf, setSelectedPdf] = useState(null);

  const openPDF = (pdf, fileName) => {
    setSelectedPdf({ filePath: pdf, fileName });
  };

  const closeViewer = () => {
    setSelectedPdf(null);
  };

  return (
    <>
      <div className="w-[95%] mx-auto border border-gray-200 shadow-xl rounded-xl p-4 my-5 bg-white transition">
        {/* Header */}
        <div className="flex items-center gap-3 text-blue-700 px-7 text-2xl sm:text-3xl font-bold font-sans m-3">
          <PanelsTopLeft className="w-7 h-7 text-gray-800" />
          <span>Company Mocks</span>
        </div>

        <hr className="px-5 border-black border-2" />

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
            <div
              key={index}
              onClick={() => openPDF(item.pdf, item.fileName)}
              className="
                bg-white border border-gray-300 shadow-md rounded-xl 
                flex items-center justify-center 
                h-20 sm:h-24 md:h-28 p-1
                cursor-pointer hover:shadow-xl hover:scale-[1.03] transition
              "
            >
              <img
                src={item.logo}
                alt="Company Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PdfViewerModal material={selectedPdf} onClose={closeViewer} />
      )}
    </>
  );
};

export default CompanyMocks;
