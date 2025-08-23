import { Room, Track, TrackPublication } from "livekit-client";
interface CircleConfig {
  scale: number;
  isStatic: boolean;
}
interface AudioTrackRef {
  participant: any;
  source: Track.Source;
  publication?: TrackPublication;
}
interface TimerProps {
  startTime?: Date;
  timeLimit?: number;
  onTimeLimit?: () => void;
  onWarning?: () => void;
}
interface ControlButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  ariaLabel: string;
  hoverColor?: "red" | "blue" | "gray";
}
interface AppConfig {
  apiUrl: string;
  livekitUrl: string;
}

interface ProfilePopupProps {
  userName?: string;
  onLogout: () => void;
  onClose: () => void;
}

interface SessionMetric {
  label: string;
  value: string | number;
}

interface SessionSummaryProps {
  data: {
    overallScore: number;
    empathyScore: number;
    responsesGiven: number;
    sessionDuration: string;
  };
}

interface SkillAssessmentProps {
  data: {
    empathy: number;
    listening: number;
    timing: number;
    overall: number;
  };
}

interface Scenario {
  unique_id: string;
  title?: string;
  short_description?: string;
  long_description?: string;
  cover_image?: string | null;
}

interface ScenarioCardProps {
  title: string;
  description: string;
  coverImage: string;
  onClick: () => void;
}

interface ScenarioCardExpandedProps {
  scenario?: Scenario;
  onClose?: () => void;
  onStart?: () => void;
}

interface ErrorResponse {
  message: string;
  status: number;
}

interface LoginResponse {
  data?: {
    name?: string;
    tokens: { access_token: string; refresh_token: string };
  };
  error?: ErrorResponse;
}

interface RoomCreationResponse {
  data?: {
    room_id: string;
    participant_id: string;
    access_token: string;
    created_at: string;
  };
  error?: ErrorResponse;
}

interface RoomListResponse {
  data?: {
    sid: string;
    name: string;
    created_at: string;
  };
  error?: ErrorResponse;
}

interface RoomDeletionResponse {
  data?: {
    message?: string;
  };
  error?: ErrorResponse;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: any;
  params?: Record<string, string>;
  requiresAuth?: boolean;
}

interface UseVoiceAssistantReturn {
  room: Room;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  showWarning: boolean;
  startTime: Date;
  handleEndSession: () => void;
  handleRetryConnection: () => void;
  handleExitToHome: () => void;
  handleTimeLimit: () => void;
  handleWarning: () => void;
  handleCloseWarning: () => void;
}

interface ErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onExit: () => void;
  errorMessage: string | null;
}

interface WarningPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomControlBarProps {
  onEndSession: () => void;
}

interface ScenariosResponse {
  data?: {
    scenarios: Scenario[];
  };
  error?: ErrorResponse;
}

interface LoginRequest {
  otp: string;
  email: string;
}

interface SendOtpResponse {
  data?: {
    email: string;
    expires_in_minutes: number;
    message: string;
  };
  error?: ErrorResponse;
}

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: LoginRequest) => void;
  onSendOtpTrigger: (email: string) => Promise<SendOtpResponse>;
}

interface FeedbackResponse {
  data?: {
    message: string;
  };
  error?: ErrorResponse;
}

interface LogoutResponse {
  data?: {
    message: string;
  };
  error?: ErrorResponse;
}

interface FeedbackRequest {
  rating?: number;
  comment?: string;
}

export type {
  ProfilePopupProps,
  AppConfig,
  SendOtpResponse,
  UseVoiceAssistantReturn,
  SessionMetric,
  SessionSummaryProps,
  SkillAssessmentProps,
  Scenario,
  ScenarioCardProps,
  ScenarioCardExpandedProps,
  CircleConfig,
  AudioTrackRef,
  TimerProps,
  ControlButtonProps,
  LoginResponse,
  RoomCreationResponse,
  RoomListResponse,
  ErrorResponse,
  RequestOptions,
  HttpMethod,
  ErrorPopupProps,
  WarningPopupProps,
  CustomControlBarProps,
  RoomDeletionResponse,
  ScenariosResponse,
  LoginPopupProps,
  FeedbackResponse,
  FeedbackRequest,
  LogoutResponse,
};
