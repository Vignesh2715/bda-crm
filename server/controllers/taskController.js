const Task = require('../models/Task');
const Notification = require('../models/Notification');

exports.getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const query = {};
    if (req.user.role === 'bda') query.assignedTo = req.user._id;
    else if (req.user.role === 'manager') {
      // managers see tasks they assigned or assigned to their team
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name avatar email')
      .populate('assignedBy', 'name avatar')
      .populate('leadId', 'companyName')
      .sort('-createdAt');
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, assignedBy: req.user._id });
    await Notification.create({
      userId: task.assignedTo,
      title: 'New Task Assigned',
      message: `You have a new task: "${task.title}"`,
      type: 'task_assigned',
      relatedId: task._id,
      relatedModel: 'Task'
    });
    const populated = await task.populate([
      { path: 'assignedTo', select: 'name avatar email' },
      { path: 'assignedBy', select: 'name avatar' }
    ]);
    res.status(201).json({ success: true, task: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    if (req.body.status === 'Completed') req.body.completedAt = new Date();
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name avatar email')
      .populate('assignedBy', 'name avatar')
      .populate('leadId', 'companyName');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
