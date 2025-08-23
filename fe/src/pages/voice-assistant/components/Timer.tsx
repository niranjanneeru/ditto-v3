import React, { useState, useEffect, useCallback } from "react";

import { MAX_SESSION_MINUTES, WARNING_THRESHOLD } from "@constants";
import type { TimerProps } from "@types";

export const Timer: React.FC<TimerProps> = ({
  startTime,
  timeLimit = MAX_SESSION_MINUTES,
  onTimeLimit,
  onWarning,
}) => {
  const [elapsed, setElapsed] = useState<string>();
  const [isWarning, setIsWarning] = useState(false);

  const formatTime = (minutes: number, seconds: number): string => {
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const calculateTimeRemaining = useCallback((now: Date, start: Date): number => {
    return Math.floor((now.getTime() - start.getTime()) / 1000);
  }, []);

  const checkWarningState = useCallback(
    (timeRemaining: number) => {
      if (timeLimit - timeRemaining <= WARNING_THRESHOLD && !isWarning) {
        setIsWarning(true);
        onWarning?.();
      }
    },
    [timeLimit, isWarning, onWarning],
  );

  const checkTimeLimit = useCallback(
    (timeRemaining: number, interval: ReturnType<typeof setTimeout>) => {
      if (timeRemaining >= timeLimit) {
        onTimeLimit?.();
        clearInterval(interval);
      }
    },
    [timeLimit, onTimeLimit],
  );

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeElapsed = calculateTimeRemaining(now, startTime);
      const minutes = Math.floor(timeElapsed / 60);
      const seconds = timeElapsed % 60;

      setElapsed(formatTime(minutes, seconds));
      checkWarningState(timeElapsed);
      checkTimeLimit(timeElapsed, interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, checkWarningState, checkTimeLimit, calculateTimeRemaining]);

  const renderLoader = () => (
    <div className="w-[30px] h-[30px] mt-[10px] border-t-2 border-b-2 border-[#9CA3AF] rounded-full animate-spin" />
  );

  return (
    <div
      className={`flex min-w-[100px] items-center justify-center sm:text-[36px] text-[28px] font-[500] h-[40px] ${
        isWarning ? "text-red-500" : "text-[#9CA3AF]"
      }`}
    >
      {elapsed || renderLoader()}
    </div>
  );
};
