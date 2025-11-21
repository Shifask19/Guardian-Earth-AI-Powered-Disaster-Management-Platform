import React, { useState, useEffect } from 'react';

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState([]);

  const activityTypes = [
    { type: 'alert', icon: '🚨', color: 'text-red-600', bg: 'bg-red-50' },
    { type: 'volunteer', icon: '🤝', color: 'text-blue-600', bg: 'bg-blue-50' },
    { type: 'donation', icon: '💝', color: 'text-purple-600', bg: 'bg-purple-50' },
    { type: 'update', icon: '📢', color: 'text-green-600', bg: 'bg-green-50' }
  ];

  const messages = [
    'New earthquake alert in California',
    'Volunteer team deployed to affected area',
    'Emergency supplies donated',
    'Weather warning updated',
    'Rescue operation in progress',
    'Community shelter opened',
    'Medical team on standby',
    'Evacuation route activated'
  ];

  useEffect(() => {
    const addActivity = () => {
      const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      const newActivity = {
        id: Date.now(),
        ...randomType,
        message: randomMessage,
        time: new Date().toLocaleTimeString()
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    };

    addActivity();
    const interval = setInterval(addActivity, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold gradient-text">Live Activity Feed</h2>
        <div className="status-badge">
          <div className="status-dot"></div>
          <span>LIVE</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`${activity.bg} p-4 rounded-xl border-l-4 ${activity.color.replace('text', 'border')} 
                       animate-slide-in-right hover-lift`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className={`font-semibold ${activity.color}`}>
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveActivityFeed;
