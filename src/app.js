const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ message: 'route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.message || 'server error' });
});

module.exports = app;
