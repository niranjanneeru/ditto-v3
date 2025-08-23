import { useState, useEffect, useRef } from "react";

import { AUDIO } from "@constants";

export const useAudioLevel = (track: MediaStreamTrack | undefined) => {
  const [level, setLevel] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!track) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(new MediaStream([track]));
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = AUDIO.FFT_SIZE;
    source.connect(analyser);
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const average =
        dataArrayRef.current.reduce((acc, val) => acc + val, 0) / dataArrayRef.current.length;
      setLevel(average / AUDIO.NORMALIZATION_FACTOR);
      frameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      audioContext.close();
    };
  }, [track]);

  return level;
};
