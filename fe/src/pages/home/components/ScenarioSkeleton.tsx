import React from "react";

export const ScenarioSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-[200px] sm:h-[250px] bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  );
};
