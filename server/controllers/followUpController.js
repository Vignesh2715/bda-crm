const FollowUp = require('../models/FollowUp');
const Notification = require('../models/Notification');

exports.getFollowUps = async (req, res) => {
  try {
    const { leadId, status, startDate, endDate } = req.query;
    const query = {};
    if (req.user.role === 'bda') query.createdBy = req.user._id;
    if (leadId) query.leadId = leadId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }
    const followups = await FollowUp.find(query).populate('leadId', 'companyName contactPerson').populate('createdBy', 'name avatar').sort('scheduledDate');
    res.json({ success: true, followups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTodayFollowUps = async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    const query = { scheduledDate: { $gte: start, $lte: end }, status: 'Pending' };
    if (req.user.role === 'bda') query.createdBy = req.user._id;
    const followups = await FollowUp.find(query).populate('leadId', 'companyName contactPerson phone').populate('createdBy', 'name');
    res.json({ success: true, followups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createFollowUp = async (req, res) => {
  try {
    const followup = await FollowUp.create({ ...req.body, createdBy: req.user._id });
    const populated = await followup.populate([
      { path: 'leadId', select: 'companyName contactPerson' },
      { path: 'createdBy', select: 'name avatar' }
    ]);
    res.status(201).json({ success: true, followup: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFollowUp = async (req, res) => {
  try {
    if (req.body.status === 'Completed') req.body.completedAt = new Date();
    const followup = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('leadId', 'companyName contactPerson')
      .populate('createdBy', 'name avatar');
    if (!followup) return res.status(404).json({ success: false, message: 'Follow-up not found' });
    res.json({ success: true, followup });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteFollowUp = async (req, res) => {
  try {
    const followup = await FollowUp.findByIdAndDelete(req.params.id);
    if (!followup) return res.status(404).json({ success: false, message: 'Follow-up not found' });
    res.json({ success: true, message: 'Follow-up deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
