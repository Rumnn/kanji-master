import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  duration: number;     // seconds
  onTimeout: () => void;
  isPaused?: boolean;
  key?: string | number; // to reset timer
}

export default function CountdownTimer({ duration, onTimeout, isPaused = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) {
      if (timeLeft <= 0) onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPaused, timeLeft <= 0]);

  const percentage = (timeLeft / duration) * 100;
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  // Color based on time remaining
  let color = 'text-emerald-500';
  let bgColor = 'text-emerald-50';
  if (percentage < 30) {
    color = 'text-rose-500';
    bgColor = 'text-rose-50';
  } else if (percentage < 60) {
    color = 'text-amber-500';
    bgColor = 'text-amber-50';
  }

  const isLow = timeLeft < 3;

  return (
    <div className={`relative w-24 h-24 ${isLow ? 'animate-pulse' : ''}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className={`${bgColor} stroke-current`}
          strokeWidth="6"
          cx="50" cy="50" r="42"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          className={`${color} stroke-current transition-all duration-100 ease-linear`}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          cx="50" cy="50" r="42"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-black tabular-nums ${color.replace('text-', 'text-')}`}>
          {Math.ceil(timeLeft)}
        </span>
      </div>
    </div>
  );
}
