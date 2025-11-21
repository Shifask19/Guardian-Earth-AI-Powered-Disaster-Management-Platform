import React, { useState, useEffect } from 'react';

const LocationSafetyChecker = () => {
  const [location, setLocation] = useState('');
  const [safetyStatus, setSafetyStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          checkLocationSafety(latitude, longitude);
        },
        (error) => {
          console.error('Location error:', error);
          setLoading(false);
          setSafetyStatus({
            status: 'unknown',
            message: 'Unable to get your location. Please enter manually.'
          });
        }
      );
    } else {
      setLoading(false);
      setSafetyStatus({
        status: 'unknown',
        message: 'Geolocation is not supported by your browser.'
      });
    }
  };

  // Check if location is safe
  const checkLocationSafety = async (lat, lng, address = null, country = 'US') => {
    setLoading(true);
    
    // Simulate API call - Replace with actual API
    setTimeout(() => {
      // Mock data - In production, call your backend API
      const mockAlerts = [
        // US Alerts
        { lat: 34.0522, lng: -118.2437, type: 'earthquake', severity: 'high', radius: 50, country: 'US' },
        { lat: 29.7604, lng: -95.3698, type: 'flood', severity: 'critical', radius: 30, country: 'US' },
        { lat: 25.7617, lng: -80.1918, type: 'hurricane', severity: 'high', radius: 100, country: 'US' },
        { lat: 40.7128, lng: -74.0060, type: 'storm', severity: 'medium', radius: 20, country: 'US' },
        
        // Indian Alerts
        { lat: 19.0760, lng: 72.8777, type: 'flood', severity: 'high', radius: 40, country: 'IN' }, // Mumbai
        { lat: 13.0827, lng: 80.2707, type: 'cyclone', severity: 'critical', radius: 80, country: 'IN' }, // Chennai
        { lat: 26.9124, lng: 75.7873, type: 'heat', severity: 'high', radius: 50, country: 'IN' }, // Jaipur
        { lat: 10.8505, lng: 76.2711, type: 'landslide', severity: 'medium', radius: 30, country: 'IN' }, // Kerala
        { lat: 26.1445, lng: 91.7362, type: 'flood', severity: 'high', radius: 60, country: 'IN' } // Guwahati
      ];

      // Check if location is near any alert
      let nearestAlert = null;
      let minDistance = Infinity;

      mockAlerts.forEach(alert => {
        const distance = calculateDistance(lat, lng, alert.lat, alert.lng);
        if (distance < alert.radius && distance < minDistance) {
          minDistance = distance;
          nearestAlert = { ...alert, distance };
        }
      });

      if (nearestAlert) {
        setSafetyStatus({
          status: 'danger',
          alert: nearestAlert,
          message: `⚠️ ${nearestAlert.type.toUpperCase()} ALERT within ${Math.round(nearestAlert.distance)} km`,
          location: address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          country: country
        });
      } else {
        setSafetyStatus({
          status: 'safe',
          message: '✅ No active alerts in your area',
          location: address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          country: country
        });
      }
      
      setLoading(false);
    }, 1500);
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Handle manual location search
  const handleLocationSearch = () => {
    if (!location.trim()) return;
    
    // In production, use geocoding API to convert address to coordinates
    // For now, using mock coordinates for US and India
    const mockCoordinates = {
      // US Cities
      'los angeles': { lat: 34.0522, lng: -118.2437, country: 'US' },
      'houston': { lat: 29.7604, lng: -95.3698, country: 'US' },
      'miami': { lat: 25.7617, lng: -80.1918, country: 'US' },
      'new york': { lat: 40.7128, lng: -74.0060, country: 'US' },
      'san francisco': { lat: 37.7749, lng: -122.4194, country: 'US' },
      
      // Indian Cities
      'mumbai': { lat: 19.0760, lng: 72.8777, country: 'IN' },
      'delhi': { lat: 28.7041, lng: 77.1025, country: 'IN' },
      'bangalore': { lat: 12.9716, lng: 77.5946, country: 'IN' },
      'bengaluru': { lat: 12.9716, lng: 77.5946, country: 'IN' },
      'chennai': { lat: 13.0827, lng: 80.2707, country: 'IN' },
      'kolkata': { lat: 22.5726, lng: 88.3639, country: 'IN' },
      'hyderabad': { lat: 17.3850, lng: 78.4867, country: 'IN' },
      'pune': { lat: 18.5204, lng: 73.8567, country: 'IN' },
      'ahmedabad': { lat: 23.0225, lng: 72.5714, country: 'IN' },
      'jaipur': { lat: 26.9124, lng: 75.7873, country: 'IN' },
      'surat': { lat: 21.1702, lng: 72.8311, country: 'IN' },
      'lucknow': { lat: 26.8467, lng: 80.9462, country: 'IN' },
      'kanpur': { lat: 26.4499, lng: 80.3319, country: 'IN' },
      'nagpur': { lat: 21.1458, lng: 79.0882, country: 'IN' },
      'indore': { lat: 22.7196, lng: 75.8577, country: 'IN' },
      'bhopal': { lat: 23.2599, lng: 77.4126, country: 'IN' },
      'visakhapatnam': { lat: 17.6868, lng: 83.2185, country: 'IN' },
      'patna': { lat: 25.5941, lng: 85.1376, country: 'IN' },
      'vadodara': { lat: 22.3072, lng: 73.1812, country: 'IN' },
      'guwahati': { lat: 26.1445, lng: 91.7362, country: 'IN' },
      'kerala': { lat: 10.8505, lng: 76.2711, country: 'IN' }
    };

    const searchKey = location.toLowerCase();
    const coords = mockCoordinates[searchKey];
    
    if (coords) {
      checkLocationSafety(coords.lat, coords.lng, location, coords.country);
    } else {
      setSafetyStatus({
        status: 'unknown',
        message: 'Location not found. Try: Mumbai, Delhi, Bangalore, Chennai, Kolkata, Los Angeles, New York, etc.'
      });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'from-red-600 to-rose-700';
      case 'high': return 'from-orange-500 to-red-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getAlertIcon = (type) => {
    const icons = {
      earthquake: '🌍',
      flood: '🌊',
      hurricane: '🌀',
      cyclone: '🌀',
      tornado: '🌪️',
      fire: '🔥',
      storm: '⛈️',
      heat: '🌡️',
      landslide: '⛰️'
    };
    return icons[type] || '⚠️';
  };

  const getEmergencyNumbers = (country) => {
    if (country === 'IN') {
      return {
        emergency: '112',
        police: '100',
        fire: '101',
        ambulance: '102',
        disaster: '1078',
        women: '1091',
        child: '1098'
      };
    }
    return {
      emergency: '911',
      poison: '1-800-222-1222',
      redcross: '1-800-733-2767',
      fema: '1-800-621-3362'
    };
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold gradient-text mb-4">
        📍 Location Safety Checker
      </h2>
      <p className="text-gray-600 mb-6">
        Check if your location is in a safe zone or alert area
      </p>

      {/* Location Input */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            className="input-modern flex-1"
            placeholder="Enter city or address..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
          />
          <button
            className="btn-primary px-6"
            onClick={handleLocationSearch}
            disabled={loading}
          >
            🔍 Check
          </button>
        </div>

        <button
          className="btn-secondary w-full"
          onClick={getCurrentLocation}
          disabled={loading}
        >
          📍 Use My Current Location
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Checking location safety...</p>
        </div>
      )}

      {/* Safety Status */}
      {!loading && safetyStatus && (
        <div className="animate-slide-in-bottom">
          {safetyStatus.status === 'safe' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-5xl">✅</span>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    Safe Zone
                  </h3>
                  <p className="text-green-700 font-medium mb-3">
                    {safetyStatus.message}
                  </p>
                  <p className="text-sm text-green-600">
                    📍 {safetyStatus.location}
                  </p>
                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <p className="text-sm text-gray-700">
                      ✓ No active disaster alerts<br/>
                      ✓ Safe to proceed with normal activities<br/>
                      ✓ Stay informed about weather updates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {safetyStatus.status === 'danger' && (
            <div className={`bg-gradient-to-r ${getSeverityColor(safetyStatus.alert.severity)} text-white rounded-xl p-6 shadow-2xl animate-pulse-slow`}>
              <div className="flex items-start gap-4">
                <span className="text-5xl">{getAlertIcon(safetyStatus.alert.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold">
                      ALERT ZONE
                    </h3>
                    <span className="px-3 py-1 bg-white/30 rounded-full text-sm font-bold">
                      {safetyStatus.alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xl font-semibold mb-3">
                    {safetyStatus.message}
                  </p>
                  <p className="text-sm opacity-90 mb-4">
                    📍 {safetyStatus.location}
                  </p>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
                    <h4 className="font-bold mb-2">⚠️ IMMEDIATE ACTIONS:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Follow local emergency instructions</li>
                      <li>• Prepare emergency kit</li>
                      <li>• Stay informed via official channels</li>
                      <li>• Have evacuation plan ready</li>
                      <li>• Keep phone charged</li>
                    </ul>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
                    <h4 className="font-bold mb-2">📞 EMERGENCY NUMBERS:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(getEmergencyNumbers(safetyStatus.country)).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key}:</span>
                          <span className="font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="btn-secondary bg-white text-red-600 hover:bg-gray-100 flex-1">
                      📞 Call Emergency
                    </button>
                    <button className="btn-secondary bg-white text-red-600 hover:bg-gray-100 flex-1">
                      🗺️ View on Map
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {safetyStatus.status === 'unknown' && (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-300 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-5xl">❓</span>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Location Unknown
                  </h3>
                  <p className="text-gray-700">
                    {safetyStatus.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Location Buttons */}
      {!loading && !safetyStatus && (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3 font-semibold">🇮🇳 Indian Cities:</p>
            <div className="flex flex-wrap gap-2">
              {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'].map(city => (
                <button
                  key={city}
                  className="px-4 py-2 bg-gradient-to-r from-orange-100 to-green-100 hover:from-orange-200 hover:to-green-200 rounded-lg text-sm font-medium transition-colors border border-orange-300"
                  onClick={() => {
                    setLocation(city);
                    setTimeout(() => handleLocationSearch(), 100);
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-3 font-semibold">🇺🇸 US Cities:</p>
            <div className="flex flex-wrap gap-2">
              {['Los Angeles', 'Houston', 'Miami', 'New York', 'San Francisco'].map(city => (
                <button
                  key={city}
                  className="px-4 py-2 bg-gradient-to-r from-blue-100 to-red-100 hover:from-blue-200 hover:to-red-200 rounded-lg text-sm font-medium transition-colors border border-blue-300"
                  onClick={() => {
                    setLocation(city);
                    setTimeout(() => handleLocationSearch(), 100);
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSafetyChecker;
