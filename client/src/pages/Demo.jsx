import React, { useState } from 'react';
import RealTimeClock from '../components/RealTimeClock';
import LiveStats from '../components/LiveStats';
import AnimatedHero from '../components/AnimatedHero';
import LiveActivityFeed from '../components/LiveActivityFeed';
import WeatherWidget from '../components/WeatherWidget';
import LoadingScreen from '../components/LoadingScreen';
import PulsingMarker from '../components/PulsingMarker';
import AnimatedProgress from '../components/AnimatedProgress';

const Demo = () => {
  const [showLoading, setShowLoading] = useState(false);

  const handleShowLoading = () => {
    setShowLoading(true);
    setTimeout(() => setShowLoading(false), 3000);
  };

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {showLoading && <LoadingScreen message="Loading amazing content..." />}
      
      <h1 className="text-5xl font-bold gradient-text text-center mb-8 animate-slide-in-bottom">
        🎨 Amazing CSS Components Demo
      </h1>

      {/* Real-time Clock */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">⏰ Real-Time Clock</h2>
        <RealTimeClock />
      </section>

      {/* Live Stats */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">📊 Live Statistics</h2>
        <LiveStats />
      </section>

      {/* Weather Widget */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">🌤️ Weather Widget</h2>
        <div className="max-w-md">
          <WeatherWidget />
        </div>
      </section>

      {/* Buttons Showcase */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">🎯 Button Styles</h2>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
          <button className="btn-danger">Danger Button</button>
          <button className="btn-primary" onClick={handleShowLoading}>
            Show Loading Screen
          </button>
        </div>
      </section>

      {/* Cards Showcase */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">🎴 Card Styles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card hover-lift">
            <h3 className="text-xl font-bold mb-3">Standard Card</h3>
            <p className="text-gray-600">Beautiful glass-morphism effect with hover animation</p>
          </div>
          <div className="card-glass hover-lift">
            <h3 className="text-xl font-bold mb-3">Glass Card</h3>
            <p className="text-gray-800">Stunning translucent glass effect</p>
          </div>
          <div className="card hover-glow">
            <h3 className="text-xl font-bold mb-3">Glow Card</h3>
            <p className="text-gray-600">Hover to see the glow effect</p>
          </div>
        </div>
      </section>

      {/* Alerts Showcase */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">⚠️ Alert Styles</h2>
        <div className="space-y-4">
          <div className="alert-critical">
            <strong>Critical Alert:</strong> This is a critical emergency notification
          </div>
          <div className="alert-high">
            <strong>High Priority:</strong> Important warning message
          </div>
          <div className="alert-medium">
            <strong>Medium Priority:</strong> General information alert
          </div>
          <div className="alert-low">
            <strong>Low Priority:</strong> Success or confirmation message
          </div>
        </div>
      </section>

      {/* Animated Hero */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">🚀 Animated Hero Section</h2>
        <AnimatedHero />
      </section>

      {/* Live Activity Feed */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">📡 Live Activity Feed</h2>
        <div className="max-w-2xl">
          <LiveActivityFeed />
        </div>
      </section>

      {/* Gradient Text */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">✨ Text Effects</h2>
        <div className="space-y-4">
          <p className="text-4xl gradient-text">Beautiful Gradient Text</p>
          <p className="text-4xl neon-text bg-gray-900 p-4 rounded-xl inline-block">
            Neon Glow Effect
          </p>
        </div>
      </section>

      {/* Status Badges */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">🏷️ Status Badges</h2>
        <div className="flex flex-wrap gap-4">
          <div className="status-badge">
            <div className="status-dot"></div>
            <span>LIVE</span>
          </div>
          <div className="status-badge bg-gradient-to-r from-red-500 to-rose-500">
            <div className="status-dot"></div>
            <span>ALERT</span>
          </div>
          <div className="status-badge bg-gradient-to-r from-blue-500 to-cyan-500">
            <div className="status-dot"></div>
            <span>ACTIVE</span>
          </div>
        </div>
      </section>

      {/* Input Styles */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">📝 Input Styles</h2>
        <div className="max-w-md space-y-4">
          <input
            type="text"
            placeholder="Modern input field..."
            className="input-modern"
          />
          <textarea
            placeholder="Modern textarea..."
            className="input-modern"
            rows="4"
          />
        </div>
      </section>

      {/* Loading Spinner */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">⏳ Loading Spinner</h2>
        <div className="spinner"></div>
      </section>

      {/* Pulsing Markers */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">📍 Pulsing Map Markers</h2>
        <div className="flex flex-wrap gap-12 items-center justify-center p-8 bg-gray-100 rounded-2xl">
          <PulsingMarker type="alert" size="lg" />
          <PulsingMarker type="safe" size="md" />
          <PulsingMarker type="shelter" size="md" />
          <PulsingMarker type="medical" size="md" />
          <PulsingMarker type="volunteer" size="sm" />
        </div>
      </section>

      {/* Animated Progress Bars */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">📈 Animated Progress Bars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedProgress label="Disaster Preparedness" targetValue={85} color="emerald" icon="🛡️" />
          <AnimatedProgress label="Response Time" targetValue={92} color="blue" icon="⚡" />
          <AnimatedProgress label="Volunteer Coverage" targetValue={78} color="purple" icon="🤝" />
          <AnimatedProgress label="Resource Availability" targetValue={95} color="green" icon="📦" />
        </div>
      </section>
    </div>
  );
};

export default Demo;
