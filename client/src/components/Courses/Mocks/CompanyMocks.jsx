import React from "react";
import { PanelsTopLeft } from "lucide-react";

const imgURL = [
  "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/tcs.png?updatedAt=1741696846833",
  "https://ik.imagekit.io/y7csnuuzj/Icons/flipkart.png",
  "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/zomato.png?updatedAt=1741291148543",
  "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/icici_bank_logo.png?updatedAt=1741291144305",
  "https://ik.imagekit.io/y7csnuuzj/Icons/microsoft.png",
  "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/Meta-Logo.png?updatedAt=1741291144175",
  "https://ik.imagekit.io/y7csnuuzj/Icons/cognizant.png",
  "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/IBM.png?updatedAt=1741291144029",
  "https://ik.imagekit.io/y7csnuuzj/Icons/accenture.png",
  "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/concentrix.png?updatedAt=1741291144248",
  "https://ik.imagekit.io/y7csnuuzj/Icons/oppo.png",
  "https://ik.imagekit.io/y7csnuuzj/Icons/oracle.png",
  "https://ik.imagekit.io/y7csnuuzj/Icons/Amazon.jpg",
  "https://ik.imagekit.io/y7csnuuzj/Avaintern%20Content/Company%20Logo/godigit.png?updatedAt=1741291144006",
  "https://ik.imagekit.io/y7csnuuzj/Icons/deolite.jpg",
];

const CompanyMocks = () => {
  return (
    <div className="w-[95%] mx-auto border border-gray-200 shadow-xl rounded-xl p-4 my-5 bg-white hover:shadow-2xl transition">
      {/* Header */}
      <div className="flex items-center gap-3 text-blue-700 px-7 text-3xl font-bold font-sans m-3">
        <PanelsTopLeft className="w-7 h-7 text-gray-800" />
        <span>Company Mocks</span>
      </div>

      <hr className="px-5 border-black border-4 mt-1" />

      {/* Cards Section */}
      <div className="grid grid-cols-5 gap-7 p-5">
        {imgURL.map((url, index) => (
          <div
            key={index}
            className="w-30 h-30 bg-white border border-gray-300 shadow-md rounded-xl 
                       flex items-center justify-center p-1.5 cursor-pointer
                       hover:shadow-xl hover:scale-[1.03] transition"
          >
            <img
              src={url}
              alt="Company Logo"
              className=" w-30 h-35 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyMocks;
