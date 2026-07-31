const Contact = require('../models/Contact');
const Assignment = require('../models/Assignment');

async function listContacts(req, res) {
  const filter = req.query.companyId ? { companyId: req.query.companyId } : {};
  const contacts = await Contact.find(filter).populate('companyId', 'name').sort({ createdAt: -1 });

  res.json(contacts);
}

async function createContact(req, res) {
  const { name, email, phone, companyId } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  const contact = await Contact.create({
    name,
    email,
    phone,
    companyId: companyId || null,
    createdBy: req.user.id
  });

  res.status(201).json(contact);
}

async function updateContact(req, res) {
  const { name, email, phone, companyId } = req.body;

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { name, email, phone, companyId },
    { new: true, runValidators: true }
  );

  if (!contact) {
    return res.status(404).json({ message: 'contact not found' });
  }

  res.json(contact);
}

async function deleteContact(req, res) {
  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    return res.status(404).json({ message: 'contact not found' });
  }

  await Assignment.deleteMany({ targetType: 'contact', targetId: contact._id });

  res.json({ message: 'contact deleted' });
}

module.exports = { listContacts, createContact, updateContact, deleteContact };
