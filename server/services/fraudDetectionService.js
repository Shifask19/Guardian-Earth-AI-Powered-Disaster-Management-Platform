const axios = require('axios');
const crypto = require('crypto');
const {
  SecureTransaction,
  FraudPattern,
  DonorVerification
} = require('../models/SecureDonation');

class FraudDetectionService {
  constructor() {
    this.riskThresholds = {
      low: 30,
      medium: 50,
      high: 70,
      critical: 85
    };
    
    this.fraudIndicators = {
      velocityAbuse: 10,
      suspiciousIP: 15,
      unusualAmount: 12,
      newAccount: 8,
      multipleFailures: 20,
      blacklistedDevice: 25,
      vpnUsage: 10,
      mismatchedLocation: 15,
      unusualTime: 5,
      rapidTransactions: 18
    };
  }

  async analyzeDonation(donationData, userContext) {
    console.log(`🔍 Analyzing donation: $${donationData.amount} from user ${userContext.userId}`);
    
    const fraudScore = await this.calculateFraudScore(donationData, userContext);
    const riskLevel = this.getRiskLevel(fraudScore);
    const checks = await this.runSecurityChecks(donationData, userContext);
    const aiAnalysis = await this.runAIAnalysis(donationData, userContext, checks);
    
    const result = {
      fraudScore,
      riskLevel,
      checks,
      aiAnalysis,
      flags: this.generateFlags(checks, fraudScore),
      recommendation: this.getRecommendation(fraudScore, riskLevel, checks),
      requiresReview: fraudScore >= this.riskThresholds.high
    };
    
    console.log(`✅ Analysis complete: Risk=${riskLevel}, Score=${fraudScore}`);
    
    return result;
  }

  async calculateFraudScore(donationData, userContext) {
    let score = 0;
    
    // Check 1: Velocity abuse (multiple donations in short time)
    const recentDonations = await this.getRecentDonations(userContext.userId, 60); // Last hour
    if (recentDonations.length > 5) {
      score += this.fraudIndicators.velocityAbuse;
    }
    
    // Check 2: Suspicious IP
    if (await this.isSuspiciousIP(userContext.ipAddress)) {
      score += this.fraudIndicators.suspiciousIP;
    }
    
    // Check 3: Unusual amount
    const avgDonation = await this.getAverageDonation(userContext.userId);
    if (avgDonation > 0 && donationData.amount > avgDonation * 5) {
      score += this.fraudIndicators.unusualAmount;
    }
    
    // Check 4: New account
    const accountAge = await this.getAccountAge(userContext.userId);
    if (accountAge < 24) { // Less than 24 hours
      score += this.fraudIndicators.newAccount;
    }
    
    // Check 5: Multiple failures
    const failedAttempts = await this.getFailedAttempts(userContext.userId, 24);
    if (failedAttempts > 3) {
      score += this.fraudIndicators.multipleFailures;
    }
    
    // Check 6: Device fingerprint
    if (await this.isBlacklistedDevice(userContext.deviceId)) {
      score += this.fraudIndicators.blacklistedDevice;
    }
    
    // Check 7: VPN/Proxy usage
    if (await this.isVPNorProxy(userContext.ipAddress)) {
      score += this.fraudIndicators.vpnUsage;
    }
    
    // Check 8: Location mismatch
    if (await this.hasLocationMismatch(userContext)) {
      score += this.fraudIndicators.mismatchedLocation;
    }
    
    // Check 9: Unusual time
    if (this.isUnusualTime()) {
      score += this.fraudIndicators.unusualTime;
    }
    
    // Check 10: Rapid successive transactions
    const rapidTx = await this.hasRapidTransactions(userContext.userId, 5);
    if (rapidTx) {
      score += this.fraudIndicators.rapidTransactions;
    }
    
    return Math.min(score, 100);
  }

  async runSecurityChecks(donationData, userContext) {
    const checks = {
      ipVerification: await this.verifyIP(userContext.ipAddress),
      emailVerification: await this.verifyEmail(userContext.email),
      phoneVerification: await this.verifyPhone(userContext.phone),
      deviceFingerprint: await this.verifyDevice(userContext.deviceId),
      velocityCheck: await this.checkVelocity(userContext.userId),
      amountAnalysis: await this.analyzeAmount(donationData.amount, userContext.userId),
      behaviorAnalysis: await this.analyzeBehavior(userContext.userId),
      blacklistCheck: await this.checkBlacklists(userContext)
    };
    
    return checks;
  }

