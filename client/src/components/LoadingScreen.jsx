import React from 'react';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="spinner mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl animate-bounce">🌍</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4 neon-text">
          Guardian Earth
        </h2>
        
        <p className="text-white text-lg opacity-90 animate-pulse">
          {message}
        </p>
        
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
