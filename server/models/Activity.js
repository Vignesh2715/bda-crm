const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  activityType: {
    type: String,
    enum: ['Phone Call', 'Email', 'Meeting', 'Product Demo', 'Proposal Sent', 'Follow-Up', 'Note', 'Status Change'],
    required: true
  },
  description: { type: String, required: true, trim: true },
  outcome: { type: String, default: '' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, default: null },
  duration: { type: Number, default: null }, // in minutes
}, { timestamps: true });

activitySchema.index({ leadId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
