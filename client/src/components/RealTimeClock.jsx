import React, { useState, useEffect } from 'react';

const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!mounted) return null;

  return (
    <div className="clock-container animate-slide-in-bottom">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl font-bold tracking-wider mb-2">
            {formatTime(time)}
          </div>
          <div className="text-sm opacity-90">
            {formatDate(time)}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="status-dot mb-2"></div>
          <span className="text-xs font-semibold">LIVE</span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeClock;
