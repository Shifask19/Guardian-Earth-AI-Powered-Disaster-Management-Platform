import React from 'react';
import LocationSafetyChecker from '../components/LocationSafetyChecker';
import WeatherAlerts from '../components/WeatherAlerts';
import LiveStats from '../components/LiveStats';

const SafetyZone = () => {
  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-in-bottom">
        <h1 className="text-5xl font-bold gradient-text mb-4">
          🛡️ Safety Zone Monitor
        </h1>
        <p className="text-xl text-gray-600">
          Check your location safety and get real-time weather alerts
        </p>
      </div>

      {/* Live Stats */}
      <LiveStats />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Location Safety Checker */}
        <div>
          <LocationSafetyChecker />
        </div>

        {/* Quick Safety Tips */}
        <div className="card">
          <h2 className="text-2xl font-bold gradient-text mb-4">
            ⚡ Quick Safety Tips
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <h3 className="font-bold text-red-800 mb-1">In Alert Zone?</h3>
                  <p className="text-sm text-red-700">
                    Follow local emergency instructions immediately. Have your emergency kit ready and stay informed.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="font-bold text-blue-800 mb-1">Stay Connected</h3>
                  <p className="text-sm text-blue-700">
                    Keep your phone charged and enable emergency alerts. Download offline maps of your area.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎒</span>
                <div>
                  <h3 className="font-bold text-green-800 mb-1">Emergency Kit</h3>
                  <p className="text-sm text-green-700">
                    Water, food, first aid, flashlight, radio, batteries, medications, and important documents.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
                <div>
                  <h3 className="font-bold text-purple-800 mb-1">Family Plan</h3>
                  <p className="text-sm text-purple-700">
                    Have a communication plan and meeting point. Make sure everyone knows what to do.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="mt-6 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
            <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
              <span className="text-xl">📞</span>
              Emergency Contacts
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">Emergency:</span>
                <span className="text-red-600 font-bold">911</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Poison:</span>
                <span className="text-red-600">1-800-222-1222</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Red Cross:</span>
                <span className="text-red-600">1-800-733-2767</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">FEMA:</span>
                <span className="text-red-600">1-800-621-3362</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      <WeatherAlerts />

      {/* Safety Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="card hover-lift bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <span className="text-4xl mb-3 block">🗺️</span>
          <h3 className="text-xl font-bold mb-2">Evacuation Routes</h3>
          <p className="text-sm opacity-90 mb-4">
            Find the safest evacuation routes from your location
          </p>
          <button className="btn-secondary bg-white text-blue-600 hover:bg-gray-100 w-full">
            View Routes
          </button>
        </div>

        <div className="card hover-lift bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <span className="text-4xl mb-3 block">🏠</span>
          <h3 className="text-xl font-bold mb-2">Nearby Shelters</h3>
          <p className="text-sm opacity-90 mb-4">
            Locate emergency shelters in your area
          </p>
          <button className="btn-secondary bg-white text-green-600 hover:bg-gray-100 w-full">
            Find Shelters
          </button>
        </div>

        <div className="card hover-lift bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <span className="text-4xl mb-3 block">📋</span>
          <h3 className="text-xl font-bold mb-2">Emergency Checklist</h3>
          <p className="text-sm opacity-90 mb-4">
            Complete your disaster preparedness checklist
          </p>
          <button className="btn-secondary bg-white text-purple-600 hover:bg-gray-100 w-full">
            View Checklist
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyZone;
