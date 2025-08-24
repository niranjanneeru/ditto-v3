import React, { useEffect, useState } from "react";
import { Track } from "livekit-client";
import { useLocalParticipant } from "@livekit/components-react";

import { useAudioLevel } from "@hooks";
import type { AudioTrackRef } from "@types";

const CircularWaveVisualizerInner: React.FC<{ trackRef: AudioTrackRef }> = ({
  trackRef,
}) => {
  const audioLevel = useAudioLevel(
    trackRef.publication?.track?.mediaStreamTrack,
  );
  const [barLengths, setBarLengths] = useState<number[]>([]);

  // Generate 180 bars for a complete circle
  const TOTAL_BARS = 180;
  const BASE_RADIUS = 80;
  const MIN_BAR_LENGTH = 20; // Increased minimum height
  const MAX_BAR_LENGTH = 120; // Increased maximum height

  useEffect(() => {
    // Generate wave pattern bar lengths that respond to audio level
    const generateBars = () => {
      const newBars = Array.from({ length: TOTAL_BARS }, (_, i) => {
        // Create wave pattern with multiple sine waves for natural variation
        const angle = (i / TOTAL_BARS) * Math.PI * 2;

        // Primary wave pattern
        const primaryWave = Math.sin(angle * 3) * 0.4 + 0.6;

        // Secondary wave pattern for more complexity
        const secondaryWave = Math.sin(angle * 7) * 0.2 + 0.8;

        // Tertiary wave pattern for fine detail
        const tertiaryWave = Math.sin(angle * 13) * 0.1 + 0.9;

        // Combine waves for natural pattern
        const wavePattern = primaryWave * secondaryWave * tertiaryWave;

        // Audio responsiveness
        const audioFactor = audioLevel * 6 + 0.4;

        // Add some randomness for organic feel
        const randomFactor = Math.random() * 0.3 + 0.7;

        // Calculate final height
        const height = Math.max(
          MIN_BAR_LENGTH,
          Math.min(
            MAX_BAR_LENGTH,
            MIN_BAR_LENGTH +
              (MAX_BAR_LENGTH - MIN_BAR_LENGTH) *
                wavePattern *
                audioFactor *
                randomFactor,
          ),
        );

        return height;
      });
      setBarLengths(newBars);
    };

    generateBars();

    // Update bars periodically for animation
    const interval = setInterval(generateBars, 100);
    return () => clearInterval(interval);
  }, [audioLevel]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative">
        {/* Central circle */}
        <div className="w-40 h-40 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
          <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-full border border-gray-100"></div>
          </div>
        </div>

        {/* Radial bars */}
        {barLengths.map((length, index) => {
          const angle = (index / TOTAL_BARS) * Math.PI * 2;
          const x = Math.cos(angle) * BASE_RADIUS;
          const y = Math.sin(angle) * BASE_RADIUS;

          return (
            <div
              key={index}
              className="absolute bg-black origin-center"
              style={{
                width: "3px", // Increased bar width
                height: `${length}px`,
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                opacity: 0.9, // Increased opacity
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export const CircularWaveVisualizer: React.FC = () => {
  const { localParticipant } = useLocalParticipant();
  const audioPublication = localParticipant
    ?.getTrackPublications()
    .find((pub) => pub.kind === Track.Kind.Audio);

  return (
    <div className="flex justify-center items-center w-[90%] sm:w-[60%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] h-[70vh]">
      <CircularWaveVisualizerInner
        trackRef={{
          participant: localParticipant,
          source: Track.Source.Microphone,
          publication: audioPublication,
        }}
      />
    </div>
  );
};
