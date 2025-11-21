import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const messagesEndRef = useRef(null);
  const genAI = useRef(null);

  const quickActions = [
    { label: '🚨 Emergency Help', message: 'I need emergency assistance now', icon: '🚨', color: 'from-red-500 to-rose-500' },
    { label: '🛡️ Safety Tips', message: 'Give me safety tips for disasters', icon: '🛡️', color: 'from-blue-500 to-cyan-500' },
    { label: '🏠 Find Shelter', message: 'Where can I find emergency shelter?', icon: '🏠', color: 'from-green-500 to-emerald-500' },
    { label: '🩹 First Aid', message: 'How do I provide first aid?', icon: '🩹', color: 'from-purple-500 to-pink-500' },
    { label: '🌊 Flood Safety', message: 'What should I do during a flood?', icon: '🌊', color: 'from-cyan-500 to-blue-500' },
    { label: '🔥 Fire Safety', message: 'How to stay safe during a fire?', icon: '🔥', color: 'from-orange-500 to-red-500' },
    { label: '🌪️ Tornado Safety', message: 'What to do during a tornado?', icon: '🌪️', color: 'from-gray-500 to-slate-500' },
    { label: '📦 Emergency Kit', message: 'What should be in my emergency kit?', icon: '📦', color: 'from-amber-500 to-orange-500' }
  ];

  useEffect(() => {
    // Initialize Gemini AI
    const initAI = async () => {
      try {
        // Use your API key - you can also store it in .env as REACT_APP_GEMINI_API_KEY
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY ||'' ; // Replace with your key
        genAI.current = new GoogleGenerativeAI(apiKey);
        setAiReady(true);
      } catch (error) {
        console.error('AI initialization error:', error);
      }
    };

    initAI();

    setMessages([
      {
        id: 1,
        text: "👋 Hello! I'm **Guardian Earth AI**, your 24/7 disaster management assistant.\n\n🤖 I can help you with:\n• Emergency preparedness\n• Safety tips for disasters\n• First aid guidance\n• Finding shelters\n• Creating emergency plans\n• Real-time disaster advice\n\n💬 How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      if (!genAI.current) {
        throw new Error('AI not initialized');
      }

      const model = genAI.current.getGenerativeModel({ model: 'gemini-pro' });

      // Create disaster-focused prompt
      const systemPrompt = `You are Guardian Earth AI, an expert disaster management and emergency preparedness assistant. 

Your role is to:
- Provide accurate, life-saving information about disasters
- Give practical emergency preparedness advice
- Offer first aid guidance
- Help people create emergency plans
- Provide safety tips for various disasters (floods, fires, earthquakes, tornadoes, hurricanes, etc.)
- Be empathetic and supportive
- Always prioritize safety and encourage calling emergency services (911) for immediate life-threatening situations

User location: ${user?.location?.address || 'Not specified'}
User question: ${messageText}

Provide a helpful, clear, and actionable response. Use emojis to make it engaging. Format important points with bullet points.`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const botResponse = response.text();

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      
      // Fallback responses for common questions
      let fallbackResponse = "I'm having trouble connecting to my AI brain right now. ";
      
      if (messageText.toLowerCase().includes('emergency') || messageText.toLowerCase().includes('help')) {
        fallbackResponse += "🚨 **For immediate emergencies, call 911 now!**\n\n📞 Emergency Numbers:\n• Fire: 911\n• Police: 911\n• Medical: 911\n• Poison Control: 1-800-222-1222";
      } else if (messageText.toLowerCase().includes('first aid')) {
        fallbackResponse += "🩹 **Basic First Aid:**\n• Stop bleeding with pressure\n• Keep victim calm\n• Don't move injured person unless necessary\n• Call 911 for serious injuries\n• Apply ice to sprains\n• Clean wounds with water";
      } else if (messageText.toLowerCase().includes('shelter')) {
        fallbackResponse += "🏠 **Finding Shelter:**\n• Check local emergency management websites\n• Call 211 for shelter information\n• Red Cross shelters: redcross.org\n• Schools and community centers often serve as shelters\n• Listen to local radio for updates";
      } else {
        fallbackResponse += "Please try asking again, or contact emergency services if this is urgent.";
      }

      const errorMessage = {
        id: Date.now() + 1,
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-in-bottom">
        <h1 className="text-5xl font-bold gradient-text mb-4">
          🤖 Guardian Earth AI Assistant
        </h1>
        <p className="text-xl text-gray-600">
          Your 24/7 Disaster Preparedness & Emergency Helper
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="status-badge">
            <div className="status-dot"></div>
            <span>{aiReady ? 'AI READY' : 'LOADING...'}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <div className="card h-[600px] flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-bottom`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-2 border-gray-200'
                    } shadow-lg hover-lift`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-2xl">
                        {message.sender === 'user' ? '👤' : '🤖'}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold mb-1">
                          {message.sender === 'user' ? 'You' : 'Guardian AI'}
                        </p>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.text}
                    </div>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-4 rounded-2xl border-2 border-gray-200 shadow-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🤖</span>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-gray-600 font-medium">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t-2 border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  className="input-modern flex-1"
                  placeholder="Ask me anything about disaster preparedness..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                  disabled={loading}
                />
                <button
                  className="btn-primary px-8"
                  onClick={() => sendMessage()}
                  disabled={loading || !inputMessage.trim()}
                >
                  <span className="text-xl">📤</span>
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Alert */}
          <div className="alert-critical mt-4 animate-pulse-slow">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <p className="font-bold text-lg">EMERGENCY?</p>
                <p className="text-sm">For immediate life-threatening emergencies, call <strong>911</strong> directly!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              ⚡ Quick Actions
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Click any button to get instant help
            </p>
            
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(action.message)}
                  disabled={loading}
                  className={`w-full p-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-semibold 
                             shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed text-left`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{action.icon}</span>
                    <span>{action.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Emergency Contacts */}
            <div className="mt-6 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
              <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <span className="text-xl">📞</span>
                Emergency Contacts
              </h4>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="font-semibold">Emergency:</span>
                  <span className="text-red-600 font-bold">911</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Poison Control:</span>
                  <span className="text-red-600">1-800-222-1222</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Red Cross:</span>
                  <span className="text-red-600">1-800-733-2767</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">FEMA:</span>
                  <span className="text-red-600">1-800-621-3362</span>
                </p>
              </div>
            </div>

            {/* AI Status */}
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <span className="text-xl">🤖</span>
                AI Status
              </h4>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${aiReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium text-blue-900">
                  {aiReady ? 'Online & Ready' : 'Initializing...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;