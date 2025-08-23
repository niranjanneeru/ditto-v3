import React from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

export const SkillAssessment: React.FC = () => {
  // Mock data for demonstration
  const mockData = {
    empathy: 85,
    listening: 90,
    timing: 75,
    overall: 83,
  };

  const chartData = [
    { subject: "Empathy", value: mockData.empathy },
    { subject: "Listening", value: mockData.listening },
    { subject: "Timing", value: mockData.timing },
    { subject: "Overall", value: mockData.overall },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full lg:flex-[2]"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="p-4 sm:p-6 h-full bg-white rounded-lg shadow-sm border-[0.5px] border-[#D2D2D2] font-['IBM_Plex_Serif']"
      >
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-2 sm:mb-4 text-lg sm:text-xl font-medium"
        >
          Skill Assessment
        </motion.h2>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="w-full h-[250px] sm:h-[300px]"
        >
          <ResponsiveContainer>
            <RadarChart data={chartData}>
              <PolarGrid stroke="#D2D2D2" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: "#656565",
                  fontSize: window.innerWidth < 640 ? 10 : 12,
                }}
              />
              <Radar
                name="Skills"
                dataKey="value"
                stroke="#0957D0"
                fill="#0957D0"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
