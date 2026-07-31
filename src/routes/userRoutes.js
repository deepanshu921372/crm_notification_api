const express = require('express');
const { listUsers } = require('../controllers/userController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, requireAdmin, listUsers);

module.exports = router;
