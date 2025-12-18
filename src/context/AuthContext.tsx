import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Declare chrome for extension communication
declare const chrome: any;

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Extension ID - update this with your actual extension ID after loading in Chrome
const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID || "";

// Types
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  forgotPassword: (
    email: string
  ) => Promise<{ debug?: { resetToken: string; resetLink: string } }>;
  resetPassword: (
    email: string,
    token: string,
    newPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const ACCESS_TOKEN_KEY = "clueso_access_token";
const USER_KEY = "clueso_user";

// Sync auth state with Chrome extension
function syncAuthToExtension(token: string | null, user: User | null) {
  // Try to sync with extension if available
  if (typeof chrome !== "undefined" && chrome.runtime && EXTENSION_ID) {
    try {
      if (token && user) {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          {
            type: "AUTH_SYNC",
            token,
            user: { name: user.name, email: user.email },
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log(
                "Extension not available:",
                chrome.runtime.lastError.message
              );
            } else {
              console.log("Auth synced to extension:", response);
            }
          }
        );
      } else {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          { type: "AUTH_SYNC", logout: true },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log(
                "Extension not available:",
                chrome.runtime.lastError.message
              );
            } else {
              console.log("Logout synced to extension:", response);
            }
          }
        );
      }
    } catch (e) {
      console.log("Could not sync to extension:", e);
    }
  } else if (!EXTENSION_ID) {
    console.warn(
      "Clueso: Auth sync skipped - VITE_EXTENSION_ID is missing in .env"
    );
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setAccessToken(storedToken);
      setUser(parsedUser);
      // Sync to extension on page load if already authenticated
      syncAuthToExtension(storedToken, parsedUser);
    }
    setIsLoading(false);
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Send cookies
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      const newToken = data.accessToken;

      setAccessToken(newToken);
      localStorage.setItem(ACCESS_TOKEN_KEY, newToken);

      // Sync new token to extension
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        syncAuthToExtension(newToken, JSON.parse(storedUser));
      }

      return newToken;
    } catch (error) {
      // Clear auth state on refresh failure
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      syncAuthToExtension(null, null);
      return null;
    }
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    // Sync to extension
    syncAuthToExtension(data.accessToken, data.user);
  }, []);

  // Signup
  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setUser(data.user);
      setAccessToken(data.accessToken);
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      // Sync to extension
      syncAuthToExtension(data.accessToken, data.user);
    },
    []
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Sync logout to extension
    syncAuthToExtension(null, null);
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send reset email");
    }

    return data;
  }, []);

  // Reset password
  const resetPassword = useCallback(
    async (email: string, token: string, newPassword: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Password reset failed");
      }
    },
    []
  );

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    accessToken,
    login,
    signup,
    logout,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
