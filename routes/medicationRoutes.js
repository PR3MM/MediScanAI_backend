const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const Activity = require('../models/Activity');

// Get all medications for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id; // Assuming authentication middleware sets req.user
    const medications = await Medication.find({ user: userId });
    res.json(medications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single medication by ID
router.get('/:id', async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    res.json(medication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new medication
router.post('/', async (req, res) => {
  try {
    const medication = new Medication({
      ...req.body,
      user: req.user._id,
    });
    
    const savedMedication = await medication.save();
    
    // Create activity log
    await Activity.create({
      user: req.user._id,
      type: 'medication_added',
      medication: savedMedication._id,
      details: { name: savedMedication.name },
    });
    
    res.status(201).json(savedMedication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a medication
router.put('/:id', async (req, res) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Create activity log
    await Activity.create({
      user: req.user._id,
      type: 'medication_modified',
      medication: medication._id,
      details: { name: medication.name },
    });
    
    res.json(medication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a medication
router.delete('/:id', async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Create activity log
    await Activity.create({
      user: req.user._id,
      type: 'medication_deleted',
      details: { name: medication.name },
    });
    
    res.json({ message: 'Medication deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 