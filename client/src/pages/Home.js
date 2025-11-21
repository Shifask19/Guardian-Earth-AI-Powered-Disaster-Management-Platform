import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RealTimeClock from '../components/RealTimeClock';
import LiveStats from '../components/LiveStats';
import AnimatedHero from '../components/AnimatedHero';
import LiveActivityFeed from '../components/LiveActivityFeed';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: '🛡️',
      title: 'Safety Zone Checker',
      description: 'Check if your location is safe or in an alert zone with real-time weather alerts',
      color: 'from-emerald-500 to-teal-500',
      link: '/safety-zone'
    },
    {
      icon: '🌪️',
      title: 'AI-Based Disaster Prediction',
      description: 'Detects floods, cyclones, and landslides in advance using advanced AI models',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '📍',
      title: 'Interactive Map',
      description: 'Displays hazards, shelters, and safe routes in real-time',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: '📢',
      title: 'Geo-Targeted Alerts',
      description: 'Sends timely notifications in local languages based on your location',
      color: 'from-orange-500 to-amber-500'
    },
    {
      icon: '🤖',
      title: 'AI Chatbot Assistance',
      description: 'Offers instant help and safety guidance 24/7',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: '🤝',
      title: 'Victim Volunteer Hub',
      description: 'Connects those in need with nearby helpers and volunteers',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '💰',
      title: 'Relief Donation Management',
      description: 'Tracks donations transparently with blockchain technology',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: '📚',
      title: 'Preparation & Awareness Hub',
      description: 'Educates users through guides, quizzes, and achievement badges',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Real-time Clock */}
      <div className="mb-8">
        <RealTimeClock />
      </div>

      {/* Animated Hero */}
      <AnimatedHero />

      {/* Live Stats */}
      <LiveStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Features Section */}
        <div className="lg:col-span-2">
          <h2 className="text-4xl font-bold gradient-text mb-8 text-center">
            🌟 Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover-lift animate-slide-in-bottom cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => feature.link && navigate(feature.link)}
              >
                <div className={`text-5xl mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                {feature.link && (
                  <button className="btn-primary mt-4 w-full">
                    Check Now →
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 text-center">
            {!user ? (
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  className="btn-primary"
                  onClick={() => navigate('/register')}
                >
                  🚀 Get Started Now
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => navigate('/login')}
                >
                  🔐 Sign In
                </button>
              </div>
            ) : (
              <button
                className="btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                📊 Go to Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-1">
          <LiveActivityFeed />
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="card bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-center p-12 hover-glow">
        <h2 className="text-4xl font-bold mb-4">
          🌍 Join the Global Safety Network
        </h2>
        <p className="text-xl mb-6 opacity-90">
          Be part of a smarter, safer, and more connected global community
        </p>
        {!user && (
          <button
            className="btn-primary bg-white text-emerald-600 hover:bg-gray-100"
            onClick={() => navigate('/register')}
          >
            ✨ Start Protecting Your Community
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;