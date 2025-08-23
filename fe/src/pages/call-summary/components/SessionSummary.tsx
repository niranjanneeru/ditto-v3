import React from "react";
import { motion } from "framer-motion";

import type { SessionMetric } from "@types";

export const SessionSummary: React.FC = () => {
  // Mock data for demonstration
  const mockData = {
    overallScore: 85,
    empathyScore: 90,
    responsesGiven: 12,
    sessionDuration: "15:30",
  };

  const metrics: SessionMetric[] = [
    { label: "Overall Score", value: `${mockData.overallScore}%` },
    { label: "Empathy Score", value: `${mockData.empathyScore}%` },
    { label: "Responses Given", value: mockData.responsesGiven },
    { label: "Session Duration", value: mockData.sessionDuration },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full lg:flex-1"
    >
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 font-['IBM_Plex_Serif']">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="p-3 sm:p-4 bg-white border-[0.5px] border-[#D2D2D2] rounded-lg shadow-sm"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-xs sm:text-sm text-[#656565]"
            >
              {metric.label}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="mt-1 sm:mt-2 text-xl sm:text-2xl text-[#0D0D0D] font-medium"
            >
              {metric.value}
            </motion.p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
