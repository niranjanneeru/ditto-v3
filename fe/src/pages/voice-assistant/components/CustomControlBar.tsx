import React from "react";

import { Mic, MicInactive, End } from "@assets";
import { useVoiceControl } from "@hooks";
import type { CustomControlBarProps } from "@types";
import { ControlButton } from "./ControlButton";
import { EncryptionMessage } from "./EncryptionMessage";

export const CustomControlBar: React.FC<CustomControlBarProps> = ({ onEndSession }) => {
  const { isMuted, handleMuteToggle } = useVoiceControl({
    onEndSession,
  });

  return (
    <div className="fixed bottom-[20px] sm:bottom-[60px] left-0 right-0 flex flex-col justify-center pb-4 sm:pb-8">
      <div className="bg-white rounded-[6px] shadow-lg flex flex-row justify-around sm:w-[300px] w-[200px] mx-auto mb-[20px] sm:mb-[30px] overflow-hidden border-[0.1px] border-[#E5E5E5]">
        <ControlButton
          onClick={handleMuteToggle}
          icon={isMuted ? MicInactive : Mic}
          label={isMuted ? "Unmute" : "Mute"}
          ariaLabel={isMuted ? "Unmute microphone" : "Mute microphone"}
          hoverColor="gray"
        />

        {/* TODO: Remove pause and play button for now */}
        {/* <ControlButton
          onClick={handlePauseToggle}
          icon={isPaused ? Pause : Play}
          label={isPaused ? "Resume" : "Pause"}
          ariaLabel={isPaused ? "Resume session" : "Pause session"}
          hoverColor={isPaused ? "blue" : "gray"}
        /> */}

        <ControlButton
          onClick={onEndSession}
          icon={End}
          label="End session"
          ariaLabel="End session"
          hoverColor="red"
        />
      </div>

      <EncryptionMessage />
    </div>
  );
};
