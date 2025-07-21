import { useState, useEffect } from 'react';

export const useTimer = (initialTime = 300, onTimeExpired) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerInterval);
          setTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    if (timeExpired && onTimeExpired) {
      onTimeExpired();
    }
  }, [timeExpired, onTimeExpired]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const resetTimer = (newTime = initialTime) => {
    setTimeLeft(newTime);
    setTimeExpired(false);
  };

  return {
    timeLeft,
    timeExpired,
    formatTime,
    resetTimer
  };
}; 