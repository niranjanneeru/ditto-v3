import React from "react";
import { motion } from "framer-motion";

interface TryAgainButtonProps {
  handleFeedbackSubmit: () => void;
  isLoading?: boolean;
}

export const TryAgainButton: React.FC<TryAgainButtonProps> = ({
  handleFeedbackSubmit,
  isLoading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="flex justify-center w-full"
    >
      <motion.button
        onClick={handleFeedbackSubmit}
        disabled={isLoading}
        whileHover={!isLoading ? { scale: 1.02 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        className={`w-full px-12 py-3 text-[16px] font-[500] rounded-lg transition-colors duration-200 font-['Roboto'] ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed text-gray-600"
            : "bg-[#0957D0] hover:bg-[#0957D0] text-white"
        }`}
      >
        {isLoading ? "Loading..." : "Save & Try Another"}
      </motion.button>
    </motion.div>
  );
};
