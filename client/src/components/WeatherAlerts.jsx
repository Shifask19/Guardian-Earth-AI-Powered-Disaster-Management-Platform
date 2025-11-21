import React, { useState, useEffect } from 'react';

const WeatherAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        getUserLocation();
        // Update alerts every 5 minutes
        const interval = setInterval(fetchWeatherAlerts, 300000);
        return () => clearInterval(interval);
    }, []);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(location);
                    fetchWeatherAlerts(location);
                },
                (error) => {
                    console.error('Location error:', error);
                    fetchWeatherAlerts(); // Fetch with default location
                }
            );
        } else {
            fetchWeatherAlerts();
        }
    };

    const fetchWeatherAlerts = (location = null) => {
        setLoading(true);

        // Mock weather alerts - Replace with actual weather API
        setTimeout(() => {
            const mockAlerts = [
                {
                    id: 1,
                    type: 'severe-thunderstorm',
                    severity: 'warning',
                    title: 'Severe Thunderstorm Warning',
                    description: 'Severe thunderstorms with damaging winds and large hail possible',
                    location: 'Los Angeles County',
                    startTime: new Date(Date.now() + 3600000),
                    endTime: new Date(Date.now() + 10800000),
                    icon: '⛈️',
                    color: 'from-orange-500 to-red-500',
                    instructions: [
                        'Move to an interior room on lowest floor',
                        'Avoid windows',
                        'Stay away from electrical equipment',
                        'Monitor weather updates'
                    ]
                },
                {
                    id: 2,
                    type: 'flood',
                    severity: 'watch',
                    title: 'Flood Watch',
                    description: 'Heavy rainfall may cause flooding in low-lying areas',
                    location: 'Houston Metro Area',
                    startTime: new Date(Date.now() + 7200000),
                    endTime: new Date(Date.now() + 21600000),
                    icon: '🌊',
                    color: 'from-blue-500 to-cyan-500',
                    instructions: [
                        'Avoid low-lying areas',
                        'Do not drive through flooded roads',
                        'Prepare emergency supplies',
                        'Stay informed'
                    ]
                },
                {
                    id: 3,
                    type: 'heat',
                    severity: 'advisory',
                    title: 'Excessive Heat Advisory',
                    description: 'Dangerously hot conditions with heat index values up to 110°F',
                    location: 'Phoenix Area',
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 28800000),
                    icon: '🌡️',
                    color: 'from-red-500 to-orange-500',
                    instructions: [
                        'Stay hydrated',
                        'Limit outdoor activities',
                        'Check on elderly neighbors',
                        'Never leave children or pets in vehicles'
                    ]
                },
                {
                    id: 4,
                    type: 'winter-storm',
                    severity: 'warning',
                    title: 'Winter Storm Warning',
                    description: 'Heavy snow and ice accumulation expected',
                    location: 'Denver Metro',
                    startTime: new Date(Date.now() + 14400000),
                    endTime: new Date(Date.now() + 43200000),
                    icon: '❄️',
                    color: 'from-blue-600 to-indigo-600',
                    instructions: [
                        'Avoid travel if possible',
                        'Prepare for power outages',
                        'Keep emergency supplies ready',
                        'Dress in layers if going outside'
                    ]
                },
                {
                    id: 5,
                    type: 'tornado',
                    severity: 'watch',
                    title: 'Tornado Watch',
                    description: 'Conditions favorable for tornado development',
                    location: 'Oklahoma City Area',
                    startTime: new Date(Date.now() + 1800000),
                    endTime: new Date(Date.now() + 14400000),
                    icon: '🌪️',
                    color: 'from-red-600 to-rose-700',
                    instructions: [
                        'Identify safe shelter location',
                        'Monitor weather radio',
                        'Be ready to take shelter immediately',
                        'Have emergency kit accessible'
                    ]
                }
            ];

            setAlerts(mockAlerts);
            setLoading(false);
        }, 1000);
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            warning: { text: 'WARNING', color: 'bg-red-600', icon: '🚨' },
            watch: { text: 'WATCH', color: 'bg-orange-500', icon: '⚠️' },
            advisory: { text: 'ADVISORY', color: 'bg-yellow-500', icon: '⚡' }
        };
        return badges[severity] || badges.advisory;
    };

    const formatTime = (date) => {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getTimeUntil = (date) => {
        const diff = date - new Date();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        if (diff < 0) return 'Active Now';
        if (hours > 0) return `In ${hours}h ${minutes}m`;
        return `In ${minutes}m`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold gradient-text">
                            🌤️ Weather Alerts
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Real-time weather warnings and advisories
                        </p>
                    </div>
                    <button
                        onClick={() => fetchWeatherAlerts(userLocation)}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                </div>

                {userLocation && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📍</span>
                        <span>Monitoring: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                        <div className="status-dot ml-2"></div>
                        <span className="font-semibold text-emerald-600">LIVE</span>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="card text-center py-12">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading weather alerts...</p>
                </div>
            )}

            {/* Alerts List */}
            {!loading && alerts.length === 0 && (
                <div className="card text-center py-12">
                    <span className="text-6xl mb-4 block">☀️</span>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        No Active Alerts
                    </h3>
                    <p className="text-gray-600">
                        All clear! No weather alerts in your area.
                    </p>
                </div>
            )}

            {!loading && alerts.map((alert) => {
                const badge = getSeverityBadge(alert.severity);
                const isActive = new Date() >= alert.startTime;

                return (
                    <div
                        key={alert.id}
                        className={`card bg-gradient-to-r ${alert.color} text-white hover-lift animate-slide-in-bottom ${alert.severity === 'warning' ? 'animate-pulse-slow' : ''
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="text-6xl">{alert.icon}</div>

                            {/* Content */}
                            <div className="flex-1">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-bold">{alert.title}</h3>
                                            <span className={`${badge.color} px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1`}>
                                                <span>{badge.icon}</span>
                                                <span>{badge.text}</span>
                                            </span>
                                        </div>
                                        <p className="text-lg opacity-90 mb-2">
                                            {alert.description}
                                        </p>
                                        <p className="text-sm opacity-80">
                                            📍 {alert.location}
                                        </p>
                                    </div>
                                </div>

                                {/* Time Info */}
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="opacity-80 mb-1">Starts:</p>
                                            <p className="font-bold">{formatTime(alert.startTime)}</p>
                                            <p className="text-xs opacity-70 mt-1">{getTimeUntil(alert.startTime)}</p>
                                        </div>
                                        <div>
                                            <p className="opacity-80 mb-1">Ends:</p>
                                            <p className="font-bold">{formatTime(alert.endTime)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
                                    <h4 className="font-bold mb-2 flex items-center gap-2">
                                        <span>⚠️</span>
                                        <span>Safety Instructions:</span>
                                    </h4>
                                    <ul className="space-y-1 text-sm">
                                        {alert.instructions.map((instruction, idx) => (
                                            <li key={idx}>• {instruction}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button className="btn-secondary bg-white/30 hover:bg-white/40 text-white border-white/40 flex-1">
                                        📱 Get Notifications
                                    </button>
                                    <button className="btn-secondary bg-white/30 hover:bg-white/40 text-white border-white/40 flex-1">
                                        🗺️ View on Map
                                    </button>
                                    <button className="btn-secondary bg-white/30 hover:bg-white/40 text-white border-white/40">
                                        ℹ️ Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Emergency Contact */}
            {!loading && alerts.some(a => a.severity === 'warning') && (
                <div className="alert-critical">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🚨</span>
                        <div>
                            <p className="font-bold text-lg">SEVERE WEATHER ALERT</p>
                            <p className="text-sm">
                                For emergencies, call <strong>911</strong>. For weather updates, call <strong>1-800-WEATHER</strong>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherAlerts;
