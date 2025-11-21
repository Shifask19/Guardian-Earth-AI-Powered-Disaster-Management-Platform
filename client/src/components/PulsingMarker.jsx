import React from 'react';

const PulsingMarker = ({ type = 'alert', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const typeConfig = {
    alert: {
      color: 'bg-red-500',
      icon: '🚨',
      label: 'Alert'
    },
    safe: {
      color: 'bg-green-500',
      icon: '✅',
      label: 'Safe Zone'
    },
    shelter: {
      color: 'bg-blue-500',
      icon: '🏠',
      label: 'Shelter'
    },
    medical: {
      color: 'bg-purple-500',
      icon: '🏥',
      label: 'Medical'
    },
    volunteer: {
      color: 'bg-orange-500',
      icon: '🤝',
      label: 'Volunteer'
    }
  };

  const config = typeConfig[type] || typeConfig.alert;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Pulsing rings */}
      <span className={`absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75 animate-ping`}></span>
      <span className={`absolute inline-flex h-full w-full rounded-full ${config.color} opacity-50 animate-pulse`}></span>
      
      {/* Main marker */}
      <span className={`relative inline-flex items-center justify-center ${sizeClasses[size]} rounded-full ${config.color} text-white font-bold shadow-2xl`}>
        <span className="text-2xl">{config.icon}</span>
      </span>
      
      {/* Label */}
      <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold whitespace-nowrap bg-white px-2 py-1 rounded shadow-lg">
        {config.label}
      </span>
    </div>
  );
};

export default PulsingMarker;
