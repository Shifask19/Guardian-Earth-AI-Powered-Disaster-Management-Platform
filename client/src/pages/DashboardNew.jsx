import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LocationSafetyChecker from '../components/LocationSafetyChecker';
import WeatherWidget from '../components/WeatherWidget';
import LiveStats from '../components/LiveStats';
import LiveActivityFeed from '../components/LiveActivityFeed';
import RealTimeClock from '../components/RealTimeClock';

const DashboardNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preparednessScore, setPreparednessScore] = useState(75);

  useEffect(() => {
    // Simulate preparedness score calculation
    const calculateScore = () => {
      const score = Math.floor(Math.random() * 30) + 70;
      setPreparednessScore(score);
    };
    calculateScore();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const quickActions = [
    {
      title: 'Check Location Safety',
      description: 'Verify if your area is safe',
      icon: '🛡️',
      color: 'from-emerald-500 to-teal-500',
      action: () => navigate('/safety-zone')
    },
    {
      title: 'AI Assistant',
      description: 'Get disaster help from AI',
      icon: '🤖',
      color: 'from-purple-500 to-pink-500',
      action: () => navigate('/chatbot')
    },
    {
      title: 'Emergency Preparedness',
      description: 'Complete your checklist',
      icon: '📋',
      color: 'from-blue-500 to-cyan-500',
      action: () => navigate('/preparedness')
    },
    {
      title: 'View Alerts',
      description: 'Check active warnings',
      icon: '🚨',
      color: 'from-red-500 to-orange-500',
      action: () => navigate('/alerts')
    }
  ];

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-bottom">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-xl text-gray-600">
          Stay informed and prepared with your personalized dashboard
        </p>
      </div>

      {/* Top Row - Clock and Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RealTimeClock />
        <WeatherWidget />
      </div>

      {/* Live Stats */}
      <LiveStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column - Location Safety */}
        <div className="lg:col-span-2">
          <LocationSafetyChecker />
        </div>

        {/* Right Column - Preparedness Score */}
        <div className="space-y-6">
          {/* Preparedness Score */}
          <div className={`card bg-gradient-to-br ${getScoreColor(preparednessScore)} text-white`}>
            <h3 className="text-2xl font-bold mb-4">📊 Preparedness Score</h3>
            <div className="text-center mb-4">
              <div className="text-6xl font-bold mb-2">{preparednessScore}%</div>
              <p className="text-sm opacity-90">
                {preparednessScore >= 80 ? 'Excellent!' : preparednessScore >= 60 ? 'Good Progress' : 'Needs Improvement'}
              </p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
              <h4 className="font-bold mb-2">Completed:</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ Emergency kit prepared</li>
                <li>✓ Family plan created</li>
                <li>✓ Contact list updated</li>
                <li className="opacity-50">○ Practice drill pending</li>
              </ul>
            </div>

            <button 
              className="btn-secondary bg-white/30 hover:bg-white/40 text-white border-white/40 w-full"
              onClick={() => navigate('/preparedness')}
            >
              Improve Score →
            </button>
          </div>

          {/* Emergency Contacts */}
          <div className="card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
            <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
              <span className="text-xl">📞</span>
              Emergency Contacts
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-700 mb-2">🇮🇳 India:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span>Emergency:</span>
                    <span className="text-red-600 font-bold">112</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Police:</span>
                    <span className="text-red-600 font-bold">100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fire:</span>
                    <span className="text-red-600 font-bold">101</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ambulance:</span>
                    <span className="text-red-600 font-bold">102</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disaster:</span>
                    <span className="text-red-600 font-bold">1078</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Women:</span>
                    <span className="text-red-600 font-bold">1091</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="font-semibold text-gray-700 mb-2">🇺🇸 USA:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span>Emergency:</span>
                    <span className="text-red-600 font-bold">911</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Poison:</span>
                    <span className="text-red-600">1-800-222-1222</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Red Cross:</span>
                    <span className="text-red-600">1-800-733-2767</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FEMA:</span>
                    <span className="text-red-600">1-800-621-3362</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-6">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className={`card hover-lift cursor-pointer bg-gradient-to-br ${action.color} text-white`}
              onClick={action.action}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-5xl mb-3 block">{action.icon}</span>
              <h3 className="text-xl font-bold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LiveActivityFeed />
        
        {/* Resources */}
        <div className="card">
          <h2 className="text-2xl font-bold gradient-text mb-4">
            📚 Helpful Resources
          </h2>
          
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-500 hover-lift cursor-pointer">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📖</span>
                <div>
                  <h3 className="font-bold text-blue-800 mb-1">Disaster Guides</h3>
                  <p className="text-sm text-blue-700">
                    Learn how to prepare for different disasters
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500 hover-lift cursor-pointer">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎓</span>
                <div>
                  <h3 className="font-bold text-green-800 mb-1">Training Videos</h3>
                  <p className="text-sm text-green-700">
                    Watch tutorials on emergency response
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-500 hover-lift cursor-pointer">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🗺️</span>
                <div>
                  <h3 className="font-bold text-purple-800 mb-1">Interactive Map</h3>
                  <p className="text-sm text-purple-700">
                    View hazards and safe zones near you
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-l-4 border-orange-500 hover-lift cursor-pointer">
              <div className="flex items-start gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <h3 className="font-bold text-orange-800 mb-1">Community Forum</h3>
                  <p className="text-sm text-orange-700">
                    Connect with others in your area
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNew;
