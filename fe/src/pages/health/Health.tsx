import React from "react";

export const Health: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Health Check</h1>
        <p className="text-gray-600">Application is running successfully!</p>
      </div>
    </div>
  );
};
