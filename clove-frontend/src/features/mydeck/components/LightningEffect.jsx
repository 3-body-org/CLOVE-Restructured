import { useEffect, useState, useRef } from 'react';
import styles from '../themes/detectiveTheme.module.scss';

const DEFAULT_FLASH_DURATION = 100;

const LightningEffect = ({ flashDuration = DEFAULT_FLASH_DURATION }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const timeoutRef = useRef(null);
  const flashTimeoutRef = useRef(null);

  useEffect(() => {
    const triggerLightning = () => {
      setIsFlashing(true);
      flashTimeoutRef.current = setTimeout(() => setIsFlashing(false), flashDuration);
    };

    const scheduleLightning = () => {
      // Random interval between 2-4 minutes (120-240 seconds)
      const delay = Math.random() * 120000 + 120000;
      timeoutRef.current = setTimeout(() => {
        triggerLightning();
        scheduleLightning();
      }, delay);
    };

    scheduleLightning();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, [flashDuration]);

  return (
    <div
      className={styles.lightningOverlay}
      style={{ backgroundColor: isFlashing ? 'rgba(255, 255, 255, 0.4)' : 'transparent' }}
      aria-hidden="true"
    />
  );
};

export default LightningEffect; 