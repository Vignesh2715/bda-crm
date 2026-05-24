const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['lead_assigned', 'followup_reminder', 'followup_overdue', 'task_assigned', 'task_due', 'general'],
    default: 'general'
  },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  relatedModel: { type: String, default: null },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
