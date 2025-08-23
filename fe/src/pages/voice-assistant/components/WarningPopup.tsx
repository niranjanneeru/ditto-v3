import React from "react";

import { Close } from "@assets";
import type { WarningPopupProps } from "@types";

export const WarningPopup: React.FC<WarningPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 cursor-pointer"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close warning"
        >
          <img src={Close} alt="close" className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="text-red-500 text-2xl font-medium mb-4">⚠️ Session Ending Soon</div>
          <p className="text-gray-600 mb-2">Your session will end in 30 seconds.</p>
          <p className="text-sm text-gray-500">Please wrap up your conversation.</p>
        </div>
      </div>
    </div>
  );
};
