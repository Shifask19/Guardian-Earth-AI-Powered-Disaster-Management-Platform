import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import AIPreparedness from '../components/AIPreparedness';
import axios from 'axios';

const Preparedness = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ai-assistant');
  const [checklists, setChecklists] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [drills, setDrills] = useState([]);
  const [contacts, setContacts] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'checklist') {
        const response = await axios.get('/api/preparedness/checklist');
        setChecklists(response.data);
      } else if (activeTab === 'training') {
        const response = await axios.get('/api/preparedness/training');
        setTrainings(response.data);
      } else if (activeTab === 'drills') {
        const response = await axios.get('/api/preparedness/drills');
        setDrills(response.data);
      } else if (activeTab === 'contacts') {
        const response = await axios.get('/api/preparedness/contacts');
        setContacts(response.data);
      } else if (activeTab === 'resources') {
        const response = await axios.get('/api/preparedness/resources');
        setResources(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChecklistItem = async (checklistId, itemIndex, isCompleted) => {
    try {
      await axios.put(`/api/preparedness/checklist/${checklistId}/items/${itemIndex}`, {
        isCompleted: !isCompleted
      });
      fetchData();
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'emergency-kit': '🎒',
      'family-plan': '👨‍👩‍👧‍👦',
      'home-safety': '🏠',
      'documents': '📄',
      'skills': '🎓',
      'insurance': '🛡️'
    };
    return icons[category] || '📋';
  };

  const getCategoryName = (category) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const ChecklistSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Preparedness Checklist</h2>
          <p className="text-gray-600 mt-1">Track your disaster preparedness progress</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-600">
            {Math.round(checklists.reduce((acc, c) => acc + c.overallProgress, 0) / (checklists.length || 1))}%
          </div>
          <div className="text-sm text-gray-600">Overall Progress</div>
        </div>
      </div>

      {checklists.map((checklist) => (
        <div key={checklist._id} className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getCategoryIcon(checklist.category)}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {getCategoryName(checklist.category)}
                </h3>
                <p className="text-sm text-gray-600">
                  {checklist.items.filter(i => i.isCompleted).length} of {checklist.items.length} completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{checklist.overallProgress}%</div>
              <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-full bg-primary-600 rounded-full transition-all duration-300"
                  style={{ width: `${checklist.overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {checklist.items.map((item, idx) => (
              <div 
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                  item.isCompleted ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => toggleChecklistItem(checklist._id, idx, item.isCompleted)}
                  className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <p className={`font-medium ${item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.priority}
                    </span>
                    {item.completedAt && (
                      <span className="text-xs text-gray-500">
                        ✓ {new Date(item.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const TrainingSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Training & Education</h2>
        <p className="text-gray-600 mt-1">Learn essential disaster preparedness skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainings.map((training) => (
          <div key={training._id} className="card hover:shadow-lg transition-all">
            {training.thumbnail && (
              <img src={training.thumbnail} alt={training.title} 
                   className="w-full h-48 object-cover rounded-t-lg" />
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {training.category}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {training.difficulty}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{training.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{training.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>⏱️ {training.duration} min</span>
                <span>⭐ {training.rating.average.toFixed(1)}</span>
              </div>
              
              <button className="btn-primary w-full">
                Start Training
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const DrillsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Practice Drills</h2>
          <p className="text-gray-600 mt-1">Schedule and track emergency drills</p>
        </div>
        <button className="btn-primary">
          + Schedule Drill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drills.map((drill) => (
          <div key={drill._id} className="card">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                drill.isCompleted ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                <span className="text-2xl">
                  {drill.type === 'earthquake' ? '🌍' :
                   drill.type === 'fire' ? '🔥' :
                   drill.type === 'flood' ? '🌊' :
                   drill.type === 'evacuation' ? '🚪' : '🏃'}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {drill.type.charAt(0).toUpperCase() + drill.type.slice(1)} Drill
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    drill.isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {drill.isCompleted ? 'Completed' : 'Scheduled'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {drill.isCompleted 
                    ? `Completed on ${new Date(drill.completedAt).toLocaleDateString()}`
                    : `Scheduled for ${new Date(drill.scheduledDate).toLocaleDateString()}`
                  }
                </p>
                
                {drill.isCompleted && drill.results && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 mb-1">Score: {drill.results.overallScore}/100</p>
                      <p className="text-gray-600">Duration: {drill.duration} minutes</p>
                    </div>
                  </div>
                )}
                
                <button className="btn-secondary text-sm">
                  {drill.isCompleted ? 'View Results' : 'Start Drill'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ContactsSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
        <p className="text-gray-600 mt-1">Manage your emergency contact information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Contacts</h3>
          {contacts?.contacts?.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No contacts added yet</p>
          ) : (
            <div className="space-y-3">
              {contacts?.contacts?.map((contact, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                      <p className="text-sm text-primary-600 mt-1">📞 {contact.phone}</p>
                      {contact.email && (
                        <p className="text-sm text-gray-600">✉️ {contact.email}</p>
                      )}
                    </div>
                    {contact.isPrimary && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="btn-primary w-full mt-4">
            + Add Contact
          </button>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Points</h3>
          {contacts?.meetingPoints?.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No meeting points set</p>
          ) : (
            <div className="space-y-3">
              {contacts?.meetingPoints?.map((point, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{point.name}</p>
                      <p className="text-sm text-gray-600 mt-1">📍 {point.address}</p>
                      {point.description && (
                        <p className="text-sm text-gray-600 mt-1">{point.description}</p>
                      )}
                    </div>
                    {point.isPrimary && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="btn-primary w-full mt-4">
            + Add Meeting Point
          </button>
        </div>
      </div>
    </div>
  );

  const ResourcesSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resources & Guides</h2>
        <p className="text-gray-600 mt-1">Download helpful preparedness resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div key={resource._id} className="card hover:shadow-lg transition-all">
            {resource.thumbnail && (
              <img src={resource.thumbnail} alt={resource.title} 
                   className="w-full h-48 object-cover rounded-t-lg" />
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {resource.category}
                </span>
                {resource.isOfficial && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    ✓ Official
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>📥 {resource.downloadCount} downloads</span>
              </div>
              
              <button className="btn-primary w-full">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Citizen Preparedness 🛡️</h1>
          <p className="text-gray-600 mt-1">Be ready for any disaster</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖' },
              { id: 'checklist', label: 'Checklist', icon: '✓' },
              { id: 'training', label: 'Training', icon: '🎓' },
              { id: 'drills', label: 'Drills', icon: '🏃' },
              { id: 'contacts', label: 'Contacts', icon: '📞' },
              { id: 'resources', label: 'Resources', icon: '📚' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'ai-assistant' && <AIPreparedness />}
        {activeTab === 'checklist' && <ChecklistSection />}
        {activeTab === 'training' && <TrainingSection />}
        {activeTab === 'drills' && <DrillsSection />}
        {activeTab === 'contacts' && <ContactsSection />}
        {activeTab === 'resources' && <ResourcesSection />}
      </div>
    </div>
  );
};

export default Preparedness;