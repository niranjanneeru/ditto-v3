import type { RoomOptions } from "livekit-client";

const LIVEKIT_CONFIG: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  publishDefaults: {
    simulcast: true,
    videoSimulcastLayers: [],
  },
};

const getLiveKitUrl = (): string => {
  const url = import.meta.env.VITE_LIVEKIT_URL;
  if (!url) {
    throw new Error("LiveKit URL not found in environment variables");
  }
  return url;
};

export { LIVEKIT_CONFIG, getLiveKitUrl };
