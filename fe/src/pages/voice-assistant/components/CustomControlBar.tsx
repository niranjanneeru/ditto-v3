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
      <div className="flex flex-row items-center gap-6 mx-auto mb-[20px] sm:mb-[30px]">
        <ControlButton
          onClick={handleMuteToggle}
          icon={isMuted ? MicInactive : Mic}
          label={isMuted ? "Unmute" : "Mute"}
          ariaLabel={isMuted ? "Unmute microphone" : "Mute microphone"}
          hoverColor="gray"
          isGoogleMeetStyle={true}
        />
        <ControlButton
          onClick={onEndSession}
          icon={End}
          label="End session"
          ariaLabel="End session"
          hoverColor="red"
          isGoogleMeetStyle={true}
        />
      </div>

      <EncryptionMessage />
    </div>
  );
};
