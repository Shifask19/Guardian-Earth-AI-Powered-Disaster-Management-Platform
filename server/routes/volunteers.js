const express = require('express');
const User = require('../models/User');
const VolunteerRequest = require('../models/VolunteerRequest');
const auth = require('../middleware/auth');

const router = express.Router();

// Register as volunteer
router.post('/register', auth, async (req, res) => {
  try {
    const { skills, availability, radius } = req.body;
    
    await User.findByIdAndUpdate(req.userId, {
      isVolunteer: true,
      volunteerProfile: {
        skills,
        availability,
        radius
      }
    });
    
    res.json({ message: 'Successfully registered as volunteer' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Find nearby volunteers
router.get('/nearby', auth, async (req, res) => {
  try {
    const { lat, lng, skills, radius = 10 } = req.query;
    
    const query = {
      isVolunteer: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000
        }
      }
    };
    
    if (skills) {
      query['volunteerProfile.skills'] = { $in: skills.split(',') };
    }
    
    const volunteers = await User.find(query)
      .select('name location volunteerProfile')
      .limit(20);
    
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create volunteer request
router.post('/request', auth, async (req, res) => {
  try {
    const { type, description, location, urgency, skillsNeeded } = req.body;
    
    const request = new VolunteerRequest({
      requester: req.userId,
      type,
      description,
      location,
      urgency,
      skillsNeeded
    });
    
    await request.save();
    
    // Notify nearby volunteers
    const io = req.app.get('io');
    io.to(`location-${location.coordinates[1]}-${location.coordinates[0]}`).emit('volunteer-request', {
      request: request._id,
      type,
      urgency,
      location
    });
    
    res.status(201).json({ message: 'Volunteer request created', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get volunteer requests
router.get('/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    const requests = await VolunteerRequest.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          },
          $maxDistance: (user.volunteerProfile?.radius || 10) * 1000
        }
      },
      status: 'open'
    }).populate('requester', 'name').sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;