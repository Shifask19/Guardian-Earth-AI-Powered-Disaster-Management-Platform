import React, { useState, useEffect } from 'react';

const RealNewsAPI = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('disaster');
  const [selectedSource, setSelectedSource] = useState('all');
  const [error, setError] = useState(null);

  const categories = [
    { id: 'disaster', name: 'Disasters', icon: '🌪️', keywords: 'disaster earthquake flood cyclone hurricane tornado wildfire' },
    { id: 'weather', name: 'Weather', icon: '🌤️', keywords: 'weather storm rain snow heat wave climate' },
    { id: 'emergency', name: 'Emergency', icon: '🚨', keywords: 'emergency rescue evacuation alert warning' },
    { id: 'health', name: 'Health', icon: '🏥', keywords: 'health pandemic outbreak medical emergency' },
    { id: 'environment', name: 'Environment', icon: '🌍', keywords: 'environment pollution climate change global warming' },
    { id: 'safety', name: 'Safety', icon: '🛡️', keywords: 'safety security preparedness prevention' }
  ];

  const sources = [
    { id: 'all', name: 'All Sources', icon: '📰' },
    { id: 'newsapi', name: 'News API', icon: '📡' },
    { id: 'guardian', name: 'The Guardian', icon: '📰' },
    { id: 'rss', name: 'RSS Feeds', icon: '📡' }
  ];

  useEffect(() => {
    fetchRealNews();
    // Refresh every 30 minutes
    const interval = setInterval(fetchRealNews, 1800000);
    return () => clearInterval(interval);
  }, [selectedCategory, selectedSource]);

  const fetchRealNews = async () => {
    setLoading(true);
    setError(null);

    try {
      let allNews = [];

      // Fetch from multiple sources
      if (selectedSource === 'all' || selectedSource === 'newsapi') {
        const newsApiData = await fetchFromNewsAPI();
        allNews = [...allNews, ...newsApiData];
      }

      if (selectedSource === 'all' || selectedSource === 'guardian') {
        const guardianData = await fetchFromGuardian();
        allNews = [...allNews, ...guardianData];
      }

      if (selectedSource === 'all' || selectedSource === 'rss') {
        const rssData = await fetchFromRSS();
        allNews = [...allNews, ...rssData];
      }

      // If no API keys, use fallback news
      if (allNews.length === 0) {
        allNews = getFallbackNews();
      }

      // Sort by date (newest first)
      allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      // Remove duplicates
      const uniqueNews = allNews.filter((article, index, self) => 
        index === self.findIndex(a => a.title === article.title)
      );

      setNews(uniqueNews.slice(0, 20)); // Limit to 20 articles
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to fetch news. Using fallback data.');
      setNews(getFallbackNews());
    } finally {
      setLoading(false);
    }
  };

  const fetchFromNewsAPI = async () => {
    const apiKey = process.env.REACT_APP_NEWS_API_KEY;
    if (!apiKey || apiKey === 'your_news_api_key_here') {
      return [];
    }

    try {
      const category = categories.find(c => c.id === selectedCategory);
      const keywords = category ? category.keywords : 'disaster';
      
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${keywords}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.articles.map(article => ({
        id: `newsapi-${Date.now()}-${Math.random()}`,
        title: article.title,
        description: article.description,
        content: article.content || article.description,
        url: article.url,
        image: article.urlToImage,
        source: article.source.name,
        author: article.author || 'News Desk',
        publishedAt: article.publishedAt,
        category: selectedCategory,
        severity: determineSeverity(article.title + ' ' + article.description),
        apiSource: 'NewsAPI'
      }));
    } catch (error) {
      console.error('NewsAPI fetch error:', error);
      return [];
    }
  };

  const fetchFromGuardian = async () => {
    const apiKey = process.env.REACT_APP_GUARDIAN_API_KEY;
    if (!apiKey || apiKey === 'your_guardian_api_key_here') {
      return [];
    }

    try {
      const category = categories.find(c => c.id === selectedCategory);
      const keywords = category ? category.keywords.split(' ')[0] : 'disaster';
      
      const response = await fetch(
        `https://content.guardianapis.com/search?q=${keywords}&show-fields=thumbnail,trailText,body&page-size=10&api-key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Guardian API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.response.results.map(article => ({
        id: `guardian-${article.id}`,
        title: article.webTitle,
        description: article.fields?.trailText || 'Read more on The Guardian',
        content: article.fields?.body || article.fields?.trailText,
        url: article.webUrl,
        image: article.fields?.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
        source: 'The Guardian',
        author: 'Guardian News',
        publishedAt: article.webPublicationDate,
        category: selectedCategory,
        severity: determineSeverity(article.webTitle),
        apiSource: 'Guardian'
      }));
    } catch (error) {
      console.error('Guardian API fetch error:', error);
      return [];
    }
  };

  const fetchFromRSS = async () => {
    // RSS feeds for disaster news
    const rssFeeds = [
      'https://feeds.reuters.com/reuters/environment',
      'https://rss.cnn.com/rss/edition.rss',
      'https://feeds.bbci.co.uk/news/world/rss.xml'
    ];

    try {
      // Note: Direct RSS fetching from browser has CORS issues
      // In production, you'd use a backend proxy or RSS-to-JSON service
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('RSS fetch error:', error);
      return [];
    }
  };

  const determineSeverity = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('critical') || lowerText.includes('emergency') || 
        lowerText.includes('evacuation') || lowerText.includes('death') ||
        lowerText.includes('severe') || lowerText.includes('major disaster')) {
      return 'critical';
    }
    
    if (lowerText.includes('warning') || lowerText.includes('alert') || 
        lowerText.includes('damage') || lowerText.includes('flood') ||
        lowerText.includes('earthquake') || lowerText.includes('hurricane')) {
      return 'high';
    }
    
    if (lowerText.includes('watch') || lowerText.includes('advisory') || 
        lowerText.includes('storm') || lowerText.includes('weather')) {
      return 'medium';
    }
    
    return 'low';
  };

  const getFallbackNews = () => {
    // Enhanced fallback news with more variety
    return [
      {
        id: 'fallback-1',
        title: 'Global Climate Summit Addresses Disaster Preparedness',
        description: 'World leaders gather to discuss enhanced disaster response mechanisms and climate adaptation strategies.',
        content: 'The Global Climate Summit has brought together world leaders, scientists, and disaster management experts to address the growing need for enhanced disaster preparedness in the face of climate change. Key discussions include early warning systems, community resilience, and international cooperation frameworks.',
        url: '#',
        image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800',
        source: 'Global News Network',
        author: 'Climate Desk',
        publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        category: selectedCategory,
        severity: 'medium',
        apiSource: 'Fallback'
      },
      {
        id: 'fallback-2',
        title: 'New Early Warning System Launched for Coastal Areas',
        description: 'Advanced tsunami and storm surge warning system now operational across major coastal cities.',
        content: 'A state-of-the-art early warning system has been launched to protect coastal communities from tsunamis and storm surges. The system uses advanced sensors, satellite data, and AI algorithms to provide accurate and timely warnings to at-risk populations.',
        url: '#',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        source: 'Disaster Management Today',
        author: 'Tech Reporter',
        publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        category: selectedCategory,
        severity: 'low',
        apiSource: 'Fallback'
      },
      {
        id: 'fallback-3',
        title: 'Community Resilience Programs Show Promising Results',
        description: 'Local disaster preparedness initiatives reduce response time and improve survival rates.',
        content: 'Community-based disaster resilience programs have shown significant improvements in emergency response times and survival rates. These programs focus on local training, resource stockpiling, and neighborhood coordination networks.',
        url: '#',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        source: 'Community Safety Journal',
        author: 'Safety Correspondent',
        publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
        category: selectedCategory,
        severity: 'low',
        apiSource: 'Fallback'
      },
      {
        id: 'fallback-4',
        title: 'International Disaster Response Exercise Conducted',
        description: 'Multi-country simulation tests coordination and response capabilities for major disasters.',
        content: 'A large-scale international disaster response exercise has been conducted to test coordination mechanisms between countries during major disasters. The exercise simulated a magnitude 8.0 earthquake affecting multiple nations.',
        url: '#',
        image: 'https://images.unsplash.com/photo-1534237710431-e2fc698436d0?w=800',
        source: 'International Relief News',
        author: 'Global Correspondent',
        publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        category: selectedCategory,
        severity: 'medium',
        apiSource: 'Fallback'
      },
      {
        id: 'fallback-5',
        title: 'Mobile Emergency Alert System Reaches 1 Billion Users',
        description: 'Smartphone-based emergency notification system now covers major population centers worldwide.',
        content: 'The mobile emergency alert system has reached a milestone of 1 billion active users worldwide. The system provides real-time disaster warnings, evacuation instructions, and safety information directly to smartphones.',
        url: '#',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        source: 'Mobile Tech News',
        author: 'Technology Reporter',
        publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
        category: selectedCategory,
        severity: 'low',
        apiSource: 'Fallback'
      }
    ];
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'from-red-600 to-rose-700',
      high: 'from-orange-500 to-red-500',
      medium: 'from-yellow-500 to-orange-500',
      low: 'from-blue-500 to-cyan-500'
    };
    return colors[severity] || colors.low;
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: { text: 'CRITICAL', icon: '🚨' },
      high: { text: 'HIGH', icon: '⚠️' },
      medium: { text: 'MEDIUM', icon: '⚡' },
      low: { text: 'INFO', icon: 'ℹ️' }
    };
    return badges[severity] || badges.low;
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHrs > 0) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold gradient-text">
              📰 Real-Time News Feed
            </h2>
            <p className="text-gray-600 mt-1">
              Live news from multiple sources • Updated every 30 minutes
            </p>
          </div>
          <button
            onClick={fetchRealNews}
            className="btn-secondary"
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="status-dot"></div>
            <span className="font-semibold text-emerald-600">LIVE</span>
          </div>
          <span className="text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          {error && (
            <span className="text-orange-600 font-medium">
              ⚠️ Using fallback data
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <h3 className="text-lg font-semibold mb-3">📂 Categories</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Source Filter */}
        <div>
          <h3 className="text-lg font-semibold mb-3">📡 Sources</h3>
          <div className="flex flex-wrap gap-3">
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => setSelectedSource(source.id)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  selectedSource === source.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <span className="mr-2">{source.icon}</span>
                {source.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Fetching latest news from multiple sources...</p>
        </div>
      )}

      {/* News Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article, index) => {
            const badge = getSeverityBadge(article.severity);
            return (
              <div
                key={article.id}
                className="card hover-lift cursor-pointer animate-slide-in-bottom"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => window.open(article.url, '_blank')}
              >
                {/* Image */}
                <div className="relative -mt-6 -mx-6 mb-4 h-48 rounded-t-xl overflow-hidden">
                  <img
                    src={article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800';
                    }}
                  />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getSeverityColor(article.severity)} flex items-center gap-1`}>
                    <span>{badge.icon}</span>
                    <span>{badge.text}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                    {article.apiSource}
                  </div>
                </div>

                {/* Content */}
                <div className="flex items-center gap-2 mb-3 text-xs">
                  <span className="font-semibold text-gray-700">{article.source}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{getTimeAgo(article.publishedAt)}</span>
                </div>

                <h3 className="text-lg font-bold mb-2 line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    By {article.author}
                  </span>
                  <button className="btn-primary text-sm px-4 py-2">
                    Read More →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {!loading && news.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">📰</p>
          <p className="text-gray-600">No news found. Try a different category or check your API keys.</p>
        </div>
      )}

      {/* API Setup Instructions */}
      {!loading && news.some(article => article.apiSource === 'Fallback') && (
        <div className="card bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-blue-800 mb-3">
            🔑 Get Real News with API Keys
          </h3>
          <p className="text-blue-700 mb-4">
            Currently showing sample news. Add API keys to get real-time news from multiple sources:
          </p>
          <div className="space-y-2 text-sm text-blue-700">
            <p><strong>NewsAPI:</strong> https://newsapi.org/register (Free: 1000 requests/day)</p>
            <p><strong>Guardian:</strong> https://open-platform.theguardian.com/access/ (Free: 5000 requests/day)</p>
            <p><strong>NY Times:</strong> https://developer.nytimes.com/get-started (Free: 1000 requests/day)</p>
          </div>
          <p className="text-xs text-blue-600 mt-3">
            Add keys to client/.env and restart the app
          </p>
        </div>
      )}
    </div>
  );
};

export default RealNewsAPI;