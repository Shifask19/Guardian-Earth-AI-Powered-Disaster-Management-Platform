import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const News = () => {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState([]);
  const [breakingNews, setBreakingNews] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchNews();
    fetchBreakingNews();
  }, [i18n.language]);

  const fetchNews = async () => {
    try {
      const params = {
        language: i18n.language,
        limit: 20
      };
      
      if (category !== 'all') params.category = category;
      if (filter !== 'all') params.disasterType = filter;

      const response = await axios.get('/api/news', { params });
      setNews(response.data.news);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreakingNews = async () => {
    try {
      const response = await axios.get('/api/news/breaking', {
        params: { language: i18n.language }
      });
      setBreakingNews(response.data);
    } catch (error) {
      console.error('Error fetching breaking news:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'breaking': return 'bg-red-500 text-white';
      case 'warning': return 'bg-orange-500 text-white';
      case 'update': return 'bg-blue-500 text-white';
      case 'recovery': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const NewsCard = ({ article, isBreaking = false }) => (
    <div className={`card hover:shadow-lg transition-all duration-300 cursor-pointer ${
      isBreaking ? 'border-l-4 border-l-red-500 bg-red-50' : ''
    }`} onClick={() => setSelectedArticle(article)}>
      {article.images && article.images[0] && (
        <img 
          src={article.images[0]} 
          alt={article.title}
          className="w-full h-48 object-cover rounded-t-lg mb-4"
        />
      )}
      
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
          {article.category.toUpperCase()}
        </span>
        {article.severity && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(article.severity)}`}>
            {article.severity.toUpperCase()}
          </span>
        )}
        {isBreaking && (
          <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
            🔴 LIVE
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {article.title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {article.summary}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span>{article.source?.name}</span>
          {article.isVerified && (
            <span className="text-green-600">✓ Verified</span>
          )}
        </div>
        <span>
          {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
        </span>
      </div>

      {article.location && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{article.location.city || article.location.region}</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('news.title')} 📰
            </h1>
            
            {/* Filters */}
            <div className="flex items-center gap-4">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="breaking">Breaking</option>
                <option value="warning">Warnings</option>
                <option value="update">Updates</option>
                <option value="recovery">Recovery</option>
              </select>
              
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Disasters</option>
                <option value="flood">Floods</option>
                <option value="cyclone">Cyclones</option>
                <option value="earthquake">Earthquakes</option>
                <option value="fire">Wildfires</option>
                <option value="tsunami">Tsunamis</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breaking News */}
        {breakingNews.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-red-600">
                🚨 {t('news.breaking')}
              </h2>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {breakingNews.slice(0, 3).map((article) => (
                <NewsCard key={article._id} article={article} isBreaking={true} />
              ))}
            </div>
          </div>
        )}

        {/* Latest News */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('news.latest')}
          </h2>
          
          {news.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <p className="text-gray-600">No news articles found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article) => (
                <NewsCard key={article._id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedArticle.category)}`}>
                  {selectedArticle.category.toUpperCase()}
                </span>
                {selectedArticle.isBreaking && (
                  <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                    🔴 BREAKING
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {selectedArticle.images && selectedArticle.images[0] && (
                <img 
                  src={selectedArticle.images[0]} 
                  alt={selectedArticle.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedArticle.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <span>{selectedArticle.source?.name}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(selectedArticle.publishedAt), { addSuffix: true })}
                </span>
                {selectedArticle.isVerified && (
                  <>
                    <span>•</span>
                    <span className="text-green-600">✓ Verified</span>
                  </>
                )}
              </div>
              
              <div className="prose max-w-none">
                <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
              </div>
              
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;