import { useState, useEffect } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import { useNavigate, useParams } from "react-router-dom";

import { LIVEKIT_CONFIG, getLiveKitUrl } from "@utils";
import { APP_ROUTES, LOCAL_STORAGE_KEYS } from "@constants";
import { logger } from "@utils/logger";
import type { UseVoiceAssistantReturn } from "@types";
import { deleteRoom } from "@api/apiCall";

export const useVoiceAssistant = (): UseVoiceAssistantReturn => {
  const [room] = useState(() => new Room(LIVEKIT_CONFIG));
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const { roomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();

  const roomDataString = localStorage.getItem(LOCAL_STORAGE_KEYS.ROOM_DATA);
  const roomData = roomDataString ? JSON.parse(roomDataString) : null;
  const startTime = roomData?.created_at ? new Date(roomData?.created_at) : new Date();

  const clearTimer = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ROOM_DATA);
  };

  const handleRetryConnection = () => {
    setError(null);
    connectToRoom();
  };

  const handleExitToHome = () => {
    clearTimer();
    navigate(APP_ROUTES.HOME, { replace: true });
  };

  const connectToRoom = async () => {
    try {
      if (!roomId || !roomDataString) {
        logger.info("Missing roomId or roomData, redirecting to home");
        handleExitToHome();
        return;
      }

      if (!isConnecting && !isConnected) {
        setIsConnecting(true);
        setError(null);

        const roomData = JSON.parse(roomDataString);
        const token = roomData?.access_token;
        const livekitUrl = getLiveKitUrl();

        if (!token) {
          throw new Error("Access token not found in room data");
        }

        logger.info("Connecting to LiveKit room...");
        await room.connect(livekitUrl, token);
        logger.info("Successfully connected to room:", { roomName: room.name });

        setIsConnected(true);
        setIsConnecting(false);

        await room.localParticipant.setMicrophoneEnabled(true);
        logger.info("Microphone enabled");

        // Set up audio track listeners
        room.localParticipant.on(RoomEvent.TrackPublished, publication => {
          try {
            if (publication.kind === Track.Kind.Audio) {
              if (!publication.track) {
                throw new Error("Audio track is undefined");
              }
              logger.debug("Attaching audio track...");
              publication.track.attach();
              logger.debug("Audio track attached successfully");
            }
          } catch (error) {
            logger.error("Error handling audio track:", error);
          }
        });

        room.localParticipant.on(RoomEvent.TrackSubscribed, track => {
          logger.debug("New track subscribed:", { kind: track.kind });
        });

        room.localParticipant.on(RoomEvent.TrackUnsubscribed, track => {
          logger.debug("Track unsubscribed:", { kind: track.kind });
        });

        room.on(RoomEvent.Disconnected, () => {
          logger.info("Disconnected from room");
          setIsConnected(false);
          setIsConnecting(false);
        });
      }
    } catch (error) {
      logger.error("Failed to connect to LiveKit room:", error);
      setIsConnecting(false);
      setIsConnected(false);
      setError(error instanceof Error ? error.message : "Failed to connect to room");
    }
  };

  const handleEndSession = async () => {
    try {
      await deleteRoom(room?.name);
    } catch (error) {
      logger.error("Failed to delete room:", error);
    }
    clearTimer();
    if (room.localParticipant) {
      room.localParticipant.setMicrophoneEnabled(false);
    }
    setIsConnected(false);
    setIsConnecting(false);
    room.disconnect();
    navigate(APP_ROUTES.CALL_SUMMARY, { replace: true });
  };

  const handleTimeLimit = () => {
    handleEndSession();
  };

  const handleWarning = () => {
    setShowWarning(true);
    // Auto-hide warning after 10 seconds
    setTimeout(() => {
      setShowWarning(false);
    }, 10000);
  };

  const handleCloseWarning = () => {
    setShowWarning(false);
  };

  useEffect(() => {
    let connectionTimeout: ReturnType<typeof setTimeout>;

    // Add a small delay before connecting to avoid race conditions in StrictMode
    connectionTimeout = setTimeout(() => {
      connectToRoom();
    }, 100);

    return () => {
      clearTimeout(connectionTimeout);

      // Only disconnect if we're actually connected
      if (isConnected && room.localParticipant) {
        logger.info("Cleaning up: disabling microphone");
        room.localParticipant.setMicrophoneEnabled(false);
        logger.info("Disconnecting from room");
        setIsConnected(false);
        setIsConnecting(false);
        room.disconnect();
      }
    };
  }, [roomId]);

  return {
    room,
    isConnecting,
    isConnected,
    error,
    showWarning,
    startTime,
    handleEndSession,
    handleRetryConnection,
    handleExitToHome,
    handleTimeLimit,
    handleWarning,
    handleCloseWarning,
  };
};
