import React from "react";

import type { ControlButtonProps } from "@types";

export const ControlButton: React.FC<ControlButtonProps> = ({
  onClick,
  icon,
  label,
  ariaLabel,
  hoverColor = "gray",
}) => {
  const getHoverColorClass = () => {
    switch (hoverColor) {
      case "red":
        return "hover:bg-red-50";
      case "blue":
        return "hover:bg-blue-50";
      default:
        return "hover:bg-gray-100";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center sm:min-w-[120px] min-w-[60px] gap-1 sm:gap-2 px-[10px] sm:px-[16px] py-[12px] sm:py-[16px] transition-colors text-[12px] sm:text-[14px] text-[#1A1A1A] ${getHoverColorClass()}`}
      aria-label={ariaLabel}
    >
      <img src={icon} alt={label.toLowerCase()} className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="sm:block hidden">{label}</span>
    </button>
  );
};
