import { API_METHODS, API_ROUTES, LOCAL_STORAGE_KEYS } from "@constants";
import type {
  LoginResponse,
  RoomCreationResponse,
  RoomListResponse,
  RoomDeletionResponse,
  ScenariosResponse,
  SendOtpResponse,
  FeedbackResponse,
  FeedbackRequest,
  LogoutResponse,
} from "@types";
import { baseApi } from "@api";

const sendOtp = async ({ email }: { email: string }): Promise<SendOtpResponse> => {
  const response = await baseApi<SendOtpResponse>(API_ROUTES.SEND_OTP, {
    method: API_METHODS.POST,
    body: {
      email: email?.trim()?.toLowerCase(),
    },
  });

  return response;
};

const verifyOtp = async ({
  otp,
  email,
}: {
  email: string;
  otp: string;
}): Promise<LoginResponse> => {
  const response = await baseApi<LoginResponse>(API_ROUTES.VERIFY_OTP, {
    method: API_METHODS.POST,
    body: {
      code: otp,
      email,
    },
    requiresAuth: false, // Specify that this endpoint doesn't need authentication
  });

  if (response?.data?.tokens?.access_token) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, response.data.tokens?.access_token);
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, response.data.tokens?.refresh_token);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_NAME, response.data.name || "");
  }

  return response;
};

const createRoom = async (): Promise<RoomCreationResponse> => {
  // Generate a unique session ID
  const uniqueSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  const response = await baseApi<RoomCreationResponse>(API_ROUTES.ROOMS, {
    method: API_METHODS.POST,
    body: {
      session_id: uniqueSessionId,
    },
  });

  return response;
};

const listRooms = async (): Promise<RoomListResponse> => {
  const response = await baseApi<RoomListResponse>(API_ROUTES.ROOMS, {
    method: API_METHODS.GET,
  });

  return response;
};

const deleteRoom = async (roomId: string): Promise<RoomDeletionResponse> => {
  const response = await baseApi<RoomDeletionResponse>(`${API_ROUTES.ROOMS}/${roomId}`, {
    method: API_METHODS.DELETE,
  });

  return response;
};

const getScenarios = async (): Promise<ScenariosResponse> => {
  const response = await baseApi<ScenariosResponse>(API_ROUTES.SCENARIOS, {
    method: API_METHODS.GET,
    params: {
      _t: Date.now().toString(), // Cache busting parameter
    },
  });

  return response;
};

const addFeedback = async ({ rating, comment }: FeedbackRequest): Promise<FeedbackResponse> => {
  const response = await baseApi<FeedbackResponse>(API_ROUTES.FEEDBACK, {
    method: API_METHODS.POST,
    body: {
      rating: rating?.toString(),
      comment,
    },
  });

  return response;
};

const logout = async (): Promise<LogoutResponse> => {
  const response = await baseApi<LogoutResponse>(API_ROUTES.LOGOUT, {
    method: API_METHODS.POST,
  });

  return response;
};

export { sendOtp, verifyOtp, createRoom, listRooms, deleteRoom, addFeedback, getScenarios, logout };
