const cron = require('node-cron');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const { createNotification } = require('../services/notificationService');

const REMINDER_AFTER_MINUTES = Number(process.env.REMINDER_AFTER_MINUTES || 2);

async function sendFollowUpReminders() {
  const cutoff = new Date(Date.now() - REMINDER_AFTER_MINUTES * 60 * 1000);

  const assignments = await Assignment.find({ createdAt: { $lte: cutoff } })
    .populate('targetId')
    .limit(50);

  if (assignments.length === 0) {
    return;
  }

  const alreadySent = await Notification.find({
    type: 'reminder',
    'metadata.assignmentId': { $in: assignments.map((a) => a._id) }
  }).distinct('metadata.assignmentId');

  const sentIds = new Set(alreadySent.map(String));
  const pending = assignments.filter((a) => !sentIds.has(String(a._id)));

  for (const assignment of pending) {
    if (!assignment.targetId) {
      continue;
    }

    await createNotification({
      userId: assignment.userId,
      type: 'reminder',
      title: 'Follow-up reminder',
      message: `Reminder: follow up with ${assignment.targetId.name}.`,
      link:
        assignment.targetType === 'company' ? `/companies/${assignment.targetId._id}` : '/contacts',
      metadata: { assignmentId: assignment._id }
    });
  }

  if (pending.length > 0) {
    console.log(`reminder job sent ${pending.length} notification(s)`);
  }
}

function startReminderJob() {
  cron.schedule('* * * * *', () => {
    sendFollowUpReminders().catch((err) => console.error('reminder job failed:', err.message));
  });
}

module.exports = { startReminderJob, sendFollowUpReminders };
