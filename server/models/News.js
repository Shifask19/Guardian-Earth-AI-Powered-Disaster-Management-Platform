const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['breaking', 'update', 'warning', 'recovery', 'preparedness']
  },
  disasterType: {
    type: String,
    enum: ['flood', 'cyclone', 'earthquake', 'landslide', 'fire', 'tsunami', 'general']
  },
  location: {
    type: {
      type: String,
      enum: ['Point', 'Polygon'],
      default: 'Point'
    },
    coordinates: {
      type: [Number]
    },
    country: String,
    region: String,
    city: String
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  source: {
    name: String,
    url: String,
    credibility: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    }
  },
  images: [String],
  tags: [String],
  isBreaking: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  translations: [{
    language: String,
    title: String,
    content: String,
    summary: String
  }],
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    reactions: [{
      type: {
        type: String,
        enum: ['helpful', 'concerning', 'outdated']
      },
      count: {
        type: Number,
        default: 0
      }
    }]
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  relatedDisasters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disaster'
  }],
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiSummary: String
}, {
  timestamps: true
});

// Indexes
newsSchema.index({ location: '2dsphere' });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ category: 1, isBreaking: 1 });
newsSchema.index({ disasterType: 1, severity: 1 });
newsSchema.index({ tags: 1 });

module.exports = mongoose.model('News', newsSchema);