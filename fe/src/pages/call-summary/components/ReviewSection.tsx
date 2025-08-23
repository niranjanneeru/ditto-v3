import React from "react";
import { motion } from "framer-motion";
import { MAX_CHAR_LIMIT_FEEDBACK } from "@constants/summary";

interface ReviewSectionProps {
  rating?: number;
  setRating: (rating: number) => void;
  comment: string;
  setComment: (comment: string) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  rating = 0,
  setRating,
  comment,
  setComment,
}) => {
  const starVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2 },
    tap: { scale: 0.9 },
  };

  const StarRating = () => {
    return (
      <div className="flex gap-1 sm:gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <motion.button
            key={star}
            onClick={() => setRating(star)}
            variants={starVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            animate={{
              scale: star <= rating ? 1.1 : 1,
              transition: { duration: 0.2 },
            }}
            className={`text-2xl sm:text-3xl focus:outline-none ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-[20px] border border-gray-200 text-black rounded-lg bg-white font-['IBM_Plex_Serif']"
    >
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-[10px] text-lg sm:text-xl text-center"
      >
        How was your experience?
      </motion.h2>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex justify-center mb-[10px] sm:mb-[15px]"
      >
        <StarRating />
      </motion.div>

      <motion.textarea
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-full p-3 sm:p-4 min-h-[150px] sm:min-h-[180px] text-sm sm:text-base rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-['Roboto']"
        placeholder="Tell us on how can we improve..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        maxLength={MAX_CHAR_LIMIT_FEEDBACK}
      />
    </motion.div>
  );
};
