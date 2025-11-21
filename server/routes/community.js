const express = require('express');
const { Community, Post, Event } = require('../models/Community');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all communities
router.get('/', async (req, res) => {
  try {
    const { type, location, search, limit = 20, page = 1 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search };
    }
    
    // Location-based filtering
    if (location) {
      const [lat, lng, radius = 50] = location.split(',').map(Number);
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius * 1000
        }
      };
    }
    
    const skip = (page - 1) * limit;
    
    const communities = await Community.find(query)
      .populate('creator', 'name')
      .sort({ memberCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    res.json({
      communities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Community.countDocuments(query)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create community
router.post('/', auth, async (req, res) => {
  try {
    const communityData = {
      ...req.body,
      creator: req.userId,
      admins: [req.userId],
      members: [{
        user: req.userId,
        role: 'admin',
        joinedAt: new Date()
      }],
      memberCount: 1
    };
    
    const community = new Community(communityData);
    await community.save();
    
    // Emit real-time event
    const io = req.app.get('io');
    io.emit('community-created', {
      community: community._id,
      name: community.name,
      type: community.type
    });
    
    res.status(201).json({ message: 'Community created', community });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get community details
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('members.user', 'name email isVolunteer');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join community
router.post('/:id/join', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if already a member
    const isMember = community.members.some(m => m.user.toString() === req.userId);
    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }
    
    community.members.push({
      user: req.userId,
      role: 'member',
      joinedAt: new Date()
    });
    community.memberCount += 1;
    
    await community.save();
    
    // Real-time notification
    const io = req.app.get('io');
    io.to(`community-${community._id}`).emit('member-joined', {
      userId: req.userId,
      communityId: community._id
    });
    
    res.json({ message: 'Joined community successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get community posts
router.get('/:id/posts', async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;
    
    const query = { community: req.params.id };
    if (type) query.type = type;
    
    const skip = (page - 1) * limit;
    
    const posts = await Post.find(query)
      .populate('author', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Post.countDocuments(query)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create post
router.post('/:id/posts', auth, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      community: req.params.id,
      author: req.userId
    };
    
    const post = new Post(postData);
    await post.save();
    
    // Update community stats
    await Community.findByIdAndUpdate(req.params.id, {
      $inc: { 'stats.totalPosts': 1 }
    });
    
    // Real-time notification
    const io = req.app.get('io');
    io.to(`community-${req.params.id}`).emit('new-post', {
      post: post._id,
      author: req.userId,
      title: post.title,
      type: post.type
    });
    
    res.status(201).json({ message: 'Post created', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// React to post
router.post('/posts/:postId/react', auth, async (req, res) => {
  try {
    const { reactionType } = req.body;
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Remove existing reaction from this user
    post.reactions = post.reactions.filter(r => r.user.toString() !== req.userId);
    
    // Add new reaction
    post.reactions.push({
      user: req.userId,
      type: reactionType,
      createdAt: new Date()
    });
    
    await post.save();
    
    res.json({ message: 'Reaction added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment
router.post('/posts/:postId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.comments.push({
      user: req.userId,
      content,
      createdAt: new Date()
    });
    
    await post.save();
    
    // Real-time notification
    const io = req.app.get('io');
    io.to(`community-${post.community}`).emit('new-comment', {
      postId: post._id,
      userId: req.userId
    });
    
    res.json({ message: 'Comment added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get community events
router.get('/:id/events', async (req, res) => {
  try {
    const { upcoming = true } = req.query;
    
    const query = { community: req.params.id };
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }
    
    const events = await Event.find(query)
      .populate('organizer', 'name')
      .sort({ startDate: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create event
router.post('/:id/events', auth, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      community: req.params.id,
      organizer: req.userId
    };
    
    const event = new Event(eventData);
    await event.save();
    
    // Update community stats
    await Community.findByIdAndUpdate(req.params.id, {
      $inc: { 'stats.totalEvents': 1 }
    });
    
    // Real-time notification
    const io = req.app.get('io');
    io.to(`community-${req.params.id}`).emit('new-event', {
      event: event._id,
      title: event.title,
      startDate: event.startDate
    });
    
    res.status(201).json({ message: 'Event created', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// RSVP to event
router.post('/events/:eventId/rsvp', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Remove existing RSVP
    event.attendees = event.attendees.filter(a => a.user.toString() !== req.userId);
    
    // Add new RSVP
    event.attendees.push({
      user: req.userId,
      status,
      registeredAt: new Date()
    });
    
    await event.save();
    
    res.json({ message: 'RSVP recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
