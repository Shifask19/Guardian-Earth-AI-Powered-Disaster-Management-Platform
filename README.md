# 🌍 Guardian Earth - AI-Powered Disaster Management Platform

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen.svg)](https://mongodb.com/)


> A comprehensive disaster management and resilience platform that helps people predict, prepare, protect, and respond to disasters using AI technology.
<img width="1903" height="917" alt="image" src="https://github.com/user-attachments/assets/779cbbf2-a5e1-4543-be7d-2e565bf6624b" />


## 🎯 Overview

Guardian Earth is a full-stack web application designed to help communities prepare for and respond to natural disasters. The platform combines real-time data, AI assistance, and community features to create a comprehensive disaster management solution.

## ✨ Features

### 🤖 AI-Powered Assistance
- **AI Chatbot**: 24/7 disaster guidance powered by Google Gemini AI
- **AI Preparedness Assistant**: Personalized disaster preparation plans
- **Smart Recommendations**: Context-aware safety advice

### 🛡️ Safety & Monitoring
- **Location Safety Checker**: Real-time safety status for any location
- **Weather Alerts**: Live weather warnings and advisories
- **Emergency Contacts**: Country-specific emergency numbers (India & US)
- **Real-time Updates**: Live statistics and activity feeds

### 📰 News & Information
- **Real-time News**: Daily disaster news from multiple sources
- **Category Filtering**: Filter by disaster type (earthquakes, floods, etc.)
- **Source Selection**: NewsAPI, Guardian, NY Times integration
- **Severity Classification**: Critical, High, Medium, Info levels

### � rCommunity Features
- **Community Hub**: Create and join disaster response communities
- **Real-time Messaging**: Post updates and coordinate responses
- **Volunteer Coordination**: Connect volunteers with those in need
- **Resource Sharing**: Share and track disaster resources

### 📋 Preparedness Tools
- **Emergency Checklists**: Comprehensive preparedness checklists
- **Training Modules**: Disaster response training materials
- **Practice Drills**: Schedule and track emergency drills
- **Document Management**: Store important emergency documents

### 🎨 Modern UI/UX
- **Beautiful Animations**: Smooth CSS animations and transitions
- **Glass-morphism Design**: Modern translucent card designs
- **Gradient Backgrounds**: Stunning color gradients throughout
- **Responsive Layout**: Works on all devices (mobile, tablet, desktop)
- **Real-time Indicators**: Live status indicators and updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/guardian-earth.git
   cd guardian-earth
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp client/.env.example client/.env
   ```

4. **Configure API Keys**
   
   Edit `client/.env`:
   ```env
   # Google Gemini AI (Free)
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key
   
   # News API (Free - 1000 requests/day)
   REACT_APP_NEWS_API_KEY=your_news_api_key
   
   # Guardian API (Free - 5000 requests/day)
   REACT_APP_GUARDIAN_API_KEY=your_guardian_api_key
   ```

5. **Start the application**
   ```bash
   # Development mode (both client and server)
   npm run dev
   
   # Or start separately
   npm run server  # Backend on port 5001
   npm run client  # Frontend on port 3000
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔑 API Keys Setup

### Google Gemini AI (Required for AI features)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create API key
4. Add to `client/.env`

### NewsAPI (Optional - for real news)
1. Visit: https://newsapi.org/register
2. Sign up for free account
3. Get API key (1,000 requests/day free)
4. Add to `client/.env`

### Guardian API (Optional - for quality news)
1. Visit: https://open-platform.theguardian.com/access/
2. Register for developer key
3. Get API key (5,000 requests/day free)
4. Add to `client/.env`

## 📱 Pages & Features

| Page | URL | Description |
|------|-----|-------------|
| **Home** | `/` | Landing page with real-time features |
| **Dashboard** | `/dashboard` | Personalized user dashboard |
| **Safety Zone** | `/safety-zone` | Location safety checker & weather alerts |
| **AI Chatbot** | `/chatbot` | 24/7 AI disaster assistance |
| **Preparedness** | `/preparedness` | AI preparedness assistant & tools |
| **Community** | `/community` | Community hub & messaging |
| **News** | `/news` | Real-time disaster news |
| **Demo** | `/demo` | CSS components showcase |
| **Map** | `/map` | Interactive disaster map |
| **Alerts** | `/alerts` | Emergency alerts |
| **Volunteers** | `/volunteers` | Volunteer coordination |
| **Donations** | `/donations` | Donation management |

## 🛠️ Technology Stack

### Frontend
- **React 18.2.0** - UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI** - React component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### AI & APIs
- **Google Gemini AI** - AI chatbot and preparedness assistant
- **NewsAPI** - Real-time news data
- **Guardian API** - Quality journalism
- **Geolocation API** - Location services

## 🎨 UI Components

### Custom Components Created
- **RealTimeClock** - Live updating clock
- **LiveStats** - Real-time statistics
- **AnimatedHero** - Hero section with particles
- **LiveActivityFeed** - Live activity updates
- **WeatherWidget** - Weather information
- **LocationSafetyChecker** - Safety status checker
- **WeatherAlerts** - Weather warning system
- **AIPreparedness** - AI preparedness assistant
- **NotificationCenter** - Notification system
- **PulsingMarker** - Animated map markers
- **AnimatedProgress** - Progress bars
- **LoadingScreen** - Loading animations

### CSS Features
- **Glass-morphism effects**
- **Gradient animations**
- **Custom scrollbars**
- **Hover transformations**
- **Pulse and glow effects**
- **Slide-in animations**
- **Responsive design**

## 🌍 Global Support

### Supported Regions
- **🇮🇳 India**: 20+ major cities with local emergency numbers
- **🇺🇸 United States**: Major cities with US emergency services
- **🌐 Global**: GPS location support worldwide

### Emergency Numbers
- **India**: 112 (Emergency), 100 (Police), 101 (Fire), 102 (Ambulance)
- **USA**: 911 (Emergency), 1-800-222-1222 (Poison Control)

## 📊 Data & Storage

### Real-time Data
- Weather alerts and conditions
- News from multiple sources
- Community posts and messages
- User activity and statistics

### Local Storage
- Community data persistence
- User preferences
- Offline functionality
- Browser-based storage

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Environment variable protection
- API key security
- Input validation and sanitization

## 📱 Mobile Responsive

- **Mobile First**: Optimized for mobile devices
- **Responsive Grid**: Adapts to all screen sizes
- **Touch Friendly**: Large touch targets
- **Fast Loading**: Optimized performance

## 🚀 Deployment

### Development
```bash
npm run dev  # Starts both client and server
```

### Production Build
```bash
npm run build  # Builds client for production
```

### Environment Variables

#### Server (.env)
```env
MONGODB_URI=mongodb://localhost:27017/guardian-earth
JWT_SECRET=your-jwt-secret
PORT=5001
NODE_ENV=production
```

#### Client (client/.env)
```env
REACT_APP_GEMINI_API_KEY=your_gemini_key
REACT_APP_NEWS_API_KEY=your_news_key
REACT_APP_GUARDIAN_API_KEY=your_guardian_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for AI capabilities
- **NewsAPI** for real-time news data
- **The Guardian** for quality journalism
- **Material-UI** for React components
- **Tailwind CSS** for styling utilities
- **Unsplash** for stock images

## 📞 Support

### For Technical Issues
- Create an issue on GitHub
- Check existing documentation
- Review API documentation

### For Emergencies
- **India**: Call 112 or 100
- **USA**: Call 911
- **This app is for preparation, not emergency dispatch**

## 📈 Statistics

- **10+ Pages** with full functionality
- **25+ Components** with animations
- **50+ CSS Classes** for styling
- **3 AI Features** powered by Gemini
- **Multiple APIs** integrated
- **2 Countries** supported (India & US)
- **6 News Categories** available
- **Real-time Updates** throughout

## 🌟 Key Highlights

- ✅ **Complete Disaster Management Solution**
- ✅ **AI-Powered Assistance**
- ✅ **Real-time Data Integration**
- ✅ **Beautiful Modern UI**
- ✅ **Community Features**
- ✅ **Global Support**
- ✅ **Mobile Responsive**
- ✅ **Production Ready**

---

**Built with ❤️ for safer communities worldwide**

*Guardian Earth - Predict, Prepare, Protect, Respond* 🌍🛡️

## 📚 Documentation

- [API Setup Guide](AI_SETUP_GUIDE.md)
- [CSS Features](CSS_FEATURES.md)
- [News Integration](REAL_NEWS_SETUP.md)
- [AI Preparedness](AI_PREPAREDNESS_READY.md)
- [Quick Start](CHATBOT_QUICK_START.txt)

---

*Last updated: November 2024*#


