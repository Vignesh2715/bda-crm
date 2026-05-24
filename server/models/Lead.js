const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  industry: { type: String, default: '', trim: true },
  source: {
    type: String,
    enum: ['Website', 'LinkedIn', 'Referral', 'Trade Show', 'Cold Calling', 'Email Campaign', 'Social Media', 'Other'],
    default: 'Other'
  },
  estimatedDealValue: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'],
    default: 'New'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notes: { type: String, default: '' },
  tags: [{ type: String }],
  address: { type: String, default: '' },
  website: { type: String, default: '' },
  aiScore: { type: Number, default: null },
  aiInsights: { type: String, default: '' },
  aiLastGeneratedAt: { type: Date, default: null },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

leadSchema.index({ companyName: 'text', contactPerson: 'text', email: 'text' });
leadSchema.index({ status: 1, assignedTo: 1 });

module.exports = mongoose.model('Lead', leadSchema);
