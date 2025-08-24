import { RoomAudioRenderer, RoomContext } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect } from "react";
import { RoomEvent, DataPacket_Kind } from "livekit-client";
import { toast, Toaster } from "react-hot-toast";

import { Header, SimulationLoader } from "@components";
import { useVoiceAssistant } from "@hooks";
import { Timer } from "./components/Timer";
import { CustomControlBar } from "./components/CustomControlBar";
import { HorizontalWaveVisualizer } from "./components/HorizontalWaveVisualizer";
import { WarningPopup } from "./components/WarningPopup";
import { ErrorPopup } from "./components/ErrorPopup";

export const VoiceAssistant = () => {
  const {
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
  } = useVoiceAssistant();

  // Subscribe to sim:email topic events only
  useEffect(() => {
    if (room && isConnected) {
      // Use a more specific approach to avoid interfering with audio
      const handleDataReceived = (
        payload: Uint8Array,
        _participant: any,
        kind?: DataPacket_Kind,
        topic?: string,
      ) => {
        console.log({ topic, kind });
        // Only process sim:email topic events, ignore all others
        if (topic === "sim:email" && kind === DataPacket_Kind.RELIABLE) {
          try {
            const eventData = JSON.parse(new TextDecoder().decode(payload));
            // Handle different phases
            if (eventData.phase === "Complete") {
              toast.success("📧 Email sent successfully!", {
                duration: 4000,
                position: "top-right",
                style: {
                  background: "#10B981",
                  color: "white",
                  borderRadius: "8px",
                  padding: "12px 16px",
                },
              });
            }
          } catch (error) {
            console.error("Error parsing sim:email event data:", error);
          }
        }
        // Don't return anything - let other handlers process non-sim:email events
      };

      // Add the event listener - this should not interfere with audio
      room.on(RoomEvent.DataReceived, handleDataReceived);

      return () => {
        // Clean up the event listener
        room.off(RoomEvent.DataReceived, handleDataReceived);
      };
    }
  }, [room, isConnected]);

  const renderSessionStatus = () => {
    if (!isConnected) return null;

    return (
      <div className="absolute sm:top-0 top-[10px] left-0 right-0 text-center mb-4">
        <div className="text-gray-900 text-xl sm:mb-[20px] mb-[10px]">
          Our agent is listening...
        </div>
        <Timer
          startTime={startTime}
          onTimeLimit={handleTimeLimit}
          onWarning={handleWarning}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (isConnecting) {
      return <SimulationLoader />;
    }

    if (isConnected) {
      return (
        <>
          {renderSessionStatus()}
          <RoomAudioRenderer />
          <div className="flex flex-col items-center justify-center gap-8 w-full">
            <HorizontalWaveVisualizer />
          </div>
          <CustomControlBar onEndSession={handleEndSession} />
        </>
      );
    }

    return null;
  };

  return (
    <RoomContext.Provider value={room}>
      <Header disableIconClick={true} isShowProfile={false} />
      <div className="h-full min-h-[82vh] flex flex-col items-center justify-center relative font-['IBM_Plex_Serif']">
        {renderContent()}

        <WarningPopup isOpen={showWarning} onClose={handleCloseWarning} />
        <ErrorPopup
          isOpen={!!error}
          onClose={handleRetryConnection}
          onExit={handleExitToHome}
          errorMessage={error || ""}
        />
      </div>
      <Toaster />
    </RoomContext.Provider>
  );
};
