import type { CircleConfig } from "@types";

const AUDIO = {
  FFT_SIZE: 256,
  NORMALIZATION_FACTOR: 128,
  THRESHOLD: 0.01,
} as const;

const CIRCLE = {
  BASE_SIZE: 60,
  TRANSITION_MS: 200,
  MIN_SCALE: 1,
  BORDER: {
    WIDTH: 0.5,
    COLOR: "rgba(75, 85, 99, 0.3)",
  },
  GRADIENT: {
    START_COLOR: "75, 85, 99", // RGB for #4B5563 (gray-600)
    END_COLOR: "243, 244, 246", // RGB for #F3F4F6 (gray-100)
    ANGLE: 180,
  },
} as const;

const CIRCLE_CONFIGS: CircleConfig[] = [
  { scale: 1, isStatic: true },
  { scale: 2, isStatic: true },
  { scale: 3, isStatic: false },
  { scale: 4, isStatic: false },
];

const MAX_SESSION_MINUTES = 600; // 10 mins
const WARNING_THRESHOLD = 30; // 30 seconds before end

export { AUDIO, CIRCLE, CIRCLE_CONFIGS, MAX_SESSION_MINUTES, WARNING_THRESHOLD };
