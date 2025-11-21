import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const AIPreparedness = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const genAI = useRef(null);

  // Initialize AI
  React.useEffect(() => {
    const initAI = async () => {
      try {
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        if (apiKey && apiKey !== 'AIzaSyBqKT7W8vYx9xGxKxKxKxKxKxKxKxKxKxK') {
          genAI.current = new GoogleGenerativeAI(apiKey);
          setAiReady(true);
        }
      } catch (error) {
        console.error('AI initialization error:', error);
      }
    };

    initAI();

    // Initial message
    setMessages([
      {
        id: 1,
        text: "🤖 **AI Preparedness Assistant**\n\nI can help you create personalized disaster preparedness plans! Ask me about:\n\n• 📦 **Emergency Kit Planning**\n• 👨‍👩‍👧‍👦 **Family Emergency Plans**\n• 🏠 **Home Safety Assessments**\n• 📍 **Location-Specific Preparations**\n• 🌪️ **Disaster-Specific Planning**\n\nWhat would you like to prepare for?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

  const quickPreparednessActions = [
    {
      label: '📦 Emergency Kit',
      message: 'Help me create a comprehensive emergency kit for my family',
      icon: '📦',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: '👨‍👩‍👧‍👦 Family Plan',
      message: 'Create a family emergency communication and evacuation plan',
      icon: '👨‍👩‍👧‍👦',
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: '🏠 Home Safety',
      message: 'Assess my home for disaster preparedness and safety',
      icon: '🏠',
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: '🌪️ Disaster Planning',
      message: 'Help me prepare for specific disasters in my area',
      icon: '🌪️',
      color: 'from-orange-500 to-red-500'
    },
    {
      label: '📍 Location Plan',
      message: 'Create location-specific preparedness plan for my area',
      icon: '📍',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: '📋 Checklist',
      message: 'Generate a personalized preparedness checklist',
      icon: '📋',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

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

      // Create preparedness-focused prompt
      const systemPrompt = `You are an expert disaster preparedness consultant and AI assistant. Your role is to help people create comprehensive, personalized disaster preparedness plans.

Focus on:
- Emergency kit planning with specific items and quantities
- Family communication and evacuation plans
- Home safety assessments and improvements
- Location-specific disaster preparations
- Step-by-step actionable guidance
- Practical, realistic recommendations
- Budget-friendly options
- Regular maintenance and updates

User question: ${messageText}

Provide detailed, actionable advice with specific steps, quantities, and recommendations. Use bullet points and clear formatting. Be thorough but practical.`;

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
      
      // Enhanced fallback responses for preparedness
      let fallbackResponse = "I'm having trouble connecting to my AI brain right now. Here's some general preparedness guidance:\n\n";
      
      if (messageText.toLowerCase().includes('emergency kit') || messageText.toLowerCase().includes('kit')) {
        fallbackResponse += "📦 **Essential Emergency Kit Items:**\n\n• **Water**: 1 gallon per person per day (3-day supply)\n• **Food**: Non-perishable, 3-day supply\n• **Flashlight** and extra batteries\n• **First aid kit** with medications\n• **Whistle** for signaling help\n• **Dust masks** and plastic sheeting\n• **Moist towelettes** and garbage bags\n• **Wrench or pliers** to turn off utilities\n• **Manual can opener**\n• **Local maps** and emergency contact info\n• **Cell phone** with chargers\n• **Cash** in small bills\n• **Emergency blanket**\n• **Matches** in waterproof container";
      } else if (messageText.toLowerCase().includes('family plan') || messageText.toLowerCase().includes('communication')) {
        fallbackResponse += "👨‍👩‍👧‍👦 **Family Emergency Plan Basics:**\n\n• **Meeting Places**: Choose 2 locations (near home & outside neighborhood)\n• **Emergency Contacts**: Out-of-state contact person\n• **Communication Plan**: How family will contact each other\n• **Evacuation Routes**: Know 2 ways out of your area\n• **Important Documents**: Copies in waterproof container\n• **Special Needs**: Plans for elderly, disabled, or pets\n• **School/Work Plans**: Know their emergency procedures\n• **Practice**: Review and practice plan every 6 months";
      } else if (messageText.toLowerCase().includes('home safety') || messageText.toLowerCase().includes('home')) {
        fallbackResponse += "🏠 **Home Safety Assessment:**\n\n• **Secure Heavy Items**: Anchor bookcases, water heaters\n• **Know Utilities**: How to turn off gas, water, electricity\n• **Fire Safety**: Smoke detectors, fire extinguisher, escape routes\n• **Safe Spots**: Identify for earthquakes (under sturdy table)\n• **Emergency Supplies**: Store in accessible location\n• **Important Documents**: Fireproof safe or safety deposit box\n• **Insurance**: Review coverage annually\n• **Maintenance**: Check smoke detectors monthly";
      } else {
        fallbackResponse += "🛡️ **General Preparedness Steps:**\n\n• **Assess Risks**: Know disasters common to your area\n• **Make Plans**: Family communication and evacuation plans\n• **Build Kits**: Emergency supplies for home, work, car\n• **Stay Informed**: Sign up for local alerts\n• **Practice**: Regular drills and plan reviews\n• **Connect**: Know your neighbors and community resources\n• **Learn Skills**: First aid, CPR, basic emergency response\n• **Maintain**: Update plans and supplies regularly";
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
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold gradient-text">🤖 AI Preparedness Assistant</h2>
          <p className="text-gray-600 mt-1">
            Get personalized disaster preparedness plans powered by AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${aiReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {aiReady ? 'AI Ready' : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 h-96 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'bg-white border-2 border-gray-200 text-gray-800'
                } shadow-lg`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl">
                    {message.sender === 'user' ? '👤' : '🤖'}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">
                      {message.sender === 'user' ? 'You' : 'AI Assistant'}
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
            <div className="flex justify-start">
              <div className="bg-white border-2 border-gray-200 p-4 rounded-2xl shadow-lg">
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
        </div>
      </div>

      {/* Input Area */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          className="input-modern flex-1"
          placeholder="Ask about emergency kits, family plans, home safety..."
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
          <span className="text-xl">🚀</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">⚡ Quick Preparedness Topics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickPreparednessActions.map((action, index) => (
            <button
              key={index}
              onClick={() => sendMessage(action.message)}
              disabled={loading}
              className={`p-3 rounded-xl bg-gradient-to-r ${action.color} text-white font-semibold 
                         shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed text-left text-sm`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{action.icon}</span>
                <span>{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API Status */}
      {!aiReady && (
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
          <h4 className="font-bold text-yellow-800 mb-2">🔑 AI Assistant Setup</h4>
          <p className="text-yellow-700 text-sm">
            Add your Gemini API key to get personalized AI preparedness advice. 
            The assistant works with fallback responses for now.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIPreparedness;