const Activity = require('../models/Activity');

exports.getActivities = async (req, res) => {
  try {
    const { leadId } = req.query;
    const query = {};
    if (leadId) query.leadId = leadId;
    const activities = await Activity.find(query).populate('performedBy', 'name avatar').sort('-createdAt');
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const activity = await Activity.create({ ...req.body, performedBy: req.user._id });
    const populated = await activity.populate('performedBy', 'name avatar');
    res.status(201).json({ success: true, activity: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('performedBy', 'name avatar');
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.json({ success: true, activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.json({ success: true, message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
