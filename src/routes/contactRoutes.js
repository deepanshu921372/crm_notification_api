const express = require('express');
const {
  listContacts,
  createContact,
  updateContact,
  deleteContact
} = require('../controllers/contactController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', listContacts);
router.post('/', requireAdmin, createContact);
router.put('/:id', requireAdmin, updateContact);
router.delete('/:id', requireAdmin, deleteContact);

module.exports = router;
