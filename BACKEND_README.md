# Guardian Earth Backend

A comprehensive disaster management backend API built with Node.js, Express, MongoDB, and Socket.IO.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and update the values:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/guardian-earth
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5002
   ```

3. **Start the server:**
   ```bash
   # Simple start
   npm run server-simple
   
   # Or with nodemon for development
   npm run server
   
   # Or use the batch file
   start_backend.bat
   ```

4. **Verify the server is running:**
   - Health check: http://localhost:5002/api/health
   - API status: http://localhost:5002/

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Disasters
- `GET /api/disasters/nearby` - Get disasters near location (protected)
- `POST /api/disasters/report` - Report disaster incident (protected)
- `GET /api/disasters/:id` - Get disaster details

### Alerts
- `GET /api/alerts` - Get user alerts (protected)
- `PUT /api/alerts/:id/read` - Mark alert as read (protected)

### Preparedness
- `GET /api/preparedness/checklist` - Get preparedness checklist (protected)
- `PUT /api/preparedness/checklist/:id/items/:itemIndex` - Update checklist item (protected)
- `GET /api/preparedness/training` - Get training modules
- `POST /api/preparedness/training/:id/complete` - Complete training (protected)
- `GET /api/preparedness/drills` - Get user drills (protected)
- `POST /api/preparedness/drills` - Schedule drill (protected)
- `GET /api/preparedness/contacts` - Get emergency contacts (protected)
- `PUT /api/preparedness/contacts` - Update emergency contacts (protected)
- `GET /api/preparedness/resources` - Get preparedness resources

### Other Endpoints
- `GET /api/volunteers` - Volunteer management
- `GET /api/donations` - Donation management
- `GET /api/news` - News and updates
- `GET /api/community` - Community features
- `GET /api/chatbot` - AI chatbot integration

## 🔧 Features

### ✅ Working Features
- **User Authentication** - JWT-based auth system
- **Database Integration** - MongoDB with Mongoose ODM
- **Real-time Communication** - Socket.IO for live updates
- **Geospatial Queries** - Location-based disaster tracking
- **Disaster Reporting** - User-generated incident reports
- **Preparedness System** - Checklists, training, drills
- **Alert System** - Location-based emergency alerts
- **API Security** - CORS, input validation, auth middleware

### 🔄 Real-time Features
- Live disaster alerts
- User location tracking
- Real-time incident reporting
- Socket.IO room management

### 📊 Database Models
- **User** - User profiles and preferences
- **Disaster** - Disaster incidents and predictions
- **Alert** - Emergency alerts and notifications
- **Preparedness** - Checklists, training, drills, contacts
- **Community** - Community posts and interactions
- **Donation** - Donation tracking and management

## 🧪 Testing

Run the backend test suite:
```bash
node test_backend.js
```

This will test:
- Health endpoints
- User registration/login
- Protected routes
- Disaster reporting
- All API endpoints

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Protected route middleware
- Environment variable configuration

## 🌐 Environment Configuration

Required environment variables:
```env
MONGODB_URI=mongodb://localhost:27017/guardian-earth
JWT_SECRET=your-super-secret-jwt-key-for-guardian-earth-2024
WEATHER_API_KEY=your-openweather-api-key
GEMINI_API_KEY=your-google-gemini-api-key
PORT=5002
NODE_ENV=development
NEWS_API_KEY=your-NEWS_API_KEY
GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key
AI_MODEL_ENDPOINT=http://localhost:8000
PREDICTION_THRESHOLD=0.7
```

## 📱 Frontend Integration

The backend is configured to work with the React frontend:
- CORS enabled for localhost:3000 and localhost:3001
- Socket.IO configured for real-time updates
- RESTful API design for easy integration

Update your frontend to use: `http://localhost:5002`

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change PORT in .env file
   - Kill existing processes on port 5002

2. **MongoDB connection failed:**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env

3. **JWT token errors:**
   - Verify JWT_SECRET is set
   - Check token format in requests

4. **CORS errors:**
   - Verify frontend URL in CORS config
   - Check request headers

### Logs and Debugging
- Server logs show connection status
- MongoDB connection status is displayed
- Socket.IO connection events are logged
- API errors include detailed messages

## 📈 Performance

- Geospatial indexing for location queries
- Efficient database queries with Mongoose
- Connection pooling for MongoDB
- Optimized Socket.IO room management

## 🔄 Development

For development with auto-reload:
```bash
npm run server  # Uses nodemon
```

For production:
```bash
npm run server-simple  # Direct Node.js
```

## 📝 API Documentation

All endpoints return JSON responses with consistent error handling:

```json
{
  "message": "Success/Error message",
  "data": "Response data",
  "error": "Error details (if any)"
}
```

Authentication required endpoints need:
```
Authorization: Bearer <jwt_token>
```

## 🎯 Next Steps

1. Configure API keys in .env
2. Set up MongoDB database
3. Test all endpoints
4. Integrate with frontend
5. Deploy to production

Your Guardian Earth backend is now ready to handle disaster management operations! 🌍