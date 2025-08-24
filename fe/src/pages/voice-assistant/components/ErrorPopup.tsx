import React from "react";

import type { ErrorPopupProps } from "@types";

export const ErrorPopup: React.FC<ErrorPopupProps> = ({
  isOpen,
  onClose,
  onExit,
  errorMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-5 pb-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Connection Error</h3>
          <p className="text-gray-700">{errorMessage}</p>
        </div>
        <div className="flex justify-around space-x-4">
          <button onClick={onClose} className="px-4 py-4 text-gray-600 hover:text-gray-800">
            Try Again
          </button>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            Exit to Home
          </button>
        </div>
      </div>
    </div>
  );
};
