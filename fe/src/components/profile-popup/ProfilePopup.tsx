import React from "react";

import type { ProfilePopupProps } from "@types";

export const ProfilePopup: React.FC<ProfilePopupProps> = ({ userName, onLogout, onClose }) => {
  // Close popup when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-popup")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="profile-popup absolute sm:right-[24px] right-[12px] sm:top-[75px] top-[54px] bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-50"
      role="dialog"
      aria-label="Profile menu"
    >
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-900">{userName || "Verifed User"}</p>
      </div>
      <button
        onClick={onLogout}
        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 text-red-500"
        role="menuitem"
      >
        Logout
      </button>
    </div>
  );
};
