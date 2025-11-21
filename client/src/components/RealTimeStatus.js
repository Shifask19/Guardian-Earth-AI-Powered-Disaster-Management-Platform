import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../contexts/SocketContext';

const RealTimeStatus = () => {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (socket) {
      setIsConnected(socket.connected);
      
      socket.on('connect', () => {
        setIsConnected(true);
        setLastUpdate(new Date());
      });
      
      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('disaster-alert', () => {
        setLastUpdate(new Date());
      });

      socket.on('news-update', () => {
        setLastUpdate(new Date());
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('disaster-alert');
        socket.off('news-update');
      };
    }
  }, [socket]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${
        isConnected 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}></div>
        <span>
          {isConnected ? '🟢 Live Updates Active' : '🔴 Connection Lost'}
        </span>
      </div>
    </div>
  );
};

export default RealTimeStatus;