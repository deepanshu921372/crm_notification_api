require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Company = require('./models/Company');
const Contact = require('./models/Contact');
const Assignment = require('./models/Assignment');
const Notification = require('./models/Notification');

const PASSWORD = 'password123';

const people = [
  { name: 'Rohit Admin', email: 'admin@crm.test', role: 'admin' },
  { name: 'Alice Verma', email: 'alice@crm.test', role: 'user' },
  { name: 'Bob Khanna', email: 'bob@crm.test', role: 'user' },
  { name: 'Carol Nair', email: 'carol@crm.test', role: 'user' }
];

const companyData = [
  { name: 'Acme Corp', industry: 'SaaS', website: 'https://acme.test' },
  { name: 'Bluewave Logistics', industry: 'Logistics', website: 'https://bluewave.test' },
  { name: 'Nimbus Health', industry: 'Healthcare', website: 'https://nimbus.test' }
];

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Company.deleteMany({}),
    Contact.deleteMany({}),
    Assignment.deleteMany({}),
    Notification.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const users = await User.create(people.map((p) => ({ ...p, passwordHash })));
  const admin = users.find((u) => u.role === 'admin');

  const companies = await Company.create(
    companyData.map((c) => ({ ...c, createdBy: admin._id }))
  );

  await Contact.create([
    { name: 'Priya Sharma', email: 'priya@acme.test', phone: '9810011111', companyId: companies[0]._id, createdBy: admin._id },
    { name: 'Imran Sheikh', email: 'imran@acme.test', phone: '9810022222', companyId: companies[0]._id, createdBy: admin._id },
    { name: 'Neha Gupta', email: 'neha@bluewave.test', phone: '9810033333', companyId: companies[1]._id, createdBy: admin._id },
    { name: 'Sameer Rao', email: 'sameer@lead.test', phone: '9810044444', createdBy: admin._id }
  ]);

  console.log('seeded');
  console.table(users.map((u) => ({ email: u.email, role: u.role, password: PASSWORD })));

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('seed failed:', err.message);
  process.exit(1);
});
