import React from "react";

const AppCard = ({ Icon, name, description }) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:scale-105 group border border-gray-600 text-center">
      <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3 border border-blue-400 border-opacity-30 group-hover:bg-blue-500 group-hover:bg-opacity-30 transition-colors">
        <Icon className="w-6 h-6 text-blue-300 group-hover:text-white" />
      </div>

      <p className="font-medium text-white text-sm mb-1">{name}</p>
      <p className="text-xs text-gray-300 group-hover:text-gray-200">
        {description}
      </p>

      <div className="flex items-center justify-center space-x-1 mt-2">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="text-xs text-green-400">Operational</span>
      </div>
    </div>
  );
};

export default AppCard;
