import React from "react";

export const SimulationLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <p className="text-[24px] font-[500] text-[#0D0D0D] mb-[20px]">Simulation starting...</p>
      <p className="text-[14px] text-[#656565]">
        To start the simulation, please allow us to use your microphone.
      </p>
    </div>
  );
};
