const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  disaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disaster',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['warning', 'watch', 'advisory', 'emergency']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
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
  affectedRadius: {
    type: Number, // in kilometers
    required: true
  },
  languages: [{
    code: String,
    title: String,
    message: String
  }],
  channels: [{
    type: String,
    enum: ['push', 'sms', 'email', 'app']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: Date,
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sentTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    channel: String,
    sentAt: Date,
    delivered: Boolean
  }],
  actionItems: [{
    action: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    description: String
  }]
}, {
  timestamps: true
});

// Geospatial index
alertSchema.index({ location: '2dsphere' });
alertSchema.index({ isActive: 1, expiresAt: 1 });

module.exports = mongoose.model('Alert', alertSchema);