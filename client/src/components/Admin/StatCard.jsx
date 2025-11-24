import React from "react";

const StatCard = ({
  value,
  label,
  Icon,
  gradientFrom,
  gradientTo,
  border,
  iconColor,
  bgOpacity,
  note = "Live Data",
}) => {
  // Format number to 2 decimal places only if it's a number
  const formattedValue =
    typeof value === "number"
      ? Number.isInteger(value)
        ? value
        : value.toFixed(2)
      : value;

  return (
    <div
      className={`bg-linear-to-br ${gradientFrom} ${gradientTo} rounded-2xl shadow-2xl border ${border} p-6 text-white`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white">{formattedValue}</h3>

        <div
          className={`w-10 h-10 ${bgOpacity} rounded-lg flex items-center justify-center border`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      <p className="text-white/80">{label}</p>
      <p className="text-xs text-white/60 mt-1">{note}</p>
    </div>
  );
};

export default StatCard;
