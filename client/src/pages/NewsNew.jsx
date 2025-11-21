import React from 'react';
import RealNewsAPI from '../components/RealNewsAPI';

const NewsNew = () => {

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-bottom">
        <h1 className="text-5xl font-bold gradient-text mb-2">
          📰 Real-Time Disaster News
        </h1>
        <p className="text-xl text-gray-600">
          Live news from multiple sources • Updated every 30 minutes
        </p>
      </div>

      {/* Real News Component */}
      <RealNewsAPI />
    </div>
  );
};

export default NewsNew;
