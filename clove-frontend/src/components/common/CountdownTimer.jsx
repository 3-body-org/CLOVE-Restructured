import React, { useState, useEffect } from 'react';
import './CountdownTimer.scss';

const CountdownTimer = ({ 
  targetTime, 
  onComplete, 
  showDays = false,
  className = '',
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!targetTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        if (onComplete) onComplete();
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onComplete]);

  if (isExpired) {
    return (
      <div className={`countdown-timer countdown-timer--expired countdown-timer--${size} ${className}`}>
        <span className="countdown-timer__text">Available Now!</span>
      </div>
    );
  }

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <div className={`countdown-timer countdown-timer--${size} ${className}`}>
      <div className="countdown-timer__content">
        {showDays && (
          <div className="countdown-timer__unit">
            <span className="countdown-timer__number">{formatNumber(timeLeft.days)}</span>
            <span className="countdown-timer__label">Days</span>
          </div>
        )}
        <div className="countdown-timer__unit">
          <span className="countdown-timer__number">{formatNumber(timeLeft.hours)}</span>
          <span className="countdown-timer__label">Hours</span>
        </div>
        <div className="countdown-timer__unit">
          <span className="countdown-timer__number">{formatNumber(timeLeft.minutes)}</span>
          <span className="countdown-timer__label">Minutes</span>
        </div>
        <div className="countdown-timer__unit">
          <span className="countdown-timer__number">{formatNumber(timeLeft.seconds)}</span>
          <span className="countdown-timer__label">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
