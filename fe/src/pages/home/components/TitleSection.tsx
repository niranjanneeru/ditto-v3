import React from "react";

export const TitleSection: React.FC = () => {
  return (
    <div className="mb-[30px] sm:mb-[40px]">
      <h1 className="text-[24px] sm:text-[32px] font-[700] text-[#1A1A1A] mb-[10px] sm:mb-[15px]">
        Choose a scenario
      </h1>
      <p className="text-[14px] sm:text-[16px] text-[#656565]">
        Select a scenario to start your training session
      </p>
    </div>
  );
};
