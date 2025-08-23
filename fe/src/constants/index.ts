export * from "./animationData";
export * from "./voiceAssistant";

const APP_ROUTES = {
  HOME: "/",
  VOICE_ASSISTANT: "/voice-assistant",
  HEALTH: "/health",
  CALL_SUMMARY: "/call-summary",
} as const;

const API_ROUTES = {
  VERIFY_OTP: "/api/v1/auth/verify-otp",
  ROOMS: "/api/v1/rooms",
  SCENARIOS: "/api/v1/scenarios",
  SEND_OTP: "/api/v1/auth/send-otp",
  REFRESH_TOKEN: "/api/v1/auth/refresh",
  FEEDBACK: "/api/v1/feedback/", // slash appended at the end to fix Fastapi bug
  LOGOUT: "/api/v1/auth/logout",
} as const;

const API_METHODS = {
  POST: "POST",
  GET: "GET",
  DELETE: "DELETE",
} as const;

const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  ROOM_DATA: "roomData",
  USER_NAME: "userName",
} as const;

export { APP_ROUTES, LOCAL_STORAGE_KEYS, API_ROUTES, API_METHODS };
