import React from "react";

import type { ControlButtonProps } from "@types";

export const ControlButton: React.FC<ControlButtonProps> = ({
  onClick,
  icon,
  label,
  ariaLabel,
  hoverColor = "gray",
  isGoogleMeetStyle = false,
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

  const getButtonClasses = () => {
    if (isGoogleMeetStyle) {
      return `flex items-center justify-center w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50 transition-all duration-200 hover:bg-gray-50 hover:shadow-xl active:scale-95 ${getHoverColorClass()}`;
    }

    return `flex items-center justify-center sm:min-w-[120px] min-w-[60px] gap-1 sm:gap-2 px-[10px] sm:px-[16px] py-[12px] sm:py-[16px] transition-colors text-[12px] sm:text-[14px] text-gray-900 ${getHoverColorClass()}`;
  };

  return (
    <button
      onClick={onClick}
      className={getButtonClasses()}
      aria-label={ariaLabel}
    >
      <img src={icon} alt={label.toLowerCase()} className="w-6 h-6" />
      {!isGoogleMeetStyle && <span className="sm:block hidden">{label}</span>}
    </button>
  );
};
