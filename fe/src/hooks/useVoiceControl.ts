import { useState, useEffect } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

interface UseVoiceControlProps {
  onEndSession: () => void;
}

export const useVoiceControl = ({ onEndSession }: UseVoiceControlProps) => {
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (localParticipant) {
      // Update state when microphone state changes
      const handleMicrophoneUpdate = () => {
        setIsMuted(!localParticipant.isMicrophoneEnabled);
      };

      localParticipant.on(RoomEvent.TrackMuted, handleMicrophoneUpdate);
      localParticipant.on(RoomEvent.TrackUnmuted, handleMicrophoneUpdate);

      return () => {
        localParticipant.off(RoomEvent.TrackMuted, handleMicrophoneUpdate);
        localParticipant.off(RoomEvent.TrackUnmuted, handleMicrophoneUpdate);
      };
    }
  }, [localParticipant]);

  const handleMuteToggle = async () => {
    try {
      if (localParticipant) {
        const newMuteState = !isMuted;
        await localParticipant.setMicrophoneEnabled(!newMuteState);
        setIsMuted(newMuteState);
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  const handlePauseToggle = async () => {
    try {
      if (localParticipant) {
        const newPauseState = !isPaused;
        await localParticipant.setMicrophoneEnabled(!newPauseState);
        setIsPaused(newPauseState);
      }
    } catch (error) {
      console.error("Error toggling pause:", error);
    }
  };

  return {
    isMuted,
    isPaused,
    handleMuteToggle,
    handlePauseToggle,
    onEndSession,
  };
};
