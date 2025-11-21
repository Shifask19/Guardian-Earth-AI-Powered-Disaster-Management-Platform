const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  type: {
    type: String,
    required: true,
    enum: ['money', 'supplies', 'services']
  },
  amount: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  items: [{
    name: String,
    quantity: Number,
    unit: String,
    estimatedValue: Number
  }],
  message: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: String,
  transactionId: String,
  deliveryInfo: {
    method: {
      type: String,
      enum: ['pickup', 'delivery', 'drop-off']
    },
    address: String,
    scheduledDate: Date,
    deliveredAt: Date,
    recipient: String
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  receipt: {
    number: String,
    url: String,
    issuedAt: Date
  }
}, {
  timestamps: true
});

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  disaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disaster'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goal: {
    amount: Number,
    items: [{
      name: String,
      quantity: Number,
      unit: String
    }]
  },
  raised: {
    amount: {
      type: Number,
      default: 0
    },
    donors: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  images: [String],
  updates: [{
    title: String,
    content: String,
    images: [String],
    postedAt: {
      type: Date,
      default: Date.now
    }
  }],
  transparency: {
    fundUsage: [{
      description: String,
      amount: Number,
      date: Date,
      receipt: String
    }],
    beneficiaries: Number,
    impactReport: String
  }
}, {
  timestamps: true
});

const Donation = mongoose.model('Donation', donationSchema);
const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Donation;
module.exports.Campaign = Campaign;