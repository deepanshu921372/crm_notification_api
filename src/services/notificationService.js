const Notification = require('../models/Notification');

async function createNotification({ userId, type, title, message, link, metadata }) {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    link,
    metadata
  });

  return notification;
}

module.exports = { createNotification };
