const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    alertTypes: [{
      type: String,
      enum: ['flood', 'cyclone', 'earthquake', 'landslide', 'fire']
    }],
    notificationMethods: [{
      type: String,
      enum: ['email', 'sms', 'push']
    }]
  },
  isVolunteer: {
    type: Boolean,
    default: false
  },
  volunteerProfile: {
    skills: [String],
    availability: String,
    radius: Number // km radius for volunteer activities
  },
  badges: [{
    name: String,
    earnedAt: Date,
    description: String
  }],
  preparednessScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);