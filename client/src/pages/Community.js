import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Community = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('communities');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await axios.get('/api/community');
      setCommunities(response.data.communities);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityDetails = async (communityId) => {
    try {
      const [communityRes, postsRes, eventsRes] = await Promise.all([
        axios.get(`/api/community/${communityId}`),
        axios.get(`/api/community/${communityId}/posts`),
        axios.get(`/api/community/${communityId}/events`)
      ]);
      
      setSelectedCommunity(communityRes.data);
      setPosts(postsRes.data.posts);
      setEvents(eventsRes.data);
      setActiveTab('feed');
    } catch (error) {
      console.error('Error fetching community details:', error);
    }
  };

  const joinCommunity = async (communityId) => {
    try {
      await axios.post(`/api/community/${communityId}/join`);
      fetchCommunities();
      alert('Successfully joined community!');
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const CommunityCard = ({ community }) => (
    <div className="card hover:shadow-lg transition-all duration-300 cursor-pointer"
         onClick={() => fetchCommunityDetails(community._id)}>
      {community.coverImage && (
        <img src={community.coverImage} alt={community.name} 
             className="w-full h-48 object-cover rounded-t-lg" />
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900">{community.name}</h3>
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            {community.type}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{community.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>👥 {community.memberCount} members</span>
            <span>📝 {community.stats.totalPosts} posts</span>
            <span>📅 {community.stats.totalEvents} events</span>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              joinCommunity(community._id);
            }}
            className="btn-primary flex-1"
          >
            Join Community
          </button>
          <button className="btn-secondary">
            View
          </button>
        </div>
      </div>
    </div>
  );

  const PostCard = ({ post }) => (
    <div className="card mb-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-primary-600 font-bold">
            {post.author?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{post.author?.name}</h4>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              post.priority === 'urgent' ? 'bg-red-100 text-red-700' :
              post.priority === 'high' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {post.type}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
          <p className="text-gray-700 mb-4">{post.content}</p>
          
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {post.images.map((img, idx) => (
                <img key={idx} src={img} alt="" className="rounded-lg w-full h-48 object-cover" />
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <button className="flex items-center gap-1 hover:text-primary-600">
              👍 {post.reactions?.length || 0}
            </button>
            <button className="flex items-center gap-1 hover:text-primary-600">
              💬 {post.comments?.length || 0}
            </button>
            <button className="flex items-center gap-1 hover:text-primary-600">
              👁️ {post.views || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const EventCard = ({ event }) => (
    <div className="card mb-4">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-blue-600">
            {new Date(event.startDate).getDate()}
          </span>
          <span className="text-xs text-blue-600">
            {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {event.type}
            </span>
          </div>
          
          <p className="text-gray-600 mb-3">{event.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span>📅 {new Date(event.startDate).toLocaleString()}</span>
            <span>📍 {event.location.address}</span>
            <span>👥 {event.attendees?.length || 0} attending</span>
          </div>
          
          <button className="btn-primary">
            RSVP
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communities...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Hub 🤝</h1>
              <p className="text-gray-600 mt-1">Connect, share, and prepare together</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              + Create Community
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!selectedCommunity ? (
          /* Communities List */
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                All Communities
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                My Communities
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Nearby
              </button>
            </div>

            {communities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏘️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No communities yet</h3>
                <p className="text-gray-600 mb-4">Be the first to create a community!</p>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                  Create Community
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map(community => (
                  <CommunityCard key={community._id} community={community} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Community Details */
          <div>
            <button 
              onClick={() => setSelectedCommunity(null)}
              className="mb-4 text-primary-600 hover:text-primary-700 flex items-center gap-2"
            >
              ← Back to Communities
            </button>

            {/* Community Header */}
            <div className="card mb-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">🏘️</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedCommunity.name}
                  </h2>
                  <p className="text-gray-600 mb-4">{selectedCommunity.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>👥 {selectedCommunity.memberCount} members</span>
                    <span>📝 {selectedCommunity.stats.totalPosts} posts</span>
                    <span>📅 {selectedCommunity.stats.totalEvents} events</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
              <button 
                onClick={() => setActiveTab('feed')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'feed' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600'
                }`}
              >
                Feed
              </button>
              <button 
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'events' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600'
                }`}
              >
                Events
              </button>
              <button 
                onClick={() => setActiveTab('members')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'members' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600'
                }`}
              >
                Members
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {activeTab === 'feed' && (
                  <div>
                    <div className="card mb-4">
                      <textarea 
                        placeholder="Share something with the community..."
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows="3"
                      />
                      <div className="flex justify-end mt-2">
                        <button className="btn-primary">Post</button>
                      </div>
                    </div>

                    {posts.length === 0 ? (
                      <div className="text-center py-12 card">
                        <p className="text-gray-600">No posts yet. Be the first to post!</p>
                      </div>
                    ) : (
                      posts.map(post => <PostCard key={post._id} post={post} />)
                    )}
                  </div>
                )}

                {activeTab === 'events' && (
                  <div>
                    {events.length === 0 ? (
                      <div className="text-center py-12 card">
                        <p className="text-gray-600">No upcoming events</p>
                      </div>
                    ) : (
                      events.map(event => <EventCard key={event._id} event={event} />)
                    )}
                  </div>
                )}

                {activeTab === 'members' && (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Members</h3>
                    <div className="space-y-3">
                      {selectedCommunity.members?.map((member, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {member.user?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{member.user?.name}</p>
                            <p className="text-sm text-gray-500">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div>
                <div className="card mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-sm text-gray-600 mb-4">{selectedCommunity.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span className="text-gray-600">{selectedCommunity.location?.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🏷️</span>
                      <span className="text-gray-600">{selectedCommunity.type}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full btn-primary text-sm">Create Post</button>
                    <button className="w-full btn-secondary text-sm">Create Event</button>
                    <button className="w-full btn-secondary text-sm">Invite Members</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;