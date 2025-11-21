# Guardian Earth - Technical Documentation

## 📋 Table of Contents
1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Data Model & Storage](#data-model--storage)
4. [AI / ML / Automation Components](#ai--ml--automation-components)
5. [Security & Compliance](#security--compliance)
6. [Scalability & Performance](#scalability--performance)

---

## 1. Technology Stack

### Frontend Technologies
- **Framework:** React 18.2.0
- **UI Library:** Material-UI (MUI) 5.14.5
- **Styling:** 
  - Tailwind CSS 3.3.3
  - Emotion (CSS-in-JS)
- **State Management:** 
  - React Context API
  - TanStack React Query 4.29.0
- **Routing:** React Router DOM 6.15.0
- **Maps:** 
  - Leaflet 1.9.4
  - React Leaflet 4.2.1
- **Real-time Communication:** Socket.IO Client 4.7.2
- **HTTP Client:** Axios 1.5.0
- **Internationalization:** i18next 23.5.1
- **Charts & Visualization:** Recharts 2.8.0
- **Markdown Rendering:** React Markdown 8.0.7

### Backend Technologies
- **Runtime:** Node.js (v14+)
- **Framework:** Express.js 4.18.2
- **Database:** MongoDB with Mongoose ODM 7.5.0
- **Real-time:** Socket.IO 4.7.2
- **Authentication:** 
  - JSON Web Tokens (JWT) 9.0.2
  - bcryptjs 2.4.3
- **File Upload:** Multer 1.4.5
- **Task Scheduling:** Node-cron 3.0.2
- **Environment Management:** dotenv 16.3.1
- **CORS:** cors 2.8.5

### AI & External APIs
- **AI Model:** Google Gemini AI (@google/generative-ai 0.1.3)
- **Weather Data:** OpenWeather API
- **News Aggregation:** News API, Guardian API, NYT API
- **Translation:** Google Translate API

### Development Tools
- **Process Management:** Nodemon 3.0.1
- **Concurrent Execution:** Concurrently 8.2.0
- **Build Tools:** React Scripts 5.0.1
- **CSS Processing:** PostCSS 8.4.29, Autoprefixer 10.4.15

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │   Maps   │  │  Alerts  │  │Community │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                          │                                    │
│                   ┌──────▼──────┐                           │
│                   │ API Client  │                           │
│                   │  (Axios)    │                           │
│                   └──────┬──────┘                           │
└──────────────────────────┼────────────────────────────────┘
                           │
                    HTTP/WebSocket
                           │
┌──────────────────────────▼────────────────────────────────┐
│                  API Gateway (Express)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   Auth   │  │Disasters │  │  Alerts  │  │Volunteers│ │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │               │              │       │
│  ┌────▼─────────────▼───────────────▼──────────────▼────┐ │
│  │           Middleware Layer                            │ │
│  │  • Authentication (JWT)                               │ │
│  │  • CORS                                               │ │
│  │  • Error Handling                                     │ │
│  │  • Request Validation                                 │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────┬────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   MongoDB   │
                    │  Database   │
                    └─────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  External Services Layer                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Gemini   │  │ Weather  │  │   News   │  │Translate │   │
│  │   AI     │  │   API    │  │   APIs   │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── AIPreparedness.jsx
│   ├── WeatherAlerts.jsx
│   ├── LiveActivityFeed.jsx
│   └── NotificationCenter.jsx
├── contexts/           # Global state management
│   ├── AuthContext.js
│   └── SocketContext.js
├── pages/             # Route-level components
│   ├── Dashboard.js
│   ├── Map.js
│   ├── Alerts.js
│   └── Community.js
├── i18n/             # Internationalization
│   └── locales/
└── App.js            # Root component
```

#### Backend Architecture
```
server/
├── models/           # Database schemas
│   ├── User.js
│   ├── Disaster.js
│   ├── Alert.js
│   └── Preparedness.js
├── routes/           # API endpoints
│   ├── auth.js
│   ├── disasters.js
│   ├── alerts.js
│   └── volunteers.js
├── middleware/       # Custom middleware
│   └── auth.js
└── index.js         # Server entry point
```

### Communication Patterns

1. **REST API:** Standard HTTP requests for CRUD operations
2. **WebSocket (Socket.IO):** Real-time bidirectional communication
3. **Event-Driven:** Socket.IO rooms for location-based updates
4. **Proxy Pattern:** Frontend proxies API requests to backend

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌───────▼────────┐
│  Frontend      │       │  Backend       │
│  (React)       │       │  (Node.js)     │
│  Port: 3001    │       │  Port: 3002    │
└────────────────┘       └───────┬────────┘
                                 │
                         ┌───────▼────────┐
                         │   MongoDB      │
                         │   Database     │
                         └────────────────┘
```

---

## 3. Data Model & Storage

### Database: MongoDB (NoSQL)

#### User Schema
```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed with bcrypt),
  phone: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude],  // GeoJSON format
    address: String
  },
  preferences: {
    language: String,
    alertTypes: [String],
    notificationMethods: [String]
  },
  isVolunteer: Boolean,
  volunteerProfile: {
    skills: [String],
    availability: String,
    radius: Number
  },
  badges: [{
    name: String,
    earnedAt: Date,
    description: String
  }],
  preparednessScore: Number (0-100),
  timestamps: { createdAt, updatedAt }
}
```

#### Disaster Schema
```javascript
{
  type: String (flood, cyclone, earthquake, landslide, fire),
  location: {
    type: "Point",
    coordinates: [longitude, latitude],
    address: String
  },
  severity: String (low, medium, high, critical),
  status: String (predicted, active, resolved),
  prediction: {
    confidence: Number (0-1),
    expectedTime: Date,
    predictedAt: Date,
    aiModel: String
  },
  reports: [{
    user: ObjectId (ref: User),
    description: String,
    images: [String],
    location: GeoJSON,
    reportedAt: Date
  }],
  affectedArea: {
    radius: Number,
    population: Number
  },
  alerts: [ObjectId (ref: Alert)],
  timestamps: { createdAt, updatedAt }
}
```

#### Alert Schema
```javascript
{
  disaster: ObjectId (ref: Disaster),
  type: String,
  severity: String,
  location: GeoJSON Point,
  message: String,
  translations: [{
    language: String,
    message: String
  }],
  isActive: Boolean,
  readBy: [ObjectId (ref: User)],
  sentTo: [ObjectId (ref: User)],
  channels: [String] (email, sms, push, app),
  timestamps: { createdAt, updatedAt }
}
```

#### Preparedness Checklist Schema
```javascript
{
  user: ObjectId (ref: User),
  category: String (emergency-kit, family-plan, home-safety, documents),
  items: [{
    name: String,
    description: String,
    isCompleted: Boolean,
    completedAt: Date,
    priority: String (low, medium, high, critical),
    notes: String
  }],
  overallProgress: Number (0-100),
  lastUpdated: Date,
  timestamps: { createdAt, updatedAt }
}
```

#### Community Schema
```javascript
{
  user: ObjectId (ref: User),
  type: String (post, question, resource, event),
  title: String,
  content: String,
  location: GeoJSON Point,
  tags: [String],
  images: [String],
  likes: [ObjectId (ref: User)],
  comments: [{
    user: ObjectId (ref: User),
    content: String,
    createdAt: Date
  }],
  isVerified: Boolean,
  timestamps: { createdAt, updatedAt }
}
```

#### Donation Schema
```javascript
{
  campaign: {
    name: String,
    description: String,
    disaster: ObjectId (ref: Disaster),
    targetAmount: Number,
    currentAmount: Number,
    currency: String
  },
  donor: ObjectId (ref: User),
  amount: Number,
  currency: String,
  paymentMethod: String,
  transactionId: String,
  status: String (pending, completed, failed),
  isAnonymous: Boolean,
  timestamps: { createdAt, updatedAt }
}
```

### Indexing Strategy

```javascript
// Geospatial Indexes (2dsphere)
User.location: "2dsphere"
Disaster.location: "2dsphere"
Alert.location: "2dsphere"
Community.location: "2dsphere"

// Compound Indexes
User: { email: 1 }
Disaster: { status: 1, type: 1, createdAt: -1 }
Alert: { isActive: 1, createdAt: -1 }
Preparedness: { user: 1, category: 1 }

// Text Indexes
Community: { title: "text", content: "text", tags: "text" }
```

### Data Relationships

```
User ──┬─── has many ──→ Alerts
       ├─── has many ──→ Preparedness Checklists
       ├─── has many ──→ Community Posts
       ├─── has many ──→ Donations
       └─── reports ──→ Disasters

Disaster ──┬─── generates ──→ Alerts
           ├─── has many ──→ Reports (from Users)
           └─── linked to ──→ Donation Campaigns

Alert ──→ belongs to ──→ Disaster
      └─→ sent to ──→ Users (many-to-many)
```

---

## 4. AI / ML / Automation Components

### Google Gemini AI Integration

#### Use Cases
1. **Intelligent Chatbot**
   - Natural language disaster queries
   - Emergency response guidance
   - Preparedness recommendations
   - Multi-language support

2. **Content Generation**
   - Personalized safety tips
   - Disaster preparedness plans
   - Emergency response instructions
   - Community resource recommendations

3. **Sentiment Analysis**
   - Community post analysis
   - User feedback processing
   - Crisis communication optimization

#### Implementation
```javascript
// AI Service Configuration
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chatbot Implementation
async function getChatbotResponse(userMessage, context) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `
    You are a disaster management assistant.
    User context: ${JSON.stringify(context)}
    User message: ${userMessage}
    
    Provide helpful, accurate disaster management advice.
  `;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

### Automated Alert System

#### Features
1. **Location-Based Alerts**
   - Geospatial queries using MongoDB 2dsphere indexes
   - Radius-based user targeting
   - Real-time push notifications via Socket.IO

2. **Multi-Channel Delivery**
   - In-app notifications
   - Email alerts
   - SMS notifications (configurable)
   - Push notifications (browser API)

3. **Smart Filtering**
   - User preference-based filtering
   - Severity-based prioritization
   - Language-specific translations

#### Implementation
```javascript
// Automated Alert Broadcasting
async function broadcastAlert(disaster) {
  // Find users within affected radius
  const affectedUsers = await User.find({
    location: {
      $near: {
        $geometry: disaster.location,
        $maxDistance: disaster.affectedArea.radius * 1000
      }
    },
    'preferences.alertTypes': disaster.type
  });
  
  // Create alert
  const alert = await Alert.create({
    disaster: disaster._id,
    type: disaster.type,
    severity: disaster.severity,
    location: disaster.location,
    message: generateAlertMessage(disaster)
  });
  
  // Broadcast via Socket.IO
  affectedUsers.forEach(user => {
    io.to(`user-${user._id}`).emit('disaster-alert', alert);
  });
  
  // Send notifications
  await sendMultiChannelNotifications(affectedUsers, alert);
}
```

### Disaster Prediction (Placeholder for ML Model)

#### Architecture
```javascript
// ML Model Integration Point
const predictDisaster = async (historicalData, weatherData, seismicData) => {
  // Call external ML model API
  const response = await axios.post(process.env.AI_MODEL_ENDPOINT, {
    historical: historicalData,
    weather: weatherData,
    seismic: seismicData
  });
  
  if (response.data.confidence > process.env.PREDICTION_THRESHOLD) {
    // Create predicted disaster
    await createPredictedDisaster(response.data);
  }
};
```

### Automated Task Scheduling

#### Node-Cron Jobs
```javascript
const cron = require('node-cron');

// Weather data sync (every hour)
cron.schedule('0 * * * *', async () => {
  await syncWeatherData();
});

// Alert cleanup (daily at midnight)
cron.schedule('0 0 * * *', async () => {
  await cleanupOldAlerts();
});

// Preparedness reminders (weekly)
cron.schedule('0 9 * * 1', async () => {
  await sendPreparednessReminders();
});
```

### Natural Language Processing

#### Multi-Language Support
- **i18next** for frontend translations
- **Google Translate API** for dynamic content
- Supported languages: English, Spanish, French, Hindi, Bengali, etc.

```javascript
// Dynamic Translation
async function translateAlert(alert, targetLanguage) {
  const translation = await googleTranslate.translate(
    alert.message,
    targetLanguage
  );
  
  alert.translations.push({
    language: targetLanguage,
    message: translation
  });
  
  await alert.save();
}
```

---

## 5. Security & Compliance

### Authentication & Authorization

#### JWT-Based Authentication
```javascript
// Token Generation
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Token Verification Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

#### Password Security
- **Hashing Algorithm:** bcrypt with salt rounds = 12
- **Password Requirements:** Minimum 6 characters
- **Storage:** Never store plain text passwords

```javascript
// Password Hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password Comparison
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

### Data Protection

#### CORS Configuration
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Input Validation
- Express JSON body parser with size limits
- Mongoose schema validation
- Custom validation middleware

#### Environment Variables
- Sensitive data stored in `.env` files
- Never committed to version control
- Different configs for dev/staging/production

### API Security

#### Rate Limiting (Recommended)
```javascript
// Implementation placeholder
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### Request Sanitization
- Prevent NoSQL injection
- XSS protection
- SQL injection prevention (N/A for MongoDB)

### Data Privacy

#### GDPR Compliance Considerations
1. **User Consent:** Explicit consent for data collection
2. **Data Minimization:** Only collect necessary data
3. **Right to Access:** Users can view their data
4. **Right to Deletion:** Users can delete their accounts
5. **Data Portability:** Export user data functionality

#### Personal Data Handling
- Location data encrypted in transit (HTTPS)
- User profiles with privacy controls
- Anonymous donation options
- Secure session management

### Security Best Practices

1. **HTTPS Only** (Production)
2. **Helmet.js** for HTTP headers security
3. **MongoDB Connection String** with authentication
4. **Regular Security Audits** with npm audit
5. **Dependency Updates** for vulnerability patches
6. **Error Handling** without exposing sensitive info
7. **Logging** without PII in production logs

---

## 6. Scalability & Performance

### Database Optimization

#### Indexing Strategy
```javascript
// Geospatial indexes for location queries
userSchema.index({ location: '2dsphere' });
disasterSchema.index({ location: '2dsphere' });

// Compound indexes for common queries
disasterSchema.index({ status: 1, type: 1, createdAt: -1 });
alertSchema.index({ isActive: 1, createdAt: -1 });

// Unique indexes for data integrity
userSchema.index({ email: 1 }, { unique: true });
```

#### Query Optimization
- **Projection:** Select only required fields
- **Pagination:** Limit results with skip/limit
- **Lean Queries:** Return plain JavaScript objects
- **Population:** Selective field population

```javascript
// Optimized query example
const disasters = await Disaster.find({
  status: { $in: ['predicted', 'active'] },
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [lng, lat] },
      $maxDistance: radius * 1000
    }
  }
})
.select('type severity location prediction')
.limit(50)
.lean();
```

### Caching Strategy

#### Client-Side Caching
- **React Query:** Automatic caching and invalidation
- **LocalStorage:** User preferences and tokens
- **Service Workers:** Offline functionality

```javascript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  }
});
```

#### Server-Side Caching (Recommended)
- **Redis:** Session storage and API response caching
- **In-Memory Cache:** Frequently accessed data
- **CDN:** Static assets and media files

### Load Balancing

#### Horizontal Scaling
```
┌─────────────┐
│Load Balancer│
└──────┬──────┘
       │
   ┌───┴───┬───────┬───────┐
   │       │       │       │
┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
│Node1│ │Node2│ │Node3│ │Node4│
└─────┘ └─────┘ └─────┘ └─────┘
```

#### Strategies
- **Round Robin:** Distribute requests evenly
- **Least Connections:** Route to least busy server
- **IP Hash:** Consistent routing for sessions

### Real-Time Performance

#### Socket.IO Optimization
```javascript
// Room-based broadcasting (reduces overhead)
socket.join(`location-${lat}-${lng}`);
io.to(`location-${lat}-${lng}`).emit('disaster-alert', data);

// Namespace separation
const alertsNamespace = io.of('/alerts');
const chatNamespace = io.of('/chat');

// Connection pooling
io.set('transports', ['websocket', 'polling']);
io.set('heartbeat interval', 25000);
io.set('heartbeat timeout', 60000);
```

### Frontend Performance

#### Code Splitting
```javascript
// Lazy loading routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Map = lazy(() => import('./pages/Map'));
const Alerts = lazy(() => import('./pages/Alerts'));

// Suspense wrapper
<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/map" element={<Map />} />
  </Routes>
</Suspense>
```

#### Asset Optimization
- **Image Optimization:** WebP format, lazy loading
- **Bundle Size:** Code splitting, tree shaking
- **Minification:** Production builds
- **Compression:** Gzip/Brotli

### Database Scaling

#### MongoDB Scaling Options

1. **Vertical Scaling**
   - Increase server resources (RAM, CPU)
   - Suitable for initial growth

2. **Horizontal Scaling (Sharding)**
   ```
   ┌─────────┐
   │ Mongos  │ (Router)
   └────┬────┘
        │
   ┌────┴────┬────────┬────────┐
   │         │        │        │
   Shard 1  Shard 2  Shard 3  Shard 4
   ```

3. **Replication**
   ```
   ┌─────────┐
   │ Primary │
   └────┬────┘
        │
   ┌────┴────┬────────┐
   │         │        │
   Secondary Secondary Secondary
   ```

#### Connection Pooling
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000
});
```

### Monitoring & Analytics

#### Performance Metrics
- **Response Time:** API endpoint latency
- **Throughput:** Requests per second
- **Error Rate:** Failed requests percentage
- **Database Performance:** Query execution time
- **Socket.IO:** Active connections, message rate

#### Monitoring Tools (Recommended)
- **Application:** PM2, New Relic, Datadog
- **Database:** MongoDB Atlas monitoring
- **Logs:** Winston, Morgan, ELK Stack
- **Uptime:** Pingdom, UptimeRobot

### CDN Integration

#### Static Asset Delivery
```javascript
// Production configuration
const CDN_URL = process.env.CDN_URL;

// Serve static files from CDN
app.use('/static', express.static('public', {
  maxAge: '1y',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));
```

### Performance Benchmarks

#### Target Metrics
- **API Response Time:** < 200ms (p95)
- **Page Load Time:** < 3 seconds
- **Time to Interactive:** < 5 seconds
- **Database Queries:** < 100ms (p95)
- **Socket.IO Latency:** < 50ms
- **Concurrent Users:** 10,000+ (with scaling)

### Optimization Checklist

✅ Database indexes on frequently queried fields
✅ Geospatial indexes for location-based queries
✅ Query result pagination
✅ React Query for client-side caching
✅ Code splitting and lazy loading
✅ Image optimization and lazy loading
✅ Gzip compression for API responses
✅ Socket.IO room-based broadcasting
✅ Connection pooling for MongoDB
✅ Environment-specific configurations
✅ Production build optimization
✅ Error boundary implementation
✅ Graceful error handling

---

## Summary

Guardian Earth is built with a modern, scalable architecture that prioritizes:

- **Reliability:** Robust error handling and fallback mechanisms
- **Performance:** Optimized queries, caching, and real-time updates
- **Security:** JWT authentication, encrypted data, CORS protection
- **Scalability:** Horizontal scaling ready, efficient database design
- **User Experience:** Real-time updates, multi-language support, responsive design
- **AI Integration:** Intelligent chatbot and automated alert system

The system is designed to handle disaster management scenarios with high availability, low latency, and the ability to scale to support thousands of concurrent users during emergency situations.

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Project:** Guardian Earth - AI-Powered Disaster Management Platform