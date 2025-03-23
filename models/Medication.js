const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      required: true,
    },
    timeOfDay: [{
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
    }],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    instructions: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication; 