import React, { useState } from "react";
import { motion } from "framer-motion";

import { scenarioCardAnimationVariants, scenarioCardContentVariants } from "@constants";
import type { ScenarioCardExpandedProps } from "@types";

export const ScenarioCardExpanded: React.FC<ScenarioCardExpandedProps> = ({
  scenario,
  onStart,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!scenario) return null;

  return (
    <motion.div
      variants={scenarioCardAnimationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`bg-white sm:rounded-lg rounded-none shadow-lg w-full h-full overflow-hidden origin-top-left`}
      role="dialog"
      aria-labelledby="scenario-title"
    >
      <motion.div
        variants={scenarioCardContentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ delay: 0.1, duration: 0.3 }}
        className="h-full flex flex-col"
      >
        <div className="relative w-full h-[120px] sm:h-[150px]">
          {!imageError ? (
            <img
              src={scenario.cover_image || ""}
              alt={`${scenario.title} scenario details`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
              <span className="text-sm">Image not available</span>
            </div>
          )}
        </div>

        <div className="p-[0px] sm:p-[14px] flex flex-col flex-grow overflow-y-auto">
          <div
            id="scenario-title"
            className="text-[16px] font-medium text-[#0D0D0D] mb-[10px] mt-[15px] sm:mt-[10px]"
          >
            {scenario.title}
          </div>

          <div className="mb-3 sm:mb-[10px]">
            <div className="text-[16px] font-medium text-[#0D0D0D] mb-[3px] sm:mb-[5px]">
              Scenario:
            </div>
            <p className="text-[#656565] text-[14px]">{scenario.short_description}</p>
          </div>

          <div className="mb-3 sm:mb-[10px]">
            <div className="text-[16px] font-medium text-[#0D0D0D] mb-[3px] sm:mb-[5px]">
              Description:
            </div>
            <p className="text-[#656565] text-[14px] leading-relaxed">
              {scenario.long_description}
            </p>
          </div>

          <div className="mt-auto pt-[10px]">
            <button
              onClick={e => {
                e.stopPropagation();
                onStart?.();
              }}
              className="bg-[#0957D0] text-white w-full py-3 sm:py-4 rounded-lg hover:bg-[#2B5CE7]/90 transition-colors font-medium text-[16px] sm:text-[18px] mb-2 sm:mb-[10px] font-['Roboto']"
              aria-label="Start simulation"
            >
              Start Simulation
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
