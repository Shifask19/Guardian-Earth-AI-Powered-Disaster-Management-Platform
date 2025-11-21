const mongoose = require('mongoose');
const crypto = require('crypto');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit-card', 'debit-card', 'bank-transfer', 'paypal', 'crypto', 'upi']
  },
  paymentDetails: {
    last4: String,
    cardType: String,
    bankName: String,
    cryptoAddress: String,
    cryptoTxHash: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'verified', 'completed', 'failed', 'refunded', 'flagged'],
    default: 'pending'
  },
  fraudCheck: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    flags: [{
      type: String,
      reason: String,
      severity: String,
      timestamp: Date
    }],
    checks: {
      ipVerification: { passed: Boolean, details: String },
      emailVerification: { passed: Boolean, details: String },
      phoneVerification: { passed: Boolean, details: String },
      deviceFingerprint: { passed: Boolean, details: String },
      velocityCheck: { passed: Boolean, details: String },
      amountAnalysis: { passed: Boolean, details: String },
      behaviorAnalysis: { passed: Boolean, details: String },
      blacklistCheck: { passed: Boolean, details: String }
    },
    aiAnalysis: {
      model: String,
      confidence: Number,
      prediction: String,
      features: mongoose.Schema.Types.Mixed
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String
  },
  verification: {
    twoFactorAuth: {
      required: Boolean,
      completed: Boolean,
      method: String,
      timestamp: Date
    },
    emailConfirmation: {
      sent: Boolean,
      confirmed: Boolean,
      token: String,
      expiresAt: Date
    },
    smsConfirmation: {
      sent: Boolean,
      confirmed: Boolean,
      code: String,
      expiresAt: Date
    },
    identityVerification: {
      required: Boolean,
      completed: Boolean,
      method: String,
      documentType: String,
      verifiedAt: Date
    }
  },
  blockchain: {
    enabled: {
      type: Boolean,
      default: true
    },
    network: String,
    txHash: String,
    blockNumber: Number,
    contractAddress: String,
    timestamp: Date,
    confirmations: Number,
    gasUsed: Number
  },
  tracking: {
    ipAddress: String,
    userAgent: String,
    deviceId: String,
    location: {
      country: String,
      region: String,
      city: String,
      coordinates: [Number]
    },
    sessionId: String,
    referrer: String
  },
  timeline: [{
    status: String,
    timestamp: Date,
    note: String,
    updatedBy: String
  }],
  receipt: {
    number: String,
    url: String,
    generatedAt: Date,
    emailSent: Boolean
  },
  refund: {
    requested: Boolean,
    requestedAt: Date,
    reason: String,
    approved: Boolean,
    approvedBy: mongoose.Schema.Types.ObjectId,
    processedAt: Date,
    refundAmount: Number,
    refundTxId: String
  },
  metadata: {
    isAnonymous: Boolean,
    message: String,
    dedicatedTo: String,
    taxDeductible: Boolean,
    receiptRequested: Boolean
  }
}, {
  timestamps: true
});

const fraudPatternSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['suspicious-ip', 'velocity-abuse', 'stolen-card', 'fake-identity', 'bot-activity', 'unusual-pattern']
  },
  description: String,
  indicators: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    weight: Number
  }],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  detectedCount: {
    type: Number,
    default: 0
  },
  lastDetected: Date,
  affectedTransactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SecureTransaction'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  resolution: {
    resolved: Boolean,
    resolvedAt: Date,
    resolvedBy: mongoose.Schema.Types.ObjectId,
    action: String,
    notes: String
  }
}, {
  timestamps: true
});

const donorVerificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  verificationLevel: {
    type: String,
    enum: ['unverified', 'basic', 'standard', 'premium', 'trusted'],
    default: 'unverified'
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  verifications: {
    email: {
      verified: Boolean,
      verifiedAt: Date,
      method: String
    },
    phone: {
      verified: Boolean,
      verifiedAt: Date,
      method: String
    },
    identity: {
      verified: Boolean,
      verifiedAt: Date,
      documentType: String,
      documentNumber: String,
      expiryDate: Date
    },
    address: {
      verified: Boolean,
      verifiedAt: Date,
      method: String
    },
    bankAccount: {
      verified: Boolean,
      verifiedAt: Date,
      bankName: String,
      accountType: String
    }
  },
  donationHistory: {
    totalDonations: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    averageAmount: Number,
    firstDonation: Date,
    lastDonation: Date,
    successfulTransactions: Number,
    failedTransactions: Number,
    refundedTransactions: Number
  },
  riskFactors: [{
    factor: String,
    severity: String,
    detectedAt: Date,
    resolved: Boolean
  }],
  restrictions: {
    isBlacklisted: Boolean,
    blacklistedAt: Date,
    blacklistReason: String,
    maxDonationAmount: Number,
    requiresManualReview: Boolean,
    allowedPaymentMethods: [String]
  },
  notes: [{
    note: String,
    addedBy: mongoose.Schema.Types.ObjectId,
    addedAt: Date,
    category: String
  }]
}, {
  timestamps: true
});

const campaignVerificationSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    unique: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'under-review', 'verified', 'rejected', 'suspended'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  documents: [{
    type: String,
    name: String,
    url: String,
    uploadedAt: Date,
    verified: Boolean
  }],
  organizationDetails: {
    name: String,
    registrationNumber: String,
    taxId: String,
    address: String,
    contactPerson: String,
    contactEmail: String,
    contactPhone: String,
    website: String,
    verified: Boolean
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
    swiftCode: String,
    verified: Boolean,
    verifiedAt: Date
  },
  compliance: {
    taxExemptStatus: Boolean,
    registeredCharity: Boolean,
    governmentApproved: Boolean,
    auditedFinancials: Boolean,
    transparencyScore: Number
  },
  fundUsage: {
    plan: String,
    budget: mongoose.Schema.Types.Mixed,
    milestones: [{
      description: String,
      targetDate: Date,
      completed: Boolean,
      completedAt: Date,
      proof: String
    }],
    reports: [{
      reportDate: Date,
      amountUsed: Number,
      description: String,
      receipts: [String],
      beneficiaries: Number
    }]
  },
  trustIndicators: {
    yearsActive: Number,
    previousCampaigns: Number,
    successRate: Number,
    averageRating: Number,
    totalBeneficiaries: Number,
    mediaVerification: Boolean,
    thirdPartyEndorsements: [String]
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ donor: 1, createdAt: -1 });
transactionSchema.index({ campaign: 1, status: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ 'fraudCheck.riskLevel': 1, status: 1 });
transactionSchema.index({ 'blockchain.txHash': 1 });

fraudPatternSchema.index({ type: 1, isActive: 1 });
fraudPatternSchema.index({ severity: 1, lastDetected: -1 });

donorVerificationSchema.index({ user: 1 });
donorVerificationSchema.index({ verificationLevel: 1, trustScore: -1 });

campaignVerificationSchema.index({ campaign: 1 });
campaignVerificationSchema.index({ verificationStatus: 1 });

const SecureTransaction = mongoose.model('SecureTransaction', transactionSchema);
const FraudPattern = mongoose.model('FraudPattern', fraudPatternSchema);
const DonorVerification = mongoose.model('DonorVerification', donorVerificationSchema);
const CampaignVerification = mongoose.model('CampaignVerification', campaignVerificationSchema);

module.exports = {
  SecureTransaction,
  FraudPattern,
  DonorVerification,
  CampaignVerification
};
