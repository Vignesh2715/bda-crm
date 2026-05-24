const Lead = require('../models/Lead');
const User = require('../models/User');
const FollowUp = require('../models/FollowUp');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

exports.getDashboardStats = async (req, res) => {
  try {
    const isBDA = req.user.role === 'bda';
    const baseQuery = isBDA ? { assignedTo: req.user._id, isArchived: false } : { isArchived: false };
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalLeads, activeLeads, wonLeads, lostLeads,
      totalBDAs, todayFollowUps, overdueFollowUps, pendingTasks
    ] = await Promise.all([
      Lead.countDocuments(baseQuery),
      Lead.countDocuments({ ...baseQuery, status: { $in: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation'] } }),
      Lead.countDocuments({ ...baseQuery, status: 'Won' }),
      Lead.countDocuments({ ...baseQuery, status: 'Lost' }),
      isBDA ? 0 : User.countDocuments({ role: 'bda', isActive: true }),
      FollowUp.countDocuments({ ...(isBDA ? { createdBy: req.user._id } : {}), scheduledDate: { $gte: startOfToday, $lte: endOfToday }, status: 'Pending' }),
      FollowUp.countDocuments({ ...(isBDA ? { createdBy: req.user._id } : {}), scheduledDate: { $lt: startOfToday }, status: 'Pending' }),
      Task.countDocuments({ ...(isBDA ? { assignedTo: req.user._id } : {}), status: { $ne: 'Completed' } })
    ]);

    const wonLeadsData = await Lead.find({ ...baseQuery, status: 'Won' }).select('estimatedDealValue');
    const revenue = wonLeadsData.reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    // Leads by source
    const bySource = await Lead.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    // Leads by status
    const byStatus = await Lead.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Monthly conversions (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const monthlyData = await Lead.aggregate([
      { $match: { ...baseQuery, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 }, won: { $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] } }, revenue: { $sum: { $cond: [{ $eq: ['$status', 'Won'] }, '$estimatedDealValue', 0] } } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Team performance (admin/manager only)
    let teamPerformance = [];
    if (!isBDA) {
      teamPerformance = await Lead.aggregate([
        { $match: { isArchived: false, assignedTo: { $ne: null } } },
        { $group: { _id: '$assignedTo', total: { $sum: 1 }, won: { $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] } }, contacted: { $sum: { $cond: [{ $ne: ['$status', 'New'] }, 1, 0] } } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { _id: 1, name: '$user.name', avatar: '$user.avatar', total: 1, won: 1, contacted: 1, rate: { $cond: [{ $gt: ['$total', 0] }, { $multiply: [{ $divide: ['$won', '$total'] }, 100] }, 0] } } },
        { $sort: { won: -1 } },
        { $limit: 10 }
      ]);
    }

    res.json({
      success: true,
      stats: { totalLeads, activeLeads, wonLeads, lostLeads, revenue, conversionRate, totalBDAs, todayFollowUps, overdueFollowUps, pendingTasks },
      charts: { bySource, byStatus, monthlyData, teamPerformance }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
