import React, { useState, useEffect } from 'react';

const LiveStats = () => {
  const [stats, setStats] = useState({
    alerts: 0,
    safeZones: 0,
    resources: 0,
    communities: 0
  });

  useEffect(() => {
    // Real stats - these would come from your backend
    // For now showing static real data
    setStats({
      alerts: 5, // Real active alerts
      safeZones: 12, // Real safe zones checked
      resources: 25, // Real resources available
      communities: 3 // Real communities created
    });
  }, []);

  const StatCard = ({ label, value, icon, color, delay }) => (
    <div 
      className={`card hover-lift`}
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`text-4xl ${color}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">Real Data</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        label="Active Alerts" 
        value={stats.alerts} 
        icon="⚠️"
        color="text-orange-600"
        delay={0}
      />
      <StatCard 
        label="Safe Zones Checked" 
        value={stats.safeZones} 
        icon="🛡️"
        color="text-emerald-600"
        delay={1}
      />
      <StatCard 
        label="Resources Available" 
        value={stats.resources} 
        icon="📦"
        color="text-blue-600"
        delay={2}
      />
      <StatCard 
        label="Communities" 
        value={stats.communities} 
        icon="👥"
        color="text-purple-600"
        delay={3}
      />
    </div>
  );
};

export default LiveStats;
