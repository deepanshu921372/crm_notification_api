const Company = require('../models/Company');
const Contact = require('../models/Contact');

async function listCompanies(req, res) {
  const companies = await Company.find().sort({ createdAt: -1 });
  res.json(companies);
}

async function getCompany(req, res) {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return res.status(404).json({ message: 'company not found' });
  }

  const contacts = await Contact.find({ companyId: company._id }).sort({ createdAt: -1 });

  res.json({ company, contacts });
}

async function createCompany(req, res) {
  const { name, industry, website } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  const company = await Company.create({ name, industry, website, createdBy: req.user.id });

  res.status(201).json(company);
}

async function updateCompany(req, res) {
  const { name, industry, website } = req.body;

  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { name, industry, website },
    { new: true, runValidators: true }
  );

  if (!company) {
    return res.status(404).json({ message: 'company not found' });
  }

  res.json(company);
}

async function deleteCompany(req, res) {
  const company = await Company.findByIdAndDelete(req.params.id);

  if (!company) {
    return res.status(404).json({ message: 'company not found' });
  }

  await Contact.updateMany({ companyId: company._id }, { companyId: null });

  res.json({ message: 'company deleted' });
}

module.exports = { listCompanies, getCompany, createCompany, updateCompany, deleteCompany };
