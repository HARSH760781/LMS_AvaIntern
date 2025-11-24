import React from "react";

const MetricCard = ({ value, label }) => {
  const formattedValue =
    typeof value === "number"
      ? Number.isInteger(value)
        ? value
        : value.toFixed(2)
      : value;

  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-white">{formattedValue}</div>
      <div className="text-sm text-gray-300">{label}</div>
    </div>
  );
};

export default MetricCard;
