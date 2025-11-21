import React, { useState, useEffect } from 'react';

const AnimatedHero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="hero-gradient min-h-[500px] rounded-3xl p-12 mb-8 relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 text-white transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <h1 className="text-6xl font-bold mb-6 neon-text">
          Guardian Earth
        </h1>
        <p className="text-2xl mb-8 font-light">
          AI-Powered Disaster Management Platform
        </p>
        <div className="flex gap-4 flex-wrap">
          <button className="btn-primary">
            Get Started
          </button>
          <button className="btn-secondary bg-white/20 backdrop-blur-md border-white/40 text-white hover:bg-white/30">
            Learn More
          </button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-glass text-center p-6">
            <div className="text-4xl mb-3">🌍</div>
            <h3 className="text-xl font-bold mb-2">Global Coverage</h3>
            <p className="text-sm opacity-90">Real-time monitoring worldwide</p>
          </div>
          <div className="card-glass text-center p-6">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI Predictions</h3>
            <p className="text-sm opacity-90">Advanced machine learning</p>
          </div>
          <div className="card-glass text-center p-6">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold mb-2">Instant Alerts</h3>
            <p className="text-sm opacity-90">Lightning-fast notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedHero;
