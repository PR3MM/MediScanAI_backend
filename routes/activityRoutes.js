const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Get all activities for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const activities = await Activity.find({ user: userId })
      .populate('medication')
      .populate('prescription')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Activity.countDocuments({ user: userId });
    
    res.json({
      activities,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent activities for a user
router.get('/recent', async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    
    const activities = await Activity.find({ user: userId })
      .populate('medication')
      .populate('prescription')
      .sort({ timestamp: -1 })
      .limit(limit);
      
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activities filtered by type
router.get('/by-type/:type', async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const activities = await Activity.find({ 
      user: userId,
      type
    })
      .populate('medication')
      .populate('prescription')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Activity.countDocuments({ 
      user: userId,
      type
    });
    
    res.json({
      activities,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activities related to a specific medication
router.get('/by-medication/:medicationId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { medicationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const activities = await Activity.find({ 
      user: userId,
      medication: medicationId
    })
      .populate('medication')
      .populate('prescription')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Activity.countDocuments({ 
      user: userId,
      medication: medicationId
    });
    
    res.json({
      activities,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 