const express = require('express');
const router = express.Router();
const MedicationReminder = require('../models/MedicationReminder');
const Activity = require('../models/Activity');

// Get all reminders for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const reminders = await MedicationReminder.find({ user: userId })
      .populate('medication')
      .sort({ scheduledTime: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming reminders for today
router.get('/today', async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const reminders = await MedicationReminder.find({
      user: userId,
      scheduledTime: { $gte: today, $lt: tomorrow },
      status: { $in: ['pending', 'snoozed'] }
    })
      .populate('medication')
      .sort({ scheduledTime: 1 });
      
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single reminder by ID
router.get('/:id', async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('medication');
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new reminder
router.post('/', async (req, res) => {
  try {
    const reminder = new MedicationReminder({
      ...req.body,
      user: req.user._id,
    });
    
    const savedReminder = await reminder.save();
    
    // Create activity log
    await Activity.create({
      user: req.user._id,
      type: 'reminder_created',
      medication: savedReminder.medication,
    });
    
    res.status(201).json(savedReminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark reminder as completed
router.put('/:id/complete', async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    reminder.status = 'completed';
    reminder.completedAt = new Date();
    
    await reminder.save();
    
    // Create activity log
    await Activity.create({
      user: req.user._id,
      type: 'medication_taken',
      medication: reminder.medication,
    });
    
    res.json(reminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark reminder as missed
router.put('/:id/miss', async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    reminder.status = 'missed';
    
    await reminder.save();
    
    // Create activity log
    await Activity.create({
      user: req.user._id,
      type: 'medication_skipped',
      medication: reminder.medication,
    });
    
    res.json(reminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Snooze a reminder
router.put('/:id/snooze', async (req, res) => {
  try {
    const { snoozeDuration } = req.body; // Duration in minutes
    
    if (!snoozeDuration) {
      return res.status(400).json({ message: 'Snooze duration is required' });
    }
    
    const reminder = await MedicationReminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    const snoozedUntil = new Date();
    snoozedUntil.setMinutes(snoozedUntil.getMinutes() + snoozeDuration);
    
    reminder.status = 'snoozed';
    reminder.snoozedUntil = snoozedUntil;
    
    await reminder.save();
    
    res.json(reminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 