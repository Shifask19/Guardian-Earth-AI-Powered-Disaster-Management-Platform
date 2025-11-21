import React, { useState, useEffect } from 'react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Simulate incoming notifications
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        title: 'New Alert',
        message: 'Weather warning in your area',
        type: Math.random() > 0.5 ? 'warning' : 'info',
        time: new Date().toLocaleTimeString()
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-20 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative btn-primary rounded-full w-14 h-14 flex items-center justify-center shadow-2xl"
      >
        <span className="text-2xl">🔔</span>
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 card animate-slide-in-right">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Notifications</h3>
            <button
              onClick={() => setNotifications([])}
              className="text-sm text-red-500 hover:text-red-700 font-semibold"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No new notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg ${
                    notif.type === 'warning'
                      ? 'bg-orange-50 border-l-4 border-orange-500'
                      : 'bg-blue-50 border-l-4 border-blue-500'
                  } animate-slide-in-bottom`}
                >
                  <p className="font-semibold text-sm">{notif.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
