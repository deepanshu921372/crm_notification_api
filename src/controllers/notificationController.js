const Notification = require('../models/Notification');

async function listNotifications(req, res) {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const page = Math.max(Number(req.query.page) || 1, 1);

  const filter = { userId: req.user.id };

  if (req.query.type) {
    filter.type = req.query.type;
  }

  const [items, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(filter)
  ]);

  res.json({ items, total, page, hasMore: page * limit < total });
}

async function unreadCount(req, res) {
  const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
  res.json({ count });
}

async function markRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ message: 'notification not found' });
  }

  res.json(notification);
}

async function markAllRead(req, res) {
  const result = await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true }
  );

  res.json({ updated: result.modifiedCount });
}

module.exports = { listNotifications, unreadCount, markRead, markAllRead };
