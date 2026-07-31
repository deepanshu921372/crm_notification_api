const User = require('../models/User');

async function listUsers(req, res) {
  const users = await User.find({ role: 'user' }).sort({ name: 1 });
  res.json(users);
}

module.exports = { listUsers };
