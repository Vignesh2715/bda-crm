const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

exports.getLeads = async (req, res) => {
  try {
    const { status, source, assignedTo, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const query = { isArchived: false };
    if (req.user.role === 'bda') query.assignedTo = req.user._id;
    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [leads, total] = await Promise.all([
      Lead.find(query).populate('assignedTo', 'name email avatar').sort(sort).skip(skip).limit(Number(limit)),
      Lead.countDocuments(query)
    ]);
    res.json({ success: true, leads, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email avatar role');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create({ ...req.body });
    if (lead.assignedTo) {
      await Notification.create({
        userId: lead.assignedTo,
        title: 'New Lead Assigned',
        message: `You have been assigned lead: ${lead.companyName}`,
        type: 'lead_assigned',
        relatedId: lead._id,
        relatedModel: 'Lead'
      });
    }
    await Activity.create({
      leadId: lead._id,
      activityType: 'Note',
      description: 'Lead created',
      performedBy: req.user._id
    });
    const populated = await lead.populate('assignedTo', 'name email avatar');
    res.status(201).json({ success: true, lead: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const existing = await Lead.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Lead not found' });
    const oldStatus = existing.status;
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedTo', 'name email avatar');
    if (oldStatus !== lead.status) {
      await Activity.create({
        leadId: lead._id,
        activityType: 'Status Change',
        description: `Status changed from "${oldStatus}" to "${lead.status}"`,
        performedBy: req.user._id
      });
    }
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead archived' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.assignLead = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.id, { assignedTo }, { new: true }).populate('assignedTo', 'name email avatar');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    if (assignedTo) {
      await Notification.create({
        userId: assignedTo,
        title: 'Lead Assigned to You',
        message: `Lead "${lead.companyName}" has been assigned to you`,
        type: 'lead_assigned',
        relatedId: lead._id,
        relatedModel: 'Lead'
      });
      await Activity.create({
        leadId: lead._id,
        activityType: 'Note',
        description: `Lead assigned to ${lead.assignedTo?.name}`,
        performedBy: req.user._id
      });
    }
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPipelineLeads = async (req, res) => {
  try {
    const query = { isArchived: false };
    if (req.user.role === 'bda') query.assignedTo = req.user._id;
    const leads = await Lead.find(query).populate('assignedTo', 'name avatar').sort('-updatedAt');
    const pipeline = {
      'New': [], 'Contacted': [], 'Qualified': [], 'Proposal Sent': [], 'Negotiation': [], 'Won': [], 'Lost': []
    };
    leads.forEach(l => { if (pipeline[l.status]) pipeline[l.status].push(l); });
    res.json({ success: true, pipeline });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
