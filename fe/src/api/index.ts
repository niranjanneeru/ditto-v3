import { API_METHODS, API_ROUTES, APP_ROUTES, LOCAL_STORAGE_KEYS } from "@constants";
import type { RequestOptions } from "@types";
import { logger } from "@utils/logger";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  statusText: string;
  data: any;

  constructor(status: number, statusText: string, data: any) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

const handleSessionExpiry = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);

  setTimeout(() => {
    window.location.href = APP_ROUTES.HOME;
  }, 1000);
};

export async function baseApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  try {
    // Validate BASE_URL before constructing URL
    if (!BASE_URL) {
      throw new Error("API base URL is not configured. Please check your environment variables.");
    }

    // Prepare URL with query parameters
    const url = new URL(`${BASE_URL}${endpoint}`);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "ngrok-skip-browser-warning": "true",
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if access token exists and requiresAuth is not false
    if (options.requiresAuth !== false) {
      const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method: options.method || API_METHODS.GET,
      headers,
      credentials: "omit", // Changed from 'include' to 'omit' to fix CORS issue
      mode: "cors",
    };

    // Add body if present
    if (options.body) {
      requestOptions.body = JSON.stringify(options.body);
    }

    // Make the request
    const response = await fetch(url.toString(), requestOptions);

    // Handle non-OK responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      if (
        response.status === 401 &&
        endpoint !== API_ROUTES.SCENARIOS &&
        endpoint !== API_ROUTES.REFRESH_TOKEN &&
        refreshToken
      ) {
        const refreshUrl = new URL(`${BASE_URL}${API_ROUTES.REFRESH_TOKEN}`);
        const refreshResponse = await fetch(refreshUrl.toString(), {
          method: API_METHODS.POST,
          headers,
          credentials: "omit", // Changed from 'include' to 'omit' to fix CORS issue
          mode: "cors",
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (refreshResponse.ok) {
          const refreshResponseData = await refreshResponse.json();
          localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, refreshResponseData.access_token);
          localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshResponseData.refresh_token);
          requestOptions.headers = {
            ...requestOptions.headers,
            Authorization: `Bearer ${refreshResponseData.access_token}`,
          };
          const response = await fetch(url.toString(), requestOptions);
          if (response.ok) {
            const responseData = await response.json();
            return { data: responseData } as T;
          }
        } else {
          handleSessionExpiry();
        }
      } else if (response.status === 401) {
        handleSessionExpiry();
      }
      logger.warn(JSON.stringify(errorData));
      return { error: { message: JSON.stringify(errorData), status: response.status } } as T;
    }

    // Parse and return the response
    const responseData = await response.json();
    return { data: responseData } as T;
  } catch (error) {
    logger.warn(JSON.stringify(error));
    return { error: { message: JSON.stringify(error), status: 1000 } } as T;
  }
}

// Export functions from apiCall.ts
export {
  logout,
  sendOtp,
  verifyOtp,
  listRooms,
  createRoom,
  deleteRoom,
  addFeedback,
  getScenarios,
} from "./apiCall";
