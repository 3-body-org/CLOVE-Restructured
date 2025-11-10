import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CustomExitWarningModal from "../features/challenges/components/CustomExitWarningModal";

// AuthContext: Central place for authentication state and functions
// Don't provide a default value - undefined means not in provider, null/object means in provider
const AuthContext = createContext(undefined);

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
  
  // --- Exit prevention for logout ---
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [isProcessingLogout, setIsProcessingLogout] = useState(false);
  
  const navigate = useNavigate();
  const refreshPromiseRef = useRef(null); // Prevents multiple refreshes at once

  // --- Check if user is in active challenge ---
  const isInActiveChallenge = () => {
    if (!user) return false;
    
    // Check for any active challenge session with the correct format
    const challengeKeys = Object.keys(localStorage).filter(key => 
      key.startsWith(`challenge_active_${user.id}_`)
    );
    
    return challengeKeys.length > 0;
  };

  // --- Handle logout with exit prevention ---
  const handleLogout = () => {
    if (isInActiveChallenge()) {
      setShowLogoutWarning(true);
      return;
    }
    
    // No active challenge, proceed with normal logout
    performLogout();
  };

  // --- Perform actual logout ---
  const performLogout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    
    // Call all registered reset callbacks (e.g., MyDeckContext)
    resetCallbacks.forEach(fn => {
      try { fn(); } catch (e) { /* Reset callback error */ }
    });
    
    // Clear session storage
    sessionStorage.clear();
    
    // Clear any pending challenge cancellations
    localStorage.removeItem('pending_challenge_cancellation');
    
    // Clear all challenge session keys
    const challengeKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('challenge_active_')
    );
    challengeKeys.forEach(key => localStorage.removeItem(key));
    
    navigate("/", { replace: true });
  };

  // --- Handle logout warning modal actions ---
  const handleContinueChallenge = () => {
    setShowLogoutWarning(false);
  };

  const handleLogoutAnyway = async () => {
    setIsProcessingLogout(true);
    
    try {
      // Cancel any active challenge sessions
      if (user) {
        const challengeKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('challenge_active_') && key.includes(`_${user.id}_`)
        );
        
        for (const key of challengeKeys) {
          try {
            const sessionData = JSON.parse(localStorage.getItem(key));
            if (sessionData && sessionData.challengeId) {
              // Try to cancel the challenge via API
              const response = await fetch(`${API_BASE}/challenge_attempts/cancel/user/${user.id}/challenge/${sessionData.challengeId}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              });
              // Challenge cancellation response logged
            }
          } catch (error) {
            // Error cancelling challenge during logout
          }
        }
      }
    } catch (error) {
      // Error during logout challenge cancellation
    } finally {
      setIsProcessingLogout(false);
      setShowLogoutWarning(false);
      performLogout();
    }
  };

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
          performLogout(); // Use performLogout here
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
            // Failed to fetch user data
          }
        } catch (error) {
          if (!isMounted) return;
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
        // Don't auto-login anymore since email verification is required
        return { 
          success: true, 
          message: "Account created successfully! Please check your email to verify your account before logging in.",
          requiresVerification: true
        };
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

  // --- Update user info locally (for immediate UI updates) ---
  function updateUser(userData) {
    setUser(prevUser => ({ ...prevUser, ...userData }));
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
        // Error refreshing user
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

  // --- Email Verification Functions ---
  async function sendVerificationEmail(email) {
    try {
      const res = await fetch(`${API_BASE}/auth/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        return { success: true, message: "Verification email sent successfully" };
      } else {
        const error = await res.json();
        return { success: false, message: error.detail || "Failed to send verification email" };
      }
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  }

  async function verifyEmail(token) {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-email/${token}`);
      
      if (res.ok) {
        return { success: true, message: "Email verified successfully" };
      } else {
        const error = await res.json();
        return { success: false, message: error.detail || "Failed to verify email" };
      }
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  }

  async function forgotPassword(email) {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        return { success: true, message: "If the email exists, a reset link has been sent" };
      } else {
        const error = await res.json();
        return { success: false, message: error.detail || "Failed to send reset email" };
      }
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  }

  async function resetPassword(token, newPassword) {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      
      if (res.ok) {
        return { success: true, message: "Password reset successfully" };
      } else {
        const error = await res.json();
        return { success: false, message: error.detail || "Failed to reset password" };
      }
    } catch (err) {
      return { success: false, message: "Network error" };
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
      logout: handleLogout, // Logout function with exit prevention
      updateUser, // Update user info locally
      refreshUser, // Refresh user info from backend
      makeAuthenticatedRequest, // For advanced API calls
      manualRefreshToken, // For manual token refresh (rarely needed)
      showLogoutWarning, // State for logout warning modal
      handleContinueChallenge, // Function to continue challenge
      handleLogoutAnyway, // Function to logout anyway
      isProcessingLogout, // State for processing logout
      // Email verification functions
      sendVerificationEmail, // Send verification email
      verifyEmail, // Verify email with token
      forgotPassword, // Send password reset email
      resetPassword // Reset password with token
    }}>
      {children}
      
      {/* Logout Warning Modal */}
      <CustomExitWarningModal
        isVisible={showLogoutWarning}
        onContinueChallenge={handleContinueChallenge}
        onLeaveAnyway={handleLogoutAnyway}
        isLoading={isProcessingLogout}
      />
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  // Only throw error if context is undefined (not provided by any provider)
  // The provider always provides an object, so undefined means we're outside the provider
  if (context === undefined) {
    // In development, provide more helpful error message
    if (import.meta.env.DEV) {
      console.error('useAuth called outside AuthProvider. Check component tree.');
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Context should always be an object when inside provider
  // If it's null or falsy, something went wrong but we'll return it anyway
  return context;
} 
