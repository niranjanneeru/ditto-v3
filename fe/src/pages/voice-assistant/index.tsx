import { RoomAudioRenderer, RoomContext } from "@livekit/components-react";
import "@livekit/components-styles";

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
    </RoomContext.Provider>
  );
};
