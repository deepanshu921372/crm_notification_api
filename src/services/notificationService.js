const Notification = require('../models/Notification');
const { emitToUser } = require('../socket');

async function createNotification({ userId, type, title, message, link, metadata }) {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    link,
    metadata
  });

  emitToUser(userId, 'notification:new', notification);

  return notification;
}

module.exports = { createNotification };
