const express = require('express');
const {
  PreparednessChecklist,
  Training,
  Drill,
  EmergencyContact,
  Resource
} = require('../models/Preparedness');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's preparedness checklist
router.get('/checklist', auth, async (req, res) => {
  try {
    let checklists = await PreparednessChecklist.find({ user: req.userId });
    
    // If no checklists exist, create default ones
    if (checklists.length === 0) {
      checklists = await createDefaultChecklists(req.userId);
    }
    
    res.json(checklists);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update checklist item
router.put('/checklist/:id/items/:itemIndex', auth, async (req, res) => {
  try {
    const { isCompleted, notes } = req.body;
    const checklist = await PreparednessChecklist.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    const item = checklist.items[req.params.itemIndex];
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    item.isCompleted = isCompleted;
    if (notes) item.notes = notes;
    if (isCompleted) item.completedAt = new Date();
    
    // Calculate progress
    const completedItems = checklist.items.filter(i => i.isCompleted).length;
    checklist.overallProgress = Math.round((completedItems / checklist.items.length) * 100);
    checklist.lastUpdated = new Date();
    
    await checklist.save();
    
    // Real-time update
    const io = req.app.get('io');
    io.to(`user-${req.userId}`).emit('preparedness-updated', {
      category: checklist.category,
      progress: checklist.overallProgress
    });
    
    res.json({ message: 'Checklist updated', checklist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all training modules
router.get('/training', async (req, res) => {
  try {
    const { category, difficulty, language = 'en' } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (language) query.language = language;
    
    const trainings = await Training.find(query).sort({ createdAt: -1 });
    
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get training details
router.get('/training/:id', async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    
    if (!training) {
      return res.status(404).json({ message: 'Training not found' });
    }
    
    res.json(training);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete training
router.post('/training/:id/complete', auth, async (req, res) => {
  try {
    const { score, timeSpent } = req.body;
    const training = await Training.findById(req.params.id);
    
    if (!training) {
      return res.status(404).json({ message: 'Training not found' });
    }
    
    // Check if already completed
    const existingCompletion = training.completedBy.find(
      c => c.user.toString() === req.userId
    );
    
    if (!existingCompletion) {
      training.completedBy.push({
        user: req.userId,
        completedAt: new Date(),
        score,
        timeSpent
      });
      
      await training.save();
    }
    
    res.json({ message: 'Training completed', training });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's drills
router.get('/drills', auth, async (req, res) => {
  try {
    const drills = await Drill.find({ user: req.userId }).sort({ scheduledDate: -1 });
    
    res.json(drills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Schedule drill
router.post('/drills', auth, async (req, res) => {
  try {
    const drillData = {
      ...req.body,
      user: req.userId
    };
    
    const drill = new Drill(drillData);
    await drill.save();
    
    res.status(201).json({ message: 'Drill scheduled', drill });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete drill
router.put('/drills/:id/complete', auth, async (req, res) => {
  try {
    const { duration, participants, results } = req.body;
    
    const drill = await Drill.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!drill) {
      return res.status(404).json({ message: 'Drill not found' });
    }
    
    drill.isCompleted = true;
    drill.completedAt = new Date();
    drill.duration = duration;
    drill.participants = participants;
    drill.results = results;
    
    await drill.save();
    
    res.json({ message: 'Drill completed', drill });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get emergency contacts
router.get('/contacts', auth, async (req, res) => {
  try {
    let contacts = await EmergencyContact.findOne({ user: req.userId });
    
    if (!contacts) {
      contacts = new EmergencyContact({
        user: req.userId,
        contacts: [],
        meetingPoints: []
      });
      await contacts.save();
    }
    
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update emergency contacts
router.put('/contacts', auth, async (req, res) => {
  try {
    const { contacts, meetingPoints, outOfAreaContact } = req.body;
    
    let emergencyContacts = await EmergencyContact.findOne({ user: req.userId });
    
    if (!emergencyContacts) {
      emergencyContacts = new EmergencyContact({ user: req.userId });
    }
    
    if (contacts) emergencyContacts.contacts = contacts;
    if (meetingPoints) emergencyContacts.meetingPoints = meetingPoints;
    if (outOfAreaContact) emergencyContacts.outOfAreaContact = outOfAreaContact;
    
    await emergencyContacts.save();
    
    res.json({ message: 'Emergency contacts updated', emergencyContacts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get resources
router.get('/resources', async (req, res) => {
  try {
    const { category, disasterType, language = 'en' } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (disasterType) query.disasterType = disasterType;
    if (language) query.language = language;
    
    const resources = await Resource.find(query).sort({ isOfficial: -1, createdAt: -1 });
    
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download resource
router.get('/resources/:id/download', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    resource.downloadCount += 1;
    await resource.save();
    
    res.json({ downloadUrl: resource.content.fileUrl || resource.content.externalUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to create default checklists
async function createDefaultChecklists(userId) {
  const defaultChecklists = [
    {
      user: userId,
      category: 'emergency-kit',
      items: [
        { name: 'Water (1 gallon per person per day for 3 days)', priority: 'critical' },
        { name: 'Non-perishable food (3-day supply)', priority: 'critical' },
        { name: 'Battery-powered or hand crank radio', priority: 'high' },
        { name: 'Flashlight and extra batteries', priority: 'high' },
        { name: 'First aid kit', priority: 'critical' },
        { name: 'Whistle (to signal for help)', priority: 'medium' },
        { name: 'Dust mask or cotton t-shirt', priority: 'medium' },
        { name: 'Plastic sheeting and duct tape', priority: 'medium' },
        { name: 'Moist towelettes, garbage bags', priority: 'medium' },
        { name: 'Wrench or pliers (to turn off utilities)', priority: 'high' },
        { name: 'Manual can opener', priority: 'high' },
        { name: 'Local maps', priority: 'medium' },
        { name: 'Cell phone with chargers and backup battery', priority: 'critical' }
      ]
    },
    {
      user: userId,
      category: 'family-plan',
      items: [
        { name: 'Create family communication plan', priority: 'critical' },
        { name: 'Identify meeting places', priority: 'critical' },
        { name: 'Choose out-of-area contact person', priority: 'high' },
        { name: 'Plan evacuation routes', priority: 'high' },
        { name: 'Practice evacuation drills', priority: 'high' },
        { name: 'Know how to turn off utilities', priority: 'high' },
        { name: 'Plan for pets', priority: 'medium' },
        { name: 'Update emergency contacts annually', priority: 'medium' }
      ]
    },
    {
      user: userId,
      category: 'home-safety',
      items: [
        { name: 'Install smoke alarms on every level', priority: 'critical' },
        { name: 'Test smoke alarms monthly', priority: 'high' },
        { name: 'Install carbon monoxide detectors', priority: 'critical' },
        { name: 'Keep fire extinguisher accessible', priority: 'high' },
        { name: 'Secure heavy furniture to walls', priority: 'high' },
        { name: 'Know location of utility shut-offs', priority: 'high' },
        { name: 'Clear debris from gutters', priority: 'medium' },
        { name: 'Trim trees near house', priority: 'medium' }
      ]
    },
    {
      user: userId,
      category: 'documents',
      items: [
        { name: 'Copy of insurance policies', priority: 'critical' },
        { name: 'Identification documents', priority: 'critical' },
        { name: 'Bank account records', priority: 'high' },
        { name: 'Medical records and prescriptions', priority: 'critical' },
        { name: 'Proof of address', priority: 'high' },
        { name: 'Deed/lease to home', priority: 'high' },
        { name: 'Passports and birth certificates', priority: 'critical' },
        { name: 'Store in waterproof container', priority: 'high' }
      ]
    }
  ];
  
  const checklists = await PreparednessChecklist.insertMany(defaultChecklists);
  return checklists;
}

module.exports = router;
