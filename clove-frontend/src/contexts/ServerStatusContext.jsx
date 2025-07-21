import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import errorReporter from "../components/error_fallback/errorReporting";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const ServerStatusContext = createContext();

export function ServerStatusProvider({ children }) {
  const [serverDown, setServerDown] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const isCheckingRef = useRef(false);
  const serverDownRef = useRef(false); // Track current serverDown state

  const clearRetryTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const scheduleRetry = () => {
    clearRetryTimeout();
    // Start with 10s, then 20s, 30s, 30s...
    const baseDelay = 10000; // 10 seconds
    const backoffDelay = Math.min(baseDelay * Math.pow(2, Math.max(retryCountRef.current - 1, 0)), 30000);
    timeoutRef.current = setTimeout(() => {
      if (!isCheckingRef.current) {
        checkServerHealth();
      }
    }, backoffDelay);
  };  

  const checkServerHealth = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      const data = await res.json();
      if (data.status !== "healthy") {
        throw new Error(`Server status: ${data.status}`);
      }
      // Server is healthy
      setServerDown(false);
      serverDownRef.current = false;
      setLastError(null);
      setRetryCount(0);
      retryCountRef.current = 0;
      clearRetryTimeout();
    } catch (error) {
      // Determine error type
      let errorType = 'NETWORK_ERROR';
      let errorMessage = 'Unable to connect to server';
      if (error.name === 'AbortError') {
        errorType = 'TIMEOUT_ERROR';
        errorMessage = 'Server request timed out';
      } else if (error.message.includes('status:')) {
        errorType = 'SERVER_ERROR';
        errorMessage = `Server error: ${error.message}`;
      } else if (!navigator.onLine) {
        errorType = 'OFFLINE_ERROR';
        errorMessage = 'No internet connection';
      }
      setServerDown(true);
      serverDownRef.current = true;
      retryCountRef.current += 1;
      setRetryCount(retryCountRef.current);
      setLastError({
        type: errorType,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        retryCount: retryCountRef.current
      });
      errorReporter.captureApiError(error, '/health', {
        errorType,
        retryCount: retryCountRef.current,
        isOnline: navigator.onLine
      });
      scheduleRetry();
    } finally {
      isCheckingRef.current = false;
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkServerHealth();
    const handleOnline = () => {
      if (serverDownRef.current) {
        checkServerHealth();
      }
    };
    const handleOffline = () => {
      setServerDown(true);
      serverDownRef.current = true;
      retryCountRef.current += 1;
      setRetryCount(retryCountRef.current);
      setLastError({
        type: 'OFFLINE_ERROR',
        message: 'No internet connection',
        timestamp: new Date().toISOString(),
        retryCount: retryCountRef.current
      });
      scheduleRetry();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearRetryTimeout();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkServerHealth]); // Only depend on checkServerHealth, not serverDown

  return (
    <ServerStatusContext.Provider value={{ 
      serverDown, 
      checkServerHealth, 
      isChecking,
      lastError,
      retryCount
    }}>
      {children}
    </ServerStatusContext.Provider>
  );
}

export function useServerStatus() {
  return useContext(ServerStatusContext);
} 