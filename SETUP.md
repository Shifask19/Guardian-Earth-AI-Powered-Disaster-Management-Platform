# 🚀 Guardian Earth - Complete Setup Guide

## ⚡ Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Environment Setup
```bash
# Copy environment files
cp .env.example .env
cp client/.env.example client/.env
```

### 3. Configure API Keys

#### Edit `client/.env`:
```env
# Google Gemini AI (Required for AI features)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key

# News APIs (Optional - for real news)
REACT_APP_NEWS_API_KEY=your_news_api_key
REACT_APP_GUARDIAN_API_KEY=your_guardian_api_key
```

### 4. Start the Application

#### Option 1: Full Stack (Recommended)
```bash
# Start both client and server
npm run dev
```

#### Option 2: Client Only (Works without backend)
```bash
# Start only the frontend
cd client
npm start
```

#### Option 3: Separate Terminals
```bash
# Terminal 1: Start server
npm run server

# Terminal 2: Start client
npm run client
```

### 5. Open Your Browser
```
http://localhost:3000
```

---

## 🔑 API Keys Setup

### Google Gemini AI (Required)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and paste in `client/.env`
5. **Free Tier**: 1,500 requests/day

### NewsAPI (Optional)
1. Visit: https://newsapi.org/register
2. Sign up for free account
3. Get API key
4. **Free Tier**: 1,000 requests/day

### Guardian API (Optional)
1. Visit: https://open-platform.theguardian.com/access/
2. Register for developer key
3. Get API key
4. **Free Tier**: 5,000 requests/day

---

## 🎯 Features Overview

### 🤖 AI-Powered
- **AI Chatbot**: 24/7 disaster assistance
- **AI Preparedness**: Personalized emergency plans
- **Smart Recommendations**: Context-aware advice

### 🛡️ Safety & Monitoring
- **Location Safety**: Check if any location is safe
- **Weather Alerts**: Real-time weather warnings
- **Emergency Contacts**: India & US numbers
- **Live Updates**: Real-time statistics

### 📰 News & Information
- **Real-time News**: Daily disaster news
- **Multiple Sources**: NewsAPI, Guardian, NY Times
- **Category Filtering**: By disaster type
- **Severity Levels**: Critical, High, Medium, Info

### 👥 Community
- **Community Hub**: Create and join communities
- **Real-time Messaging**: Post updates
- **Volunteer Coordination**: Connect helpers
- **Data Persistence**: Saves in browser

### 📋 Preparedness
- **Emergency Checklists**: Comprehensive lists
- **Training Modules**: Educational content
- **Practice Drills**: Schedule and track
- **AI Assistant**: Personalized planning

---

## 📱 Pages Available

| Page | URL | Description |
|------|-----|-------------|
| **Home** | `/` | Landing page with real-time features |
| **Dashboard** | `/dashboard` | Personalized user dashboard |
| **Safety Zone** | `/safety-zone` | Location safety & weather alerts |
| **AI Chatbot** | `/chatbot` | 24/7 AI disaster assistance |
| **Preparedness** | `/preparedness` | AI preparedness assistant |
| **Community** | `/community` | Community hub & messaging |
| **News** | `/news` | Real-time disaster news |
| **Demo** | `/demo` | CSS components showcase |

---

## 🌍 Global Support

### Supported Regions
- **🇮🇳 India**: 20+ cities (Mumbai, Delhi, Bangalore, Chennai, etc.)
- **🇺🇸 United States**: Major cities (Los Angeles, New York, etc.)
- **🌐 Global**: GPS location support worldwide

### Emergency Numbers
- **India**: 112 (Emergency), 100 (Police), 101 (Fire), 102 (Ambulance)
- **USA**: 911 (Emergency), 1-800-222-1222 (Poison Control)

---

## 💬 Try These AI Questions

### Emergency Help
```
"I'm in an earthquake, what do I do?"
"There's a fire in my building, help!"
"Flood water is rising, what should I do?"
```

### Preparedness Planning
```
"Help me create an emergency kit for my family of 4"
"Create a family emergency communication plan"
"How do I prepare for Mumbai monsoons?"
```

### Location Safety
```
Type any city name in Safety Zone:
- Mumbai, Delhi, Chennai (India)
- Los Angeles, New York (USA)
- Or use GPS for current location
```

---

## 🎨 UI Features

### Modern Design
- ✨ Glass-morphism cards
- 🌈 Gradient backgrounds
- 💫 Smooth animations
- 📱 Fully responsive
- 🎯 Real-time indicators

### Interactive Elements
- 🖱️ Hover effects on cards
- 👆 Click animations on buttons
- 📜 Custom gradient scrollbars
- ⚡ Live status indicators
- 🔔 Notification system

---

## 🛠️ Technology Stack

### Frontend
- React 18.2.0
- Tailwind CSS
- Material-UI
- Socket.io Client

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.io

### AI & APIs
- Google Gemini AI
- NewsAPI
- Guardian API
- Geolocation API

---

## 🚨 Troubleshooting

### Connection Errors (Socket.io/CORS)
```bash
# If you see "ERR_CONNECTION_REFUSED" or CORS errors:

# Option 1: Start the backend server
npm run server

# Option 2: Use client-only mode (app works without backend)
cd client
npm start
```

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules client/node_modules
npm install
cd client && npm install
```

### Backend Server Issues
```bash
# Check if MongoDB is running (optional)
# The app works without database

# Start server manually
node server/index.js

# Or use the helper script
node start-server.js
```

### API Errors
1. Check API keys are correct
2. Verify keys are in `client/.env`
3. Restart the app
4. Check API quotas

### Console Errors
1. Hard refresh (Ctrl+F5)
2. Clear browser cache
3. Check browser console
4. Try different browser

### Port Issues
- Frontend runs on port 3000 (or 3001)
- Backend runs on port 5001
- Make sure ports are not in use by other apps

---

## 📊 What Works Without Backend Server

### Frontend-Only Mode (Always Works)
- ✅ Beautiful UI and animations
- ✅ Community features (create, join, post)
- ✅ Location safety checker (with sample data)
- ✅ AI chatbot (with fallback responses)
- ✅ News (with sample articles)
- ✅ All navigation and pages
- ✅ Real-time clock and statistics
- ✅ Weather widget
- ✅ All CSS animations

### Enhanced with Backend Server
- 🔄 Real-time socket connections
- 💾 Database storage
- 👤 User authentication
- 📡 Live notifications

### Enhanced with API Keys
- 🤖 Real AI responses from Gemini
- 📰 Live news from multiple sources
- 🌤️ Real weather data
- 📍 Enhanced location services

---

## 🎯 Quick Test Checklist

### After Setup, Test These:
- [ ] App loads at http://localhost:3000
- [ ] All pages navigate correctly
- [ ] AI chatbot responds (with or without API key)
- [ ] Community features work (create, join, post)
- [ ] Location safety checker works
- [ ] News page shows articles
- [ ] Animations and UI look good
- [ ] Mobile responsive design works

---

## 🔒 Security Notes

- ✅ API keys stored in environment variables
- ✅ No sensitive data in code
- ✅ Client-side API calls only
- ✅ No backend authentication required for demo

---

## 📈 Performance

### Optimized For
- ⚡ Fast loading times
- 📱 Mobile devices
- 🌐 All modern browsers
- 💾 Local data storage
- 🔄 Real-time updates

---

## 🎉 You're Ready!

Your Guardian Earth platform includes:
- ✅ AI-powered disaster assistance
- ✅ Real-time safety monitoring
- ✅ Community features
- ✅ News integration
- ✅ Beautiful modern UI
- ✅ Global support (India & US)
- ✅ Mobile responsive design

---

## 📞 Support

### For Technical Issues
- Check this setup guide
- Review console for errors
- Test with different browsers
- Clear cache and restart

### For Emergencies
- **India**: Call 112 or 100
- **USA**: Call 911
- **This app is for preparation, not emergency dispatch**

---

**Built with ❤️ for safer communities worldwide**

*Guardian Earth - Predict, Prepare, Protect, Respond* 🌍🛡️