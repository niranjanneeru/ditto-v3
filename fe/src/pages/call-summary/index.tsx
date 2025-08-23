import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { addFeedback } from "@api";
import { itemVariants, containerVariants, APP_ROUTES } from "@constants";
import { Header } from "@components";

import { ReviewSection } from "./components/ReviewSection";
import { TryAgainButton } from "./components/TryAgainButton";

export const CallSummary: React.FC = () => {
  const [rating, setRating] = useState<number>();
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleFeedbackSubmit = async () => {
    if (isLoading) return;
    if (!rating && !comment) {
      navigate(APP_ROUTES.HOME, { replace: true });
      return;
    }
    setIsLoading(true);
    const response = await addFeedback({ rating, comment });
    setIsLoading(false);
    if (response.data) {
      setIsLoading(false);
      toast.success("Feedback submitted successfully");
    } else {
      toast.error("Failed to submit feedback");
    }
    // Navigate to the simulation start page
    navigate(APP_ROUTES.HOME, { replace: true });
  };

  const renderSectionTitle = (title: string) => {
    return (
      <motion.div variants={itemVariants} className="flex flex-row items-center text-[#9CA3AF]">
        <div className="text-[10px] font-[600] sm:text-[12px] min-w-[120px] sm:min-w-[145px] font-['Roboto']">
          {title}
        </div>
        <div className="flex w-full h-[1px] bg-[#D2D2D2] ml-[5px] opacity-70" role="separator" />
      </motion.div>
    );
  };

  const renderTitle = () => {
    return (
      <motion.div
        variants={itemVariants}
        className="mb-[10px] sm:mb-[20px] flex flex-col mt-[10px] sm:mt-0 w-full"
      >
        <div className="mb-[10px] text-black text-[24px] sm:text-[32px] font-normal text-left">
          Simulation <em>Ended</em>
        </div>
        {renderSectionTitle("REVIEW AND RATING")}
      </motion.div>
    );
  };

  return (
    <div className="bg-white w-full h-[100vh] overflow-y-auto flex flex-col items-center justify-center">
      <Header />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col max-w-3xl w-full h-full pb-8 sm:pb-16 px-4 sm:px-6 pb-[60px] items-center justify-center"
      >
        {renderTitle()}
        <motion.div variants={itemVariants} className="w-full">
          <ReviewSection
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
          />
        </motion.div>
        <motion.div
          className="w-full sm:pt-[20px] pt-[10px] pb-[15px] sm:pb-[25px]"
          variants={itemVariants}
        >
          <TryAgainButton isLoading={isLoading} handleFeedbackSubmit={handleFeedbackSubmit} />
        </motion.div>
      </motion.div>
    </div>
  );
};
