import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const CommunityNew = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    location: '',
    category: 'general'
  });
  const [newPost, setNewPost] = useState('');

  // Load communities from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('communities');
    if (saved) {
      setCommunities(JSON.parse(saved));
    } else {
      // Initialize with sample communities
      const initial = [
        {
          id: 1,
          name: 'Mumbai Flood Relief',
          description: 'Community for Mumbai residents to coordinate flood relief efforts',
          location: 'Mumbai, India',
          category: 'emergency',
          members: 45,
          posts: [],
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        },
        {
          id: 2,
          name: 'Chennai Cyclone Preparedness',
          description: 'Preparing for cyclone season in Chennai',
          location: 'Chennai, India',
          category: 'preparedness',
          members: 32,
          posts: [],
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        },
        {
          id: 3,
          name: 'Delhi Emergency Response',
          description: 'Quick response team for Delhi emergencies',
          location: 'Delhi, India',
          category: 'emergency',
          members: 28,
          posts: [],
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        }
      ];
      setCommunities(initial);
      localStorage.setItem('communities', JSON.stringify(initial));
    }
  }, []);

  // Save communities to localStorage
  const saveCommunities = (updatedCommunities) => {
    setCommunities(updatedCommunities);
    localStorage.setItem('communities', JSON.stringify(updatedCommunities));
  };

  // Create new community
  const handleCreateCommunity = () => {
    if (!newCommunity.name || !newCommunity.description) {
      alert('Please fill in all required fields');
      return;
    }

    const community = {
      id: Date.now(),
      ...newCommunity,
      members: 1,
      posts: [],
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Anonymous'
    };

    const updated = [...communities, community];
    saveCommunities(updated);
    setShowCreateModal(false);
    setNewCommunity({ name: '', description: '', location: '', category: 'general' });
    alert('Community created successfully!');
  };

  // Join community
  const handleJoinCommunity = (communityId) => {
    const updated = communities.map(c => 
      c.id === communityId ? { ...c, members: c.members + 1 } : c
    );
    saveCommunities(updated);
    alert('Joined community successfully!');
  };

  // Add post to community
  const handleAddPost = (communityId) => {
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      content: newPost,
      author: user?.name || 'Anonymous',
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: []
    };

    const updated = communities.map(c => 
      c.id === communityId ? { ...c, posts: [post, ...c.posts] } : c
    );
    saveCommunities(updated);
    setNewPost('');
  };

  // Like post
  const handleLikePost = (communityId, postId) => {
    const updated = communities.map(c => {
      if (c.id === communityId) {
        return {
          ...c,
          posts: c.posts.map(p => 
            p.id === postId ? { ...p, likes: p.likes + 1 } : p
          )
        };
      }
      return c;
    });
    saveCommunities(updated);
  };

  const getCategoryColor = (category) => {
    const colors = {
      emergency: 'from-red-500 to-rose-500',
      preparedness: 'from-blue-500 to-cyan-500',
      recovery: 'from-green-500 to-emerald-500',
      general: 'from-purple-500 to-pink-500'
    };
    return colors[category] || colors.general;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      emergency: '🚨',
      preparedness: '🛡️',
      recovery: '🔄',
      general: '💬'
    };
    return icons[category] || icons.general;
  };

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-slide-in-bottom">
        <div>
          <h1 className="text-5xl font-bold gradient-text mb-2">
            👥 Community Hub
          </h1>
          <p className="text-xl text-gray-600">
            Connect, share, and support each other during disasters
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Create Community
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <div className="text-4xl mb-2">🏘️</div>
          <div className="text-3xl font-bold">{communities.length}</div>
          <div className="text-sm opacity-90">Total Communities</div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-3xl font-bold">
            {communities.reduce((sum, c) => sum + c.members, 0)}
          </div>
          <div className="text-sm opacity-90">Total Members</div>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="text-4xl mb-2">💬</div>
          <div className="text-3xl font-bold">
            {communities.reduce((sum, c) => sum + c.posts.length, 0)}
          </div>
          <div className="text-sm opacity-90">Total Posts</div>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="text-4xl mb-2">🚨</div>
          <div className="text-3xl font-bold">
            {communities.filter(c => c.category === 'emergency').length}
          </div>
          <div className="text-sm opacity-90">Emergency Groups</div>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {communities.map((community) => (
          <div
            key={community.id}
            className="card hover-lift cursor-pointer"
            onClick={() => setSelectedCommunity(community)}
          >
            <div className={`w-full h-32 bg-gradient-to-br ${getCategoryColor(community.category)} rounded-t-xl -mt-6 -mx-6 mb-4 flex items-center justify-center text-6xl`}>
              {getCategoryIcon(community.category)}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getCategoryColor(community.category)}`}>
                {community.category.toUpperCase()}
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2">{community.name}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {community.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>📍 {community.location}</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold">👥 {community.members} members</span>
                <span>💬 {community.posts.length} posts</span>
              </div>
            </div>

            <button
              className="btn-primary w-full mt-4"
              onClick={(e) => {
                e.stopPropagation();
                handleJoinCommunity(community.id);
              }}
            >
              Join Community
            </button>
          </div>
        ))}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full animate-slide-in-bottom">
            <h2 className="text-3xl font-bold gradient-text mb-6">
              Create New Community
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="e.g., Mumbai Flood Relief"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  className="input-modern"
                  rows="3"
                  placeholder="Describe the purpose of this community..."
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="e.g., Mumbai, India"
                  value={newCommunity.location}
                  onChange={(e) => setNewCommunity({ ...newCommunity, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="input-modern"
                  value={newCommunity.category}
                  onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
                >
                  <option value="general">💬 General Discussion</option>
                  <option value="emergency">🚨 Emergency Response</option>
                  <option value="preparedness">🛡️ Preparedness</option>
                  <option value="recovery">🔄 Recovery & Support</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                className="btn-primary flex-1"
                onClick={handleCreateCommunity}
              >
                Create Community
              </button>
              <button
                className="btn-secondary flex-1"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Detail Modal */}
      {selectedCommunity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card max-w-4xl w-full my-8 animate-slide-in-bottom">
            {/* Header */}
            <div className={`w-full h-40 bg-gradient-to-br ${getCategoryColor(selectedCommunity.category)} rounded-xl -mt-6 -mx-6 mb-6 flex items-center justify-center text-8xl`}>
              {getCategoryIcon(selectedCommunity.category)}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedCommunity.name}</h2>
                <p className="text-gray-600">{selectedCommunity.description}</p>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setSelectedCommunity(null)}
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
              <span>📍 {selectedCommunity.location}</span>
              <span>👥 {selectedCommunity.members} members</span>
              <span>💬 {selectedCommunity.posts.length} posts</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getCategoryColor(selectedCommunity.category)}`}>
                {selectedCommunity.category.toUpperCase()}
              </span>
            </div>

            {/* New Post */}
            <div className="mb-6">
              <textarea
                className="input-modern"
                rows="3"
                placeholder="Share updates, ask questions, or offer help..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <button
                className="btn-primary mt-2"
                onClick={() => handleAddPost(selectedCommunity.id)}
              >
                📤 Post
              </button>
            </div>

            {/* Posts */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedCommunity.posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-4">💬</p>
                  <p>No posts yet. Be the first to post!</p>
                </div>
              ) : (
                selectedCommunity.posts.map((post) => (
                  <div key={post.id} className="bg-gray-50 rounded-xl p-4 hover-lift">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                        {post.author[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{post.author}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-800 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4">
                      <button
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors"
                        onClick={() => handleLikePost(selectedCommunity.id, post.id)}
                      >
                        ❤️ {post.likes} Likes
                      </button>
                      <button className="text-sm text-gray-600 hover:text-blue-500 transition-colors">
                        💬 Comment
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityNew;
