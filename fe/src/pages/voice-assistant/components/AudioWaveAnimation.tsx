import React from "react";
import { Track } from "livekit-client";
import { useLocalParticipant } from "@livekit/components-react";

import { useAudioLevel } from "@hooks";
import { AUDIO, CIRCLE, CIRCLE_CONFIGS } from "@constants";
import type { CircleConfig, AudioTrackRef } from "@types";

// Components
const Circle = ({
  circleNumber,
  config,
  audioLevel,
}: {
  circleNumber: number;
  config: CircleConfig;
  audioLevel: number;
}) => {
  const isActive = audioLevel > AUDIO.THRESHOLD;
  const scale =
    config.scale * (config.isStatic ? 1 : CIRCLE.MIN_SCALE + (audioLevel * circleNumber) / 3);
  const intensity = 1 / config.scale;

  const styles = React.useMemo(
    () => ({
      width: `${CIRCLE.BASE_SIZE}px`,
      height: `${CIRCLE.BASE_SIZE}px`,
      background: `linear-gradient(${CIRCLE.GRADIENT.ANGLE}deg, 
            rgba(${CIRCLE.GRADIENT.START_COLOR}, ${intensity}) 0%, 
            rgba(${CIRCLE.GRADIENT.END_COLOR}, ${intensity}) 100%)`,
      transform: `scale(${scale})`,
      transitionDuration: `${CIRCLE.TRANSITION_MS}ms`,
      border: `${config.isStatic && isActive ? CIRCLE.BORDER.WIDTH : 0}px solid ${CIRCLE.BORDER.COLOR}`,
      opacity: config.isStatic ? 1 : isActive ? 1 : 0,
    }),
    [config.isStatic, isActive, intensity, scale],
  );

  return <div className="absolute rounded-full transition-all" style={styles} />;
};

const CircleWaveVisualizer = ({ trackRef }: { trackRef: AudioTrackRef }) => {
  const audioLevel = useAudioLevel(trackRef.publication?.track?.mediaStreamTrack);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {CIRCLE_CONFIGS.map((config, index) => (
        <Circle key={index} circleNumber={index} config={config} audioLevel={audioLevel} />
      ))}
    </div>
  );
};

export const AudioWaveAnimation: React.FC = () => {
  const { localParticipant } = useLocalParticipant();
  const audioPublication = localParticipant
    ?.getTrackPublications()
    .find(pub => pub.kind === Track.Kind.Audio);

  return (
    <div className="flex justify-center items-center w-[90%] sm:w-[60%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] h-[70vh]">
      <CircleWaveVisualizer
        trackRef={{
          participant: localParticipant,
          source: Track.Source.Microphone,
          publication: audioPublication,
        }}
      />
    </div>
  );
};
