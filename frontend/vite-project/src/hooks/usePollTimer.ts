import { useState, useEffect, useRef } from 'react';

export const usePollTimer = (initialTimeLeft?: number, onTimeUp?: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft || 0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialTimeLeft !== undefined) {
      setTimeLeft(initialTimeLeft);
      setIsActive(initialTimeLeft > 0);
    }
  }, [initialTimeLeft]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsActive(false);
            if (onTimeUp) {
              onTimeUp();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, onTimeUp]);

  const stopTimer = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetTimer = (newTime: number) => {
    setTimeLeft(newTime);
    setIsActive(newTime > 0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isActive,
    stopTimer,
    resetTimer,
    formatTime: () => formatTime(timeLeft)
  };
};