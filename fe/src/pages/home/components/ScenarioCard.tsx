import React, { useState } from "react";
import { motion } from "framer-motion";
import type { ScenarioCardProps } from "@types";

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  coverImage,
  title,
  description,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      layout
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-all duration-300 h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2 }}
      role="button"
      aria-label={`Select ${title} scenario`}
      tabIndex={0}
      onKeyPress={e => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
    >
      <div className="flex flex-col h-full">
        <div className="w-full h-[100px] sm:h-[120px] relative bg-gray-200">
          {!imageError ? (
            <img
              src={coverImage}
              alt={`${title} scenario cover`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-sm">Image not available</span>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-[14px] flex-grow">
          <div className="text-[13px] sm:text-[14px] font-[400] text-[#0D0D0D] mb-2 sm:mb-[5px]">
            {title}
          </div>
          <div className="text-[#656565] text-[11px] sm:text-[12px] line-clamp-2">
            {description}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
