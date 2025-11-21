const express = require('express');
const crypto = require('crypto');
const {
  SecureTransaction,
  FraudPattern,
  DonorVerification,
  CampaignVerification
} = require('../models/SecureDonation');
const fraudDetectionService = require('../services/fraudDetectionService');
const auth = require('../middleware/auth');

const router = express.Router();

// Initiate secure donation
router.post('/initiate', auth, async (req, res) => {
  try {
    const { campaignId, amount, paymentMethod, message, isAnonymous } = req.body;
    
    // Validate amount
    if (amount < 1) {
      return res.status(400).json({ message: 'Minimum donation amount is $1' });
    }
    
    // Get user context
    const userContext = {
      userId: req.userId,
      email: req.user?.email,
      phone: req.user?.phone,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      deviceId: req.headers['x-device-id'] || crypto.randomBytes(16).toString('hex')
    };
    
    // Run fraud detection
    console.log('🔒 Running fraud detection...');
    const fraudAnalysis = await fraudDetectionService.analyzeDonation(
      { amount, campaignId, paymentMethod },
      userContext
    );
    
    // Create transaction
    const transaction = new SecureTransaction({
      donor: req.userId,
      campaign: campaignId,
      amount,
      paymentMethod,
      fraudCheck: {
        score: fraudAnalysis.fraudScore,
        riskLevel: fraudAnalysis.riskLevel,
        flags: fraudAnalysis.flags,
        checks: fraudAnalysis.checks,
        aiAnalysis: fraudAnalysis.aiAnalysis
      },
      tracking: {
        ipAddress: userContext.ipAddress,
        userAgent: userContext.userAgent,
        deviceId: userContext.deviceId,
        sessionId: req.sessionID
      },
      metadata: {
        isAnonymous,
        message
      },
      timeline: [{
        status: 'initiated',
        timestamp: new Date(),
        note: 'Donation initiated'
      }]
    });
    
    // Handle based on fraud analysis
    if (fraudAnalysis.recommendation.action === 'block') {
      transaction.status = 'flagged';
      await transaction.save();
      
      return res.status(403).json({
        success: false,
        message: 'Transaction blocked for security reasons',
        transactionId: transaction.transactionId,
        requiresReview: true
      });
    }
    
    if (fraudAnalysis.recommendation.action === 'review') {
      transaction.status = 'pending';
      await transaction.save();
      
      return res.status(202).json({
        success: false,
        message: 'Transaction requires manual review',
        transactionId: transaction.transactionId,
        requiresReview: true,
        estimatedReviewTime: '24 hours'
      });
    }
    
    if (fraudAnalysis.recommendation.action === 'verify') {
      transaction.status = 'pending';
      transaction.verification.twoFactorAuth.required = true;
      transaction.verification.emailConfirmation.required = true;
      await transaction.save();
      
      // Send verification codes
      await sendVerificationCodes(transaction, req.user);
      
      return res.json({
        success: true,
        message: 'Additional verification required',
        transactionId: transaction.transactionId,
        requiresVerification: true,
        verificationMethods: ['2fa', 'email'],
        nextStep: 'verify'
      });
    }
    
    // Auto-approve low-risk transactions
    transaction.status = 'processing';
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Donation initiated successfully',
      transactionId: transaction.transactionId,
      fraudScore: fraudAnalysis.fraudScore,
      riskLevel: fraudAnalysis.riskLevel,
      nextStep: 'payment'
    });
    
  } catch (error) {
    console.error('Error initiating donation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify transaction with 2FA
router.post('/verify/:transactionId', auth, async (req, res) => {
  try {
    const { code, method } = req.body;
    
    const transaction = await SecureTransaction.findOne({
      transactionId: req.params.transactionId,
      donor: req.userId
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Verify code
    const isValid = await verifyCode(transaction, code, method);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Update verification status
    if (method === '2fa') {
      transaction.verification.twoFactorAuth.completed = true;
      transaction.verification.twoFactorAuth.timestamp = new Date();
    } else if (method === 'email') {
      transaction.verification.emailConfirmation.confirmed = true;
    }
    
    // Check if all verifications complete
    const allVerified = 
      (!transaction.verification.twoFactorAuth.required || transaction.verification.twoFactorAuth.completed) &&
      (!transaction.verification.emailConfirmation.required || transaction.verification.emailConfirmation.confirmed);
    
    if (allVerified) {
      transaction.status = 'processing';
      transaction.timeline.push({
        status: 'verified',
        timestamp: new Date(),
        note: 'All verifications completed'
      });
    }
    
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Verification successful',
      allVerified,
      nextStep: allVerified ? 'payment' : 'verify-remaining'
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Process payment
router.post('/process/:transactionId', auth, async (req, res) => {
  try {
    const { paymentDetails } = req.body;
    
    const transaction = await SecureTransaction.findOne({
      transactionId: req.params.transactionId,
      donor: req.userId
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.status !== 'processing') {
      return res.status(400).json({ message: 'Transaction not ready for payment' });
    }
    
    // Process payment (integrate with payment gateway)
    const paymentResult = await processPayment(transaction, paymentDetails);
    
    if (paymentResult.success) {
      transaction.status = 'verified';
      transaction.paymentDetails = {
        last4: paymentDetails.last4,
        cardType: paymentDetails.cardType
      };
      
      // Record on blockchain
      if (transaction.blockchain.enabled) {
        const blockchainResult = await recordOnBlockchain(transaction);
        transaction.blockchain = {
          ...transaction.blockchain,
          ...blockchainResult
        };
      }
      
      transaction.timeline.push({
        status: 'payment-processed',
        timestamp: new Date(),
        note: 'Payment processed successfully'
      });
      
      // Update donor trust score
      await fraudDetectionService.updateDonorTrustScore(req.userId);
      
      // Generate receipt
      const receipt = await generateReceipt(transaction);
      transaction.receipt = receipt;
      
      transaction.status = 'completed';
      await transaction.save();
      
      // Real-time notification
      const io = req.app.get('io');
      io.to(`user-${req.userId}`).emit('donation-completed', {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        campaign: transaction.campaign
      });
      
      res.json({
        success: true,
        message: 'Donation completed successfully',
        transactionId: transaction.transactionId,
        receipt: receipt.url,
        blockchain: transaction.blockchain.txHash ? {
          txHash: transaction.blockchain.txHash,
          explorer: `https://etherscan.io/tx/${transaction.blockchain.txHash}`
        } : null
      });
    } else {
      transaction.status = 'failed';
      transaction.timeline.push({
        status: 'payment-failed',
        timestamp: new Date(),
        note: paymentResult.error
      });
      await transaction.save();
      
      res.status(400).json({
        success: false,
        message: 'Payment failed',
        error: paymentResult.error
      });
    }
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transaction details
router.get('/transaction/:transactionId', auth, async (req, res) => {
  try {
    const transaction = await SecureTransaction.findOne({
      transactionId: req.params.transactionId,
      donor: req.userId
    }).populate('campaign', 'title');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's donation history
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await SecureTransaction.find({
      donor: req.userId
    })
    .populate('campaign', 'title')
    .sort({ createdAt: -1 })
    .limit(50);
    
    const verification = await DonorVerification.findOne({ user: req.userId });
    
    res.json({
      transactions,
      verification: {
        trustScore: verification?.trustScore || 50,
        verificationLevel: verification?.verificationLevel || 'unverified',
        totalDonations: verification?.donationHistory.totalDonations || 0,
        totalAmount: verification?.donationHistory.totalAmount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify campaign
router.post('/verify-campaign/:campaignId', auth, async (req, res) => {
  try {
    const { documents, organizationDetails, bankDetails } = req.body;
    
    let verification = await CampaignVerification.findOne({
      campaign: req.params.campaignId
    });
    
    if (!verification) {
      verification = new CampaignVerification({
        campaign: req.params.campaignId,
        verificationStatus: 'under-review'
      });
    }
    
    if (documents) verification.documents = documents;
    if (organizationDetails) verification.organizationDetails = organizationDetails;
    if (bankDetails) verification.bankDetails = bankDetails;
    
    await verification.save();
    
    res.json({
      message: 'Campaign verification submitted',
      status: verification.verificationStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get campaign verification status
router.get('/campaign-verification/:campaignId', async (req, res) => {
  try {
    const verification = await CampaignVerification.findOne({
      campaign: req.params.campaignId
    });
    
    if (!verification) {
      return res.json({
        verified: false,
        status: 'unverified',
        message: 'Campaign not verified'
      });
    }
    
    res.json({
      verified: verification.verificationStatus === 'verified',
      status: verification.verificationStatus,
      verifiedAt: verification.verifiedAt,
      trustIndicators: verification.trustIndicators,
      compliance: verification.compliance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Review flagged transactions
router.get('/admin/flagged', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const flagged = await SecureTransaction.find({
      status: { $in: ['flagged', 'pending'] },
      'fraudCheck.riskLevel': { $in: ['high', 'critical'] }
    })
    .populate('donor', 'name email')
    .populate('campaign', 'title')
    .sort({ createdAt: -1 });
    
    res.json(flagged);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Approve/reject transaction
router.post('/admin/review/:transactionId', auth, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { action, notes } = req.body;
    
    const transaction = await SecureTransaction.findOne({
      transactionId: req.params.transactionId
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    transaction.fraudCheck.reviewedBy = req.userId;
    transaction.fraudCheck.reviewedAt = new Date();
    transaction.fraudCheck.reviewNotes = notes;
    
    if (action === 'approve') {
      transaction.status = 'processing';
      transaction.timeline.push({
        status: 'approved',
        timestamp: new Date(),
        note: `Approved by admin: ${notes}`
      });
    } else if (action === 'reject') {
      transaction.status = 'failed';
      transaction.timeline.push({
        status: 'rejected',
        timestamp: new Date(),
        note: `Rejected by admin: ${notes}`
      });
    }
    
    await transaction.save();
    
    res.json({
      message: `Transaction ${action}d successfully`,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper functions
async function sendVerificationCodes(transaction, user) {
  // Send 2FA code via SMS
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  transaction.verification.smsConfirmation = {
    sent: true,
    code: crypto.createHash('sha256').update(code).digest('hex'),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };
  
  // Send email confirmation
  const token = crypto.randomBytes(32).toString('hex');
  transaction.verification.emailConfirmation = {
    sent: true,
    token: crypto.createHash('sha256').update(token).digest('hex'),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  };
  
  await transaction.save();
  
  // TODO: Actually send SMS and email
  console.log(`📱 SMS Code: ${code}`);
  console.log(`📧 Email Token: ${token}`);
}

async function verifyCode(transaction, code, method) {
  if (method === 'sms') {
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    return transaction.verification.smsConfirmation.code === hashedCode &&
           transaction.verification.smsConfirmation.expiresAt > new Date();
  }
  
  if (method === 'email') {
    const hashedToken = crypto.createHash('sha256').update(code).digest('hex');
    return transaction.verification.emailConfirmation.token === hashedToken &&
           transaction.verification.emailConfirmation.expiresAt > new Date();
  }
  
  return false;
}

async function processPayment(transaction, paymentDetails) {
  // Integrate with payment gateway (Stripe, PayPal, etc.)
  // This is a placeholder
  return {
    success: true,
    transactionId: crypto.randomBytes(16).toString('hex')
  };
}

async function recordOnBlockchain(transaction) {
  // Record transaction on blockchain for transparency
  // This is a placeholder
  return {
    network: 'ethereum',
    txHash: '0x' + crypto.randomBytes(32).toString('hex'),
    blockNumber: Math.floor(Math.random() * 1000000),
    timestamp: new Date(),
    confirmations: 12
  };
}

async function generateReceipt(transaction) {
  const receiptNumber = `RCP-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  
  return {
    number: receiptNumber,
    url: `/receipts/${receiptNumber}.pdf`,
    generatedAt: new Date(),
    emailSent: true
  };
}

module.exports = router;
