import React from "react";
import { motion } from "framer-motion";

export const StrengthsAndImprovement: React.FC = () => {
  // Mock data for demonstration
  const mockStrengths = [
    "Excellent active listening skills",
    "Shows genuine empathy",
    "Maintains professional boundaries",
    "Uses appropriate therapeutic techniques",
  ];

  const mockAreasForImprovement = [
    "Could ask more open-ended questions",
    "Consider exploring deeper emotional responses",
    "Work on building stronger rapport",
    "Practice more reflective responses",
  ];

  const FeedbackSection: React.FC<{ title: string; items: string[]; delay: number }> = ({
    title,
    items,
    delay,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="p-4 bg-white rounded-lg shadow-sm border-[0.5px] border-[#D2D2D2]"
    >
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: delay + index * 0.1 }}
            className="text-sm text-gray-700 flex items-start"
          >
            <span className="mr-2 text-blue-500">•</span>
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <FeedbackSection title="Strengths" items={mockStrengths} delay={1.0} />
      <FeedbackSection title="Area for improvement" items={mockAreasForImprovement} delay={1.2} />
    </div>
  );
};
