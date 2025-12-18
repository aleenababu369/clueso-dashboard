// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface DOMEvent {
  type: string;
  timestamp: number;
  selector?: string;
  coordinates?: { x: number; y: number };
  viewport?: { width: number; height: number };
  target?: {
    tagName?: string;
    id?: string;
    className?: string;
    text?: string;
  };
}

export interface Recording {
  id: string;
  status: "uploaded" | "processing" | "draft_ready" | "completed" | "failed";
  currentStep?: string;
  targetLanguage?: string;
  title?: string;
  description?: string;
  filePath?: string;
  finalVideoPath?: string;
  cleanedScript?: string;
  transcript?: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

export interface UploadResponse {
  success: boolean;
  recordingId: string;
  status: string;
  message: string;
}

export interface RecordingsListResponse {
  success: boolean;
  recordings: Recording[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Token storage key
const ACCESS_TOKEN_KEY = "clueso_access_token";

// Get access token from storage
function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// Handle 401 response - try to refresh token
async function handleUnauthorized(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      // Clear storage and redirect to login
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem("clueso_user");
      window.location.href = "/auth";
      return null;
    }

    const data = await response.json();
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    return data.accessToken;
  } catch (error) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem("clueso_user");
    window.location.href = "/auth";
    return null;
  }
}

// Fetch with auth - automatically handles 401 and retries
async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  const authOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  let response = await fetch(url, authOptions);

  // If 401, try to refresh token and retry
  if (response.status === 401) {
    const newToken = await handleUnauthorized();
    if (newToken) {
      authOptions.headers = {
        ...authOptions.headers,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(url, authOptions);
    }
  }

  return response;
}

// API Service for interacting with the Node.js backend
export const api = {
  /**
   * Upload a video recording with DOM events
   */
  async uploadRecording(
    videoFile: File,
    domEvents: DOMEvent[],
    options?: { title?: string; description?: string }
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("events", JSON.stringify(domEvents));

    if (options?.title) {
      formData.append("title", options.title);
    }
    if (options?.description) {
      formData.append("description", options.description);
    }

    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/recordings`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  },

  /**
   * Get a recording by ID
   */
  async getRecording(
    id: string
  ): Promise<{ success: boolean; recording: Recording }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/recordings/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch recording");
    }

    return response.json();
  },

  /**
   * List all recordings with optional filters
   */
  async listRecordings(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<RecordingsListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);

    const response = await fetchWithAuth(
      `${API_BASE_URL}/recordings?${searchParams}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch recordings");
    }

    return response.json();
  },

  /**
   * Download the final processed video
   */
  async downloadRecording(id: string): Promise<Blob> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/recordings/${id}/download`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Download failed");
    }

    return response.blob();
  },

  /**
   * Delete a recording
   */
  async deleteRecording(id: string): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/recordings/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Delete failed");
    }
  },

  /**
   * Process a draft recording with translation
   */
  async processRecording(
    id: string,
    language: string
  ): Promise<{ success: boolean; message: string; status: string }> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/recordings/${id}/process`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Processing failed");
    }

    return response.json();
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL.replace("/api", "")}/health`);
    return response.json();
  },
};

export default api;
