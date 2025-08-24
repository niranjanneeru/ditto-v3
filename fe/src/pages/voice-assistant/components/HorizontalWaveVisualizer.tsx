import React, { useEffect, useState } from "react";
import { Track } from "livekit-client";
import { useLocalParticipant } from "@livekit/components-react";

import { useAudioLevel } from "@hooks";
import type { AudioTrackRef } from "@types";

const HorizontalWaveVisualizerInner: React.FC<{ trackRef: AudioTrackRef }> = ({
  trackRef,
}) => {
  const audioLevel = useAudioLevel(
    trackRef.publication?.track?.mediaStreamTrack,
  );
  const [barHeights, setBarHeights] = useState<
    Array<{ top: number; bottom: number; center: number }>
  >([]);

  // Initialize with default bar heights
  useEffect(() => {
    const defaultBars = Array.from({ length: TOTAL_BARS }, () => ({
      top: 0,
      bottom: 0,
      center: BASE_HEIGHT,
    }));
    setBarHeights(defaultBars);
  }, []);

  // Generate horizontal bars for the wave
  const TOTAL_BARS = 50;
  const BASE_HEIGHT = 4; // Center line thickness
  const MAX_EXTENSION = 40; // How far bars extend above/below center

  useEffect(() => {
    // Generate wave pattern bar heights that respond to audio level
    const generateBars = () => {
      const newBars = Array.from({ length: TOTAL_BARS }, (_, i) => {
        // Create wave pattern with multiple sine waves for natural variation
        const position = i / TOTAL_BARS;

        // Primary wave pattern
        const primaryWave = Math.sin(position * Math.PI * 4) * 0.4 + 0.6;

        // Secondary wave pattern for more complexity
        const secondaryWave = Math.sin(position * Math.PI * 8) * 0.2 + 0.8;

        // Tertiary wave pattern for fine detail
        const tertiaryWave = Math.sin(position * Math.PI * 12) * 0.1 + 0.9;

        // Combine waves for natural pattern
        const wavePattern = primaryWave * secondaryWave * tertiaryWave;

        // Audio responsiveness
        const audioFactor = audioLevel * 8 + 0.3;

        // Add some randomness for organic feel
        const randomFactor = Math.random() * 0.4 + 0.6;

        // Calculate extension above/below center line
        const extension =
          MAX_EXTENSION * wavePattern * audioFactor * randomFactor;

        // Return both top and bottom heights for organic wave
        return {
          top: Math.max(0, extension),
          bottom: Math.max(0, extension),
          center: BASE_HEIGHT,
        };
      });
      setBarHeights(newBars);
    };

    generateBars();

    // Update bars periodically for animation
    const interval = setInterval(generateBars, 100);
    return () => clearInterval(interval);
  }, [audioLevel]);

  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <div className="flex items-center gap-4">
        {/* Horizontal Wave Bars */}
        <div className="flex items-center gap-1 min-h-[80px]">
          {barHeights.map((bar, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Top bar */}
              <div
                className="bg-black rounded-sm"
                style={{
                  width: "4px",
                  height: `${bar.top}px`,
                  opacity: 0.9,
                }}
              />
              {/* Center line */}
              <div
                className="bg-black rounded-sm"
                style={{
                  width: "4px",
                  height: `${bar.center}px`,
                  opacity: 0.9,
                }}
              />
              {/* Bottom bar */}
              <div
                className="bg-black rounded-sm"
                style={{
                  width: "4px",
                  height: `${bar.bottom}px`,
                  opacity: 0.9,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const HorizontalWaveVisualizer: React.FC = () => {
  const { localParticipant } = useLocalParticipant();
  const audioPublication = localParticipant
    ?.getTrackPublications()
    .find((pub) => pub.kind === Track.Kind.Audio);

  return (
    <div className="flex justify-center items-center w-[90%] sm:w-[60%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] h-[70vh]">
      <HorizontalWaveVisualizerInner
        trackRef={{
          participant: localParticipant,
          source: Track.Source.Microphone,
          publication: audioPublication,
        }}
      />
    </div>
  );
};
