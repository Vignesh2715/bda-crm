const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  scheduledDate: { type: Date, required: true },
  purpose: { type: String, required: true, trim: true },
  remarks: { type: String, default: '' },
  outcome: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Missed', 'Rescheduled'],
    default: 'Pending'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

followUpSchema.index({ scheduledDate: 1, status: 1 });
followUpSchema.index({ leadId: 1 });
followUpSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model('FollowUp', followUpSchema);
