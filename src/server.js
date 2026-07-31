require('dotenv').config({ quiet: true });

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const { startReminderJob } = require('./jobs/reminderJob');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const server = http.createServer(app);

  initSocket(server);
  startReminderJob();

  server.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
  });
}

start().catch((err) => {
  console.error('failed to start', err.message);
  process.exit(1);
});
