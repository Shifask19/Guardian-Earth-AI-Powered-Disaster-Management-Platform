const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['flood', 'cyclone', 'earthquake', 'landslide', 'fire', 'tsunami']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  status: {
    type: String,
    required: true,
    enum: ['predicted', 'active', 'resolved'],
    default: 'predicted'
  },
  location: {
    type: {
      type: String,
      enum: ['Point', 'Polygon'],
      required: true
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  affectedArea: {
    radius: Number, // in kilometers
    population: Number,
    description: String
  },
  prediction: {
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    predictedAt: Date,
    expectedTime: Date,
    aiModel: String,
    dataSource: [String]
  },
  realTimeData: {
    weatherConditions: {
      temperature: Number,
      humidity: Number,
      windSpeed: Number,
      rainfall: Number,
      pressure: Number
    },
    sensorData: [{
      type: String,
      value: Number,
      unit: String,
      timestamp: Date
    }]
  },
  alerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  }],
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    description: String,
    images: [String],
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  resources: {
    shelters: [{
      name: String,
      location: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: [Number]
      },
      capacity: Number,
      available: Boolean,
      contact: String
    }],
    safeRoutes: [{
      name: String,
      coordinates: [[Number]], // Array of coordinate pairs
      description: String
    }]
  }
}, {
  timestamps: true
});

// Geospatial index
disasterSchema.index({ location: '2dsphere' });
disasterSchema.index({ type: 1, status: 1 });
disasterSchema.index({ 'prediction.expectedTime': 1 });

module.exports = mongoose.model('Disaster', disasterSchema);