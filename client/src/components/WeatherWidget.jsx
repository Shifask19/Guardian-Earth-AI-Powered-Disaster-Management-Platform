import React, { useState, useEffect } from 'react';

const WeatherWidget = () => {
  const [weather, setWeather] = useState({
    temp: 72,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    location: 'Your Location'
  });

  useEffect(() => {
    // Simulate weather updates
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        temp: Math.floor(Math.random() * 30) + 60,
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    const icons = ['☀️', '⛅', '☁️', '🌧️', '⛈️'];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  return (
    <div className="card bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white hover-lift">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm opacity-90 mb-1">📍 {weather.location}</p>
          <p className="text-6xl font-bold">{weather.temp}°F</p>
        </div>
        <div className="text-7xl">
          {getWeatherIcon()}
        </div>
      </div>
      
      <p className="text-xl mb-4 font-medium">{weather.condition}</p>
      
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/30">
        <div>
          <p className="text-sm opacity-80">💧 Humidity</p>
          <p className="text-2xl font-bold">{weather.humidity}%</p>
        </div>
        <div>
          <p className="text-sm opacity-80">💨 Wind</p>
          <p className="text-2xl font-bold">{weather.windSpeed} mph</p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <div className="status-dot"></div>
        <span className="text-xs font-semibold">Updated Live</span>
      </div>
    </div>
  );
};

export default WeatherWidget;
