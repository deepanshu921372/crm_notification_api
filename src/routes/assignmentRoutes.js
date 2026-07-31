const express = require('express');
const {
  createAssignment,
  myAssignments,
  listAssignments,
  deleteAssignment
} = require('../controllers/assignmentController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/mine', myAssignments);
router.get('/', requireAdmin, listAssignments);
router.post('/', requireAdmin, createAssignment);
router.delete('/:id', requireAdmin, deleteAssignment);

module.exports = router;
