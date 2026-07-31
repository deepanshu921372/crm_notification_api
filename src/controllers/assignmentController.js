const Assignment = require('../models/Assignment');
const Company = require('../models/Company');
const Contact = require('../models/Contact');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

const roleLabels = {
  owner: 'Account Owner',
  sales_rep: 'Sales Rep',
  support: 'Support',
  viewer: 'Viewer'
};

async function findTarget(targetType, targetId) {
  const model = targetType === 'company' ? Company : Contact;
  return model.findById(targetId);
}

async function createAssignment(req, res) {
  const { userId, targetType, targetId, role } = req.body;

  if (!userId || !targetType || !targetId) {
    return res.status(400).json({ message: 'userId, targetType and targetId are required' });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: 'user not found' });
  }

  const target = await findTarget(targetType, targetId);

  if (!target) {
    return res.status(404).json({ message: `${targetType} not found` });
  }

  const existing = await Assignment.findOne({ userId, targetType, targetId });

  if (existing) {
    return res.status(409).json({ message: 'user is already assigned to this record' });
  }

  const assignment = await Assignment.create({
    userId,
    targetType,
    targetId,
    role,
    assignedBy: req.user.id
  });

  await createNotification({
    userId,
    type: 'assignment',
    title: 'New assignment',
    message: `You have been assigned to ${target.name} as ${roleLabels[assignment.role]}.`,
    link: `/${targetType === 'company' ? 'companies' : 'contacts'}/${targetId}`,
    metadata: { assignmentId: assignment._id, targetType, targetId }
  });

  res.status(201).json(assignment);
}

async function myAssignments(req, res) {
  const assignments = await Assignment.find({ userId: req.user.id })
    .populate('targetId')
    .sort({ createdAt: -1 });

  res.json(assignments);
}

async function listAssignments(req, res) {
  const filter = req.query.targetId ? { targetId: req.query.targetId } : {};
  const assignments = await Assignment.find(filter)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  res.json(assignments);
}

async function deleteAssignment(req, res) {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);

  if (!assignment) {
    return res.status(404).json({ message: 'assignment not found' });
  }

  const target = await findTarget(assignment.targetType, assignment.targetId);

  await createNotification({
    userId: assignment.userId,
    type: 'assignment',
    title: 'Assignment removed',
    message: `You are no longer assigned to ${target ? target.name : 'a deleted record'}.`,
    metadata: { assignmentId: assignment._id }
  });

  res.json({ message: 'assignment removed' });
}

module.exports = { createAssignment, myAssignments, listAssignments, deleteAssignment };
