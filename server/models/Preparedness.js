const mongoose = require('mongoose');

const preparednessChecklistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['emergency-kit', 'family-plan', 'home-safety', 'documents', 'skills', 'insurance']
  },
  items: [{
    name: String,
    description: String,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    notes: String
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const trainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['first-aid', 'cpr', 'fire-safety', 'earthquake', 'flood', 'general-preparedness']
  },
  type: {
    type: String,
    enum: ['video', 'article', 'interactive', 'quiz', 'course'],
    required: true
  },
  content: {
    videoUrl: String,
    articleContent: String,
    quizQuestions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    steps: [{
      title: String,
      description: String,
      image: String,
      duration: Number
    }]
  },
  duration: Number, // in minutes
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  language: {
    type: String,
    default: 'en'
  },
  translations: [{
    language: String,
    title: String,
    description: String
  }],
  tags: [String],
  thumbnail: String,
  completedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date,
    score: Number,
    timeSpent: Number
  }],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

const drillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['earthquake', 'fire', 'flood', 'evacuation', 'shelter-in-place', 'communication']
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedAt: Date,
  duration: Number, // in minutes
  participants: [{
    name: String,
    role: String,
    performance: String
  }],
  results: {
    overallScore: Number,
    strengths: [String],
    improvements: [String],
    notes: String
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  reminder: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }
}, {
  timestamps: true
});

const emergencyContactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contacts: [{
    name: {
      type: String,
      required: true
    },
    relationship: String,
    phone: {
      type: String,
      required: true
    },
    email: String,
    address: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  meetingPoints: [{
    name: String,
    address: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    description: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  outOfAreaContact: {
    name: String,
    phone: String,
    email: String,
    relationship: String
  }
}, {
  timestamps: true
});

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['guide', 'checklist', 'template', 'tool', 'infographic', 'video']
  },
  disasterType: {
    type: String,
    enum: ['flood', 'earthquake', 'cyclone', 'fire', 'landslide', 'general']
  },
  content: {
    fileUrl: String,
    externalUrl: String,
    text: String
  },
  language: {
    type: String,
    default: 'en'
  },
  translations: [{
    language: String,
    title: String,
    description: String,
    fileUrl: String
  }],
  thumbnail: String,
  downloadCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  isOfficial: {
    type: Boolean,
    default: false
  },
  source: String
}, {
  timestamps: true
});

// Indexes
preparednessChecklistSchema.index({ user: 1, category: 1 });
trainingSchema.index({ category: 1, difficulty: 1 });
drillSchema.index({ user: 1, scheduledDate: 1 });
emergencyContactSchema.index({ user: 1 });
resourceSchema.index({ category: 1, disasterType: 1 });

const PreparednessChecklist = mongoose.model('PreparednessChecklist', preparednessChecklistSchema);
const Training = mongoose.model('Training', trainingSchema);
const Drill = mongoose.model('Drill', drillSchema);
const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
const Resource = mongoose.model('Resource', resourceSchema);

module.exports = {
  PreparednessChecklist,
  Training,
  Drill,
  EmergencyContact,
  Resource
};
