const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat with AI assistant
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context, language = 'en' } = req.body;
    const user = await User.findById(req.userId);
    
    // Get user's location for context
    const locationContext = user?.location ? 
      `User location: ${user.location.address || `${user.location.coordinates[1]}, ${user.location.coordinates[0]}`}` : 
      'Location not available';
    
    const languageInstructions = {
      'en': 'Respond in English.',
      'es': 'Responde en español.',
      'hi': 'हिंदी में जवाब दें।',
      'fr': 'Répondez en français.',
      'zh': '用中文回答。'
    };
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
    You are Guardian Earth AI, a multilingual disaster management assistant. ${languageInstructions[language] || 'Respond in English.'}
    
    Your capabilities:
    - Emergency preparedness advice
    - Real-time safety instructions during disasters
    - Information about shelters and safe routes
    - First aid guidance and medical emergency support
    - Evacuation procedures and emergency protocols
    - Disaster-specific safety measures
    - Mental health support during crises
    
    User Context: ${locationContext}
    Additional Context: ${context || 'General assistance'}
    User message: ${message}
    
    Guidelines:
    - Provide immediate, actionable advice
    - Prioritize life safety above all
    - Be empathetic and supportive
    - If it's a life-threatening emergency, remind them to call local emergency services
    - Keep responses concise but comprehensive
    - Use appropriate urgency level based on the situation
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Emit real-time response to connected clients
    const io = req.app.get('io');
    io.to(`user-${req.userId}`).emit('chatbot-response', {
      message: text,
      timestamp: new Date(),
      language
    });
    
    res.json({
      message: text,
      timestamp: new Date(),
      language
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    
    const errorMessages = {
      'en': 'I apologize, but I am currently experiencing technical difficulties. Please try again later or contact emergency services if this is urgent.',
      'es': 'Me disculpo, pero actualmente estoy experimentando dificultades técnicas. Inténtalo de nuevo más tarde o contacta a los servicios de emergencia si es urgente.',
      'hi': 'मुझे खुशी है, लेकिन मैं वर्तमान में तकनीकी कठिनाइयों का सामना कर रहा हूं। कृपया बाद में पुनः प्रयास करें या यदि यह तत्काल है तो आपातकालीन सेवाओं से संपर्क करें।',
      'fr': 'Je m\'excuse, mais je rencontre actuellement des difficultés techniques. Veuillez réessayer plus tard ou contacter les services d\'urgence si c\'est urgent.',
      'zh': '很抱歉，我目前遇到技术困难。请稍后再试，如果紧急请联系紧急服务。'
    };
    
    res.status(500).json({ 
      message: errorMessages[req.body.language] || errorMessages['en'],
      error: 'AI service unavailable'
    });
  }
});

// Get emergency contacts
router.get('/emergency-contacts', async (req, res) => {
  try {
    const { country = 'US' } = req.query;
    
    const contacts = {
      US: {
        emergency: '911',
        police: '911',
        fire: '911',
        medical: '911',
        disaster: '1-800-RED-CROSS'
      },
      IN: {
        emergency: '112',
        police: '100',
        fire: '101',
        medical: '108',
        disaster: '1070'
      },
      UK: {
        emergency: '999',
        police: '999',
        fire: '999',
        medical: '999',
        disaster: '0800 169 0169'
      }
    };
    
    res.json(contacts[country] || contacts.US);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get safety tips
router.get('/safety-tips/:disasterType', async (req, res) => {
  try {
    const { disasterType } = req.params;
    
    const safetyTips = {
      flood: [
        'Move to higher ground immediately',
        'Avoid walking or driving through flood waters',
        'Stay away from downed power lines',
        'Listen to emergency broadcasts',
        'Have emergency supplies ready'
      ],
      cyclone: [
        'Stay indoors and away from windows',
        'Secure loose objects outside',
        'Stock up on water and non-perishable food',
        'Charge electronic devices',
        'Know your evacuation route'
      ],
      earthquake: [
        'Drop, Cover, and Hold On',
        'Stay away from windows and heavy objects',
        'If outdoors, move away from buildings',
        'After shaking stops, check for injuries',
        'Be prepared for aftershocks'
      ],
      fire: [
        'Evacuate immediately if ordered',
        'Create defensible space around your home',
        'Have multiple evacuation routes planned',
        'Keep important documents ready',
        'Stay informed through official channels'
      ]
    };
    
    res.json({
      disasterType,
      tips: safetyTips[disasterType] || safetyTips.general
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;