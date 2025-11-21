const express = require('express');
const Disaster = require('../models/Disaster');
const auth = require('../middleware/auth');

const router = express.Router();

// Get disasters near user location
router.get('/nearby', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    const disasters = await Disaster.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      },
      status: { $in: ['predicted', 'active'] }
    }).sort({ 'prediction.expectedTime': 1 });
    
    res.json(disasters);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Report disaster incident
router.post('/report', auth, async (req, res) => {
  try {
    const { type, location, description, images } = req.body;
    
    // Find existing disaster or create new one
    let disaster = await Disaster.findOne({
      type,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location.coordinates
          },
          $maxDistance: 5000 // 5km radius
        }
      },
      status: { $in: ['predicted', 'active'] }
    });
    
    if (!disaster) {
      disaster = new Disaster({
        type,
        location,
        severity: 'medium',
        status: 'active',
        prediction: {
          confidence: 0.8,
          predictedAt: new Date(),
          aiModel: 'user-report'
        }
      });
    }
    
    // Add user report
    disaster.reports.push({
      user: req.userId,
      description,
      images,
      location,
      reportedAt: new Date()
    });
    
    await disaster.save();
    
    // Emit real-time alert
    const io = req.app.get('io');
    io.to(`location-${location.coordinates[1]}-${location.coordinates[0]}`).emit('disaster-report', {
      disaster: disaster._id,
      type,
      location,
      severity: disaster.severity
    });
    
    res.status(201).json({ message: 'Disaster reported successfully', disaster });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get disaster details
router.get('/:id', async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id)
      .populate('reports.user', 'name')
      .populate('alerts');
    
    if (!disaster) {
      return res.status(404).json({ message: 'Disaster not found' });
    }
    
    res.json(disaster);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;