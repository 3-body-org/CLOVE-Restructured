import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// AuthContext: Central place for authentication state and functions
const AuthContext = createContext();

// Add a global array to hold reset callbacks from other contexts
const resetCallbacks = [];
export function registerLogoutReset(fn) {
  resetCallbacks.push(fn);
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export function AuthProvider({ children }) {
  // --- State for user and tokens ---
  const [user, setUser] = useState(null); // Current user info
  const [token, setToken] = useState(() => localStorage.getItem("token")); // Access token
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken")); // Refresh token
  const [loading, setLoading] = useState(true); // Loading state for initial auth check
  const [isRefreshing, setIsRefreshing] = useState(false); // Is a token refresh in progress?
  const navigate = useNavigate();
  const refreshPromiseRef = useRef(null); // Prevents multiple refreshes at once

  // --- Refresh the access token using the refresh token ---
  const refreshAccessToken = async () => {
    if (!refreshToken) throw new Error("No refresh token available");
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        setRefreshToken(data.refresh_token);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        return data.access_token;
      } else {
        // If refresh fails, log out
        setUser(null);
        setToken(null);
        setRefreshToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        throw new Error("Refresh token is invalid");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  };

  // --- Make API requests with automatic token refresh ---
  const makeAuthenticatedRequest = async (url, options = {}) => {
    if (!token) throw new Error("No access token available");
    try {
      // Try with current token
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
      // If token expired, try to refresh and retry
      if (response.status === 401 && refreshToken) {
        if (!refreshPromiseRef.current) {
          refreshPromiseRef.current = refreshAccessToken();
        }
        try {
          const newToken = await refreshPromiseRef.current;
          refreshPromiseRef.current = null;
          // Retry with new token
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
          return retryResponse;
        } catch (refreshError) {
          refreshPromiseRef.current = null;
          logout();
          throw new Error("Session expired. Please login again.");
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  // --- On app load, check if user is logged in (using tokens in localStorage) ---
  useEffect(() => {
    let isMounted = true;
    async function fetchUser() {
      if (token) {
        try {
          const res = await makeAuthenticatedRequest(`${API_BASE}/auth/me`);
          if (!isMounted) return;
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            // Update streak on every visit after user is authenticated
            try {
              const streakRes = await makeAuthenticatedRequest(`${API_BASE}/statistics/update-streak`, { method: "POST" });
              if (streakRes.ok) {
                // Immediately fetch latest statistics after streak update
                try {
                  const statsRes = await makeAuthenticatedRequest(`${API_BASE}/statistics/me`);
                  if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setUser(prev => ({ ...prev, statistics: statsData }));
                  }
                } catch (statsErr) {}
              }
            } catch (e) {}
          } else if (res.status === 401) {
            // Token is invalid and refresh failed, clear everything
            setUser(null);
            setToken(null);
            setRefreshToken(null);
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
          } else {
            // Other errors: keep user data for now
            console.warn("Failed to fetch user data:", res.status);
          }
        } catch (error) {
          if (!isMounted) return;
          console.error("Error fetching user data:", error);
          if (!user) setUser(null);
        }
      } else {
        setUser(null);
      }
      if (isMounted) setLoading(false);
    }
    fetchUser();
    return () => { isMounted = false; };
  }, [token]);

  // --- Login: get tokens and user info from backend ---
  async function login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        setRefreshToken(data.refresh_token);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        // Fetch user data after login
        const userRes = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }
        navigate("/dashboard");
        return { success: true };
      } else {
        let errorMsg = "Login failed";
        try {
          const error = await res.json();
          if (error.detail) errorMsg = error.detail;
          else if (error.message) errorMsg = error.message;
        } catch {}
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  }

  // --- Signup: create user and get tokens ---
  async function signup(firstName, lastName, birthday, email, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          first_name: firstName, 
          last_name: lastName, 
          birthday: birthday,
          email, 
          password 
        }),
      });
      if (res.ok) {
        // Auto-login after signup
        return await login(email, password);
      } else {
        let errorMsg = "Signup failed";
        try {
          const error = await res.json();
          if (error.detail) errorMsg = error.detail;
          else if (error.message) errorMsg = error.message;
        } catch {}
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  }

  // --- Logout: clear tokens and user info ---
  function logout() {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    // Call all registered reset callbacks (e.g., MyDeckContext)
    resetCallbacks.forEach(fn => {
      try { fn(); } catch (e) { console.error("Reset callback error", e); }
    });
    // Clear session storage
    sessionStorage.clear();
    navigate("/login-signup", { replace: true });
  }

  // --- Refresh user info from backend ---
  async function refreshUser() {
    if (token) {
      try {
        const res = await makeAuthenticatedRequest(`${API_BASE}/auth/me`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (res.status === 401) {
          setUser(null);
          setToken(null);
          setRefreshToken(null);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        }
      } catch (error) {
        console.error("Error refreshing user:", error);
      }
    }
  }

  // --- Manual token refresh (for testing) ---
  async function manualRefreshToken() {
    if (isRefreshing) {
      return { success: false, message: "Token refresh already in progress" };
    }
    setIsRefreshing(true);
    try {
      await refreshAccessToken();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setIsRefreshing(false);
    }
  }

  // --- Provide all auth info and functions to the app ---
  return (
    <AuthContext.Provider value={{ 
      user, // Current user info
      token, // Access token
      refreshToken, // Refresh token
      loading, // Loading state
      isRefreshing, // Is a token refresh in progress?
      login, // Login function
      signup, // Signup function
      logout, // Logout function
      refreshUser, // Refresh user info from backend
      makeAuthenticatedRequest, // For advanced API calls
      manualRefreshToken // For manual token refresh (rarely needed)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
} 