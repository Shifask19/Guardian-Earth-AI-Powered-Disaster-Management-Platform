const express = require('express');
const Donation = require('../models/Donation');
const { Campaign } = require('../models/Donation');
const auth = require('../middleware/auth');

const router = express.Router();

// Get active campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ 
      status: 'active',
      endDate: { $gte: new Date() }
    }).sort({ createdAt: -1 });
    
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create donation
router.post('/', auth, async (req, res) => {
  try {
    const { campaignId, amount, type, items, message } = req.body;
    
    const donation = new Donation({
      donor: req.userId,
      campaign: campaignId,
      amount,
      type,
      items,
      message
    });
    
    await donation.save();
    
    // Update campaign totals
    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { 
          'raised.amount': amount || 0,
          'raised.donors': 1
        }
      });
    }
    
    res.status(201).json({ message: 'Donation recorded successfully', donation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user donations
router.get('/my-donations', auth, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.userId })
      .populate('campaign', 'title')
      .sort({ createdAt: -1 });
    
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get campaign details
router.get('/campaigns/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('disaster', 'type location severity');
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;