const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Activity = require('../models/Activity');

// Get all prescriptions for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const prescriptions = await Prescription.find({ user: userId })
      .populate('medication')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent prescriptions
router.get('/recent', async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    
    const prescriptions = await Prescription.find({ user: userId })
      .populate('medication')
      .sort({ createdAt: -1 })
      .limit(limit);
      
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single prescription by ID
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('medication');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new prescription
router.post('/', async (req, res) => {
  try {
    const prescription = new Prescription({
      ...req.body,
      user: req.user._id,
    });
    
    const savedPrescription = await prescription.save();
    
    // Create activity log
    await Activity.create({
      user: req.user._id,
      type: 'prescription_added',
      prescription: savedPrescription._id,
      medication: savedPrescription.medication,
    });
    
    res.status(201).json(savedPrescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a prescription
router.put('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Create activity log
    await Activity.create({
      user: req.user._id,
      type: 'prescription_modified',
      prescription: prescription._id,
      medication: prescription.medication,
    });
    
    res.json(prescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Record prescription refill
router.post('/:id/refill', async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Update refill count
    prescription.refills.remaining = Math.min(
      prescription.refills.total,
      prescription.refills.remaining + 1
    );
    
    await prescription.save();
    
    // Create activity log
    await Activity.create({
      user: req.user._id,
      type: 'prescription_filled',
      prescription: prescription._id,
      medication: prescription.medication,
    });
    
    res.json(prescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a prescription
router.delete('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Create activity log
    await Activity.create({
      user: req.user._id,
      type: 'prescription_deleted',
      medication: prescription.medication,
    });
    
    res.json({ message: 'Prescription deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 