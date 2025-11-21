import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      try {
        const newSocket = io('http://localhost:3002', {
          timeout: 5000,
          forceNew: true,
          reconnection: false
        });
        
        newSocket.on('connect', () => {
          console.log('✅ Connected to server');
          setSocket(newSocket);
          
          // Join location-based room
          if (user.location) {
            newSocket.emit('join-location', {
              lat: user.location.coordinates[1],
              lng: user.location.coordinates[0]
            });
          }
        });

        newSocket.on('connect_error', (error) => {
          console.log('⚠️ Server not available, running in offline mode');
          setSocket(null);
        });

        // Listen for real-time alerts
        newSocket.on('disaster-alert', (alert) => {
          setAlerts(prev => [alert, ...prev]);
          // Show notification
          if (Notification.permission === 'granted') {
            new Notification(`${alert.type} Alert`, {
              body: alert.message,
              icon: '/logo192.png'
            });
          }
        });

        newSocket.on('disaster-report', (report) => {
          setAlerts(prev => [{
            type: 'report',
            message: `New ${report.type} reported in your area`,
            severity: report.severity,
            timestamp: new Date()
          }, ...prev]);
        });

        newSocket.on('volunteer-request', (request) => {
          if (user.isVolunteer) {
            setAlerts(prev => [{
              type: 'volunteer',
              message: `Help needed: ${request.type}`,
              urgency: request.urgency,
              timestamp: new Date()
            }, ...prev]);
          }
        });

        return () => {
          if (newSocket) {
            newSocket.close();
          }
        };
      } catch (error) {
        console.log('⚠️ Socket connection failed, running in offline mode');
        setSocket(null);
      }
    }
  }, [user]);

  // Request notification permission
  useEffect(() => {
    if (user && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  const value = {
    socket,
    alerts,
    clearAlerts: () => setAlerts([])
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};