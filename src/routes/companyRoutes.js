const express = require('express');
const {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', listCompanies);
router.get('/:id', getCompany);
router.post('/', requireAdmin, createCompany);
router.put('/:id', requireAdmin, updateCompany);
router.delete('/:id', requireAdmin, deleteCompany);

module.exports = router;