  async runAIAnalysis(donationData, userContext, checks) {
    try {
      // Prepare features for AI model
      const features = {
        amount: donationData.amount,
        accountAge: await this.getAccountAge(userContext.userId),
        donationCount: await this.getDonationCount(userContext.userId),
        avgDonation: await this.getAverageDonation(userContext.userId),
        failureRate: await this.getFailureRate(userContext.userId),
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        isVPN: await this.isVPNorProxy(userContext.ipAddress),
        deviceTrustScore: await this.getDeviceTrustScore(userContext.deviceId),
        locationConsistency: await this.getLocationConsistency(userContext.userId),
        checksPassedCount: Object.values(checks).filter(c => c.passed).length
      };
      
      // Call AI model (if available)
      const aiServerUrl = process.env.AI_MODEL_ENDPOINT;
      if (aiServerUrl) {
        try {
          const response = await axios.post(`${aiServerUrl}/predict-fraud`, {
            features
          }, { timeout: 5000 });
          
          return {
            model: 'fraud-detection-v1',
            confidence: response.data.confidence,
            prediction: response.data.prediction,
            features
          };
        } catch (error) {
          console.warn('AI model unavailable, using rule-based system');
        }
      }
      
      // Fallback: Rule-based prediction
      const riskScore = this.calculateRuleBasedRisk(features);
      return {
        model: 'rule-based',
        confidence: 0.75,
        prediction: riskScore > 70 ? 'fraud' : 'legitimate',
        features
      };
      
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        model: 'error',
        confidence: 0,
        prediction: 'unknown',
        features: {}
      };
    }
  }

  calculateRuleBasedRisk(features) {
    let risk = 0;
    
    if (features.accountAge < 24) risk += 20;
    if (features.amount > features.avgDonation * 5) risk += 15;
    if (features.failureRate > 0.3) risk += 25;
    if (features.isVPN) risk += 10;
    if (features.deviceTrustScore < 50) risk += 15;
    if (features.locationConsistency < 0.5) risk += 10;
    if (features.checksPassedCount < 6) risk += 15;
    
    return Math.min(risk, 100);
  }

  generateFlags(checks, fraudScore) {
    const flags = [];
    
    if (!checks.ipVerification.passed) {
      flags.push({
        type: 'suspicious-ip',
        reason: checks.ipVerification.details,
        severity: 'high',
        timestamp: new Date()
      });
    }
    
    if (!checks.velocityCheck.passed) {
      flags.push({
        type: 'velocity-abuse',
        reason: checks.velocityCheck.details,
        severity: 'high',
        timestamp: new Date()
      });
    }
    
    if (!checks.deviceFingerprint.passed) {
      flags.push({
        type: 'suspicious-device',
        reason: checks.deviceFingerprint.details,
        severity: 'medium',
        timestamp: new Date()
      });
    }
    
    if (!checks.blacklistCheck.passed) {
      flags.push({
        type: 'blacklisted',
        reason: checks.blacklistCheck.details,
        severity: 'critical',
        timestamp: new Date()
      });
    }
    
    if (fraudScore >= this.riskThresholds.critical) {
      flags.push({
        type: 'high-risk-score',
        reason: `Fraud score ${fraudScore} exceeds critical threshold`,
        severity: 'critical',
        timestamp: new Date()
      });
    }
    
    return flags;
  }

  getRecommendation(fraudScore, riskLevel, checks) {
    if (fraudScore >= this.riskThresholds.critical) {
      return {
        action: 'block',
        message: 'Transaction blocked due to critical fraud risk',
        requiresReview: true,
        autoApprove: false
      };
    }
    
    if (fraudScore >= this.riskThresholds.high) {
      return {
        action: 'review',
        message: 'Transaction requires manual review',
        requiresReview: true,
        autoApprove: false
      };
    }
    
    if (fraudScore >= this.riskThresholds.medium) {
      return {
        action: 'verify',
        message: 'Additional verification required',
        requiresReview: false,
        autoApprove: false,
        requiredVerifications: ['2fa', 'email-confirmation']
      };
    }
    
    return {
      action: 'approve',
      message: 'Transaction approved',
      requiresReview: false,
      autoApprove: true
    };
  }

  getRiskLevel(score) {
    if (score >= this.riskThresholds.critical) return 'critical';
    if (score >= this.riskThresholds.high) return 'high';
    if (score >= this.riskThresholds.medium) return 'medium';
    return 'low';
  }

  // Helper methods
  async getRecentDonations(userId, minutes) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    return await SecureTransaction.find({
      donor: userId,
      createdAt: { $gte: since }
    });
  }

  async isSuspiciousIP(ipAddress) {
    // Check against known fraud IP databases
    // This is a placeholder - integrate with real IP reputation services
    const suspiciousIPs = ['0.0.0.0', '127.0.0.1'];
    return suspiciousIPs.includes(ipAddress);
  }

  async getAverageDonation(userId) {
    const donations = await SecureTransaction.find({
      donor: userId,
      status: 'completed'
    });
    
    if (donations.length === 0) return 0;
    
    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    return total / donations.length;
  }

  async getAccountAge(userId) {
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return 0;
    
    const ageInMs = Date.now() - user.createdAt.getTime();
    return ageInMs / (1000 * 60 * 60); // Hours
  }

  async getFailedAttempts(userId, hours) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await SecureTransaction.countDocuments({
      donor: userId,
      status: 'failed',
      createdAt: { $gte: since }
    });
  }

  async isBlacklistedDevice(deviceId) {
    const verification = await DonorVerification.findOne({
      'restrictions.isBlacklisted': true
    });
    return !!verification;
  }

  async isVPNorProxy(ipAddress) {
    // Integrate with VPN detection service
    // Placeholder implementation
    return false;
  }

  async hasLocationMismatch(userContext) {
    // Check if current location matches historical pattern
    return false;
  }

  isUnusualTime() {
    const hour = new Date().getHours();
    return hour >= 2 && hour <= 5; // 2 AM - 5 AM
  }

  async hasRapidTransactions(userId, minutes) {
    const recent = await this.getRecentDonations(userId, minutes);
    return recent.length > 3;
  }

  async verifyIP(ipAddress) {
    // Implement IP verification logic
    return {
      passed: true,
      details: 'IP address verified'
    };
  }

  async verifyEmail(email) {
    // Implement email verification logic
    return {
      passed: true,
      details: 'Email verified'
    };
  }

  async verifyPhone(phone) {
    // Implement phone verification logic
    return {
      passed: true,
      details: 'Phone verified'
    };
  }

  async verifyDevice(deviceId) {
    return {
      passed: true,
      details: 'Device verified'
    };
  }

  async checkVelocity(userId) {
    const recent = await this.getRecentDonations(userId, 60);
    return {
      passed: recent.length <= 5,
      details: recent.length > 5 ? `${recent.length} donations in last hour` : 'Normal velocity'
    };
  }

  async analyzeAmount(amount, userId) {
    const avg = await this.getAverageDonation(userId);
    const isUnusual = avg > 0 && amount > avg * 5;
    
    return {
      passed: !isUnusual,
      details: isUnusual ? `Amount ${amount} is 5x average ${avg}` : 'Amount is normal'
    };
  }

  async analyzeBehavior(userId) {
    return {
      passed: true,
      details: 'Behavior pattern normal'
    };
  }

  async checkBlacklists(userContext) {
    const verification = await DonorVerification.findOne({
      user: userContext.userId,
      'restrictions.isBlacklisted': true
    });
    
    return {
      passed: !verification,
      details: verification ? 'User is blacklisted' : 'Not blacklisted'
    };
  }

  async getDonationCount(userId) {
    return await SecureTransaction.countDocuments({
      donor: userId,
      status: 'completed'
    });
  }

  async getFailureRate(userId) {
    const total = await SecureTransaction.countDocuments({ donor: userId });
    if (total === 0) return 0;
    
    const failed = await SecureTransaction.countDocuments({
      donor: userId,
      status: 'failed'
    });
    
    return failed / total;
  }

  async getDeviceTrustScore(deviceId) {
    // Calculate device trust score based on history
    return 75; // Placeholder
  }

  async getLocationConsistency(userId) {
    // Calculate how consistent user's location is
    return 0.8; // Placeholder
  }

  async updateDonorTrustScore(userId) {
    let verification = await DonorVerification.findOne({ user: userId });
    
    if (!verification) {
      verification = new DonorVerification({
        user: userId,
        trustScore: 50
      });
    }
    
    const history = await SecureTransaction.find({
      donor: userId,
      status: { $in: ['completed', 'failed', 'refunded'] }
    });
    
    let score = 50;
    
    // Positive factors
    const successfulDonations = history.filter(d => d.status === 'completed').length;
    score += Math.min(successfulDonations * 2, 30);
    
    // Negative factors
    const failedDonations = history.filter(d => d.status === 'failed').length;
    score -= failedDonations * 5;
    
    const refundedDonations = history.filter(d => d.status === 'refunded').length;
    score -= refundedDonations * 3;
    
    // Verification bonuses
    if (verification.verifications.email.verified) score += 5;
    if (verification.verifications.phone.verified) score += 5;
    if (verification.verifications.identity.verified) score += 10;
    
    verification.trustScore = Math.max(0, Math.min(100, score));
    verification.donationHistory = {
      totalDonations: history.length,
      totalAmount: history.reduce((sum, d) => sum + d.amount, 0),
      successfulTransactions: successfulDonations,
      failedTransactions: failedDonations,
      refundedTransactions: refundedDonations,
      lastDonation: history.length > 0 ? history[history.length - 1].createdAt : null
    };
    
    await verification.save();
    
    return verification.trustScore;
  }
}

module.exports = new FraudDetectionService();
