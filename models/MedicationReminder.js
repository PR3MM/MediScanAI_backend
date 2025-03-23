const mongoose = require('mongoose');

const medicationReminderSchema = new mongoose.Schema(
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
    scheduledTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'missed', 'snoozed'],
      default: 'pending',
    },
    snoozedUntil: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
medicationReminderSchema.index({ user: 1, scheduledTime: 1 });
medicationReminderSchema.index({ medication: 1 });
medicationReminderSchema.index({ status: 1 });

const MedicationReminder = mongoose.model('MedicationReminder', medicationReminderSchema);

module.exports = MedicationReminder; 