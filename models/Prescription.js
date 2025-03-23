const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: true,
    },
    doctor: {
      type: String,
      required: true,
    },
    prescribedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    refills: {
      total: {
        type: Number,
        default: 0,
      },
      remaining: {
        type: Number,
        default: 0,
      },
    },
    pharmacy: {
      type: String,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription; 