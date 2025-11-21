import React, { useState, useEffect } from 'react';

const AnimatedProgress = ({ 
  label = 'Progress', 
  targetValue = 75, 
  color = 'emerald',
  icon = '📊'
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < targetValue) {
        setProgress(progress + 1);
      }
    }, 20);

    return () => clearTimeout(timer);
  }, [progress, targetValue]);

  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    green: 'from-green-500 to-emerald-500'
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-gray-700">{label}</span>
        </div>
        <span className="text-2xl font-bold gradient-text">{progress}%</span>
      </div>
      
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 shimmer"></div>
        </div>
      </div>
      
      <div className="mt-2 flex items-center gap-2">
        <div className="status-dot"></div>
        <span className="text-xs text-gray-500">Live Update</span>
      </div>
    </div>
  );
};

export default AnimatedProgress;
