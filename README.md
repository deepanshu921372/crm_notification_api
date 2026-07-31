# crm_notification_api

Backend for a small CRM where an admin assigns companies and contacts to users, and the assigned user gets a live in-app notification through Socket.IO. Notifications are stored in MongoDB, and a background cron job creates follow-up reminders on its own.

Frontend repo: https://github.com/deepanshu921372/crm_notification_web

## Stack

Node.js, Express 5, MongoDB Atlas (Mongoose), Socket.IO, node-cron, JWT.

## Setup

```bash
git clone https://github.com/deepanshu921372/crm_notification_api.git
cd crm_notification_api
npm install
cp .env.example .env
npm run seed
npm run dev
```

Fill `.env` before starting:

| Key | What it is |
|---|---|
| `PORT` | Server port, defaults to 5000 |
| `MONGO_URI` | Atlas connection string, include the database name |
| `JWT_SECRET` | Any long random string |
| `CLIENT_URL` | Frontend origin, used by both Express CORS and Socket.IO CORS |
| `REMINDER_AFTER_MINUTES` | How old an assignment must be before the reminder job picks it up. Kept at 2 for the demo, would be 1440 in production |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Test accounts

`npm run seed` wipes the database and inserts these. Password for all of them is `password123`.

| Email | Role |
|---|---|
| admin@crm.test | admin |
| alice@crm.test | user |
| bob@crm.test | user |
| carol@crm.test | user |

It also creates 3 companies and 4 contacts, but no assignments, so the live notification can be demoed from a clean state.

## API

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/companies
GET    /api/companies/:id          returns the company and its contacts
POST   /api/companies              admin
PUT    /api/companies/:id          admin
DELETE /api/companies/:id          admin

GET    /api/contacts               optional ?companyId=
POST   /api/contacts               admin
PUT    /api/contacts/:id           admin
DELETE /api/contacts/:id           admin

GET    /api/users                  admin, list of assignable users

GET    /api/assignments            admin, optional ?targetId=
GET    /api/assignments/mine
POST   /api/assignments            admin, sends a notification
DELETE /api/assignments/:id        admin, sends a notification

GET    /api/notifications          ?page= &limit= &type=
GET    /api/notifications/unread-count
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
```

## Structure

```
src/
  config/db.js                mongoose connection
  models/                     User, Company, Contact, Assignment, Notification
  middleware/auth.js          protect and requireAdmin
  controllers/                request handling
  routes/                     route to controller wiring
  services/                   notificationService, saves and pushes
  socket/index.js             socket.io setup and per-user rooms
  jobs/reminderJob.js         node-cron follow-up reminders
  seed.js                     demo data
  app.js                      express app and middleware
  server.js                   http server, socket, cron, startup
```

`app.js` only exports the Express app. `server.js` wraps it in an `http.Server` because Socket.IO needs the raw server. The database connects before the server starts listening, so requests never hit a dead database.

## How the live notification works

On login the client opens a socket and sends its JWT in the handshake. A Socket.IO middleware verifies that token and rejects the connection if it is missing or invalid, so an unauthenticated socket never gets past the handshake. Once verified, the socket joins a room named `user:<id>`.

When an assignment is created the server saves the assignment, saves the notification, and only then emits `notification:new` to that one room. Because the emit targets a room instead of every connected client, no other user's browser ever receives the payload, and every tab the same user has open joins the same room and updates together.

The socket is only a delivery shortcut. Notifications are written to MongoDB first, so a user who is offline still sees them on the next page load.

## How the background job works

`node-cron` runs inside the same Express process, once a minute. It looks for assignments older than `REMINDER_AFTER_MINUTES` and creates a `reminder` notification for each one. Those go through the same service as assignment notifications, so they are pushed live too without any socket code in the job.

The job stays idempotent by asking, in a single query, which of those assignment ids already have a reminder notification, and skipping them. There is no separate flag on the assignment that could fall out of sync. Each run is capped at 50 assignments so a backlog cannot block the event loop.

`GET /health` exists so a free-tier host can be pinged and kept awake, otherwise the service sleeps and the cron job stops running.

## Tradeoffs

- **node-cron over BullMQ.** No extra infrastructure and it deploys with the app. It runs in-process though, so two instances would run the job twice. At that point I would move to BullMQ with Redis for a shared queue, retries and job visibility.
- **In-memory socket rooms.** Fine for one instance. Across multiple instances an emit on one process would not reach a socket connected to another, which is what `@socket.io/redis-adapter` solves.
- **JWT in localStorage on the client.** Simple, and the same token works for both REST and the socket handshake. It is readable by JavaScript, so an XSS bug would expose it. httpOnly cookies with a refresh token would be the production choice.
- **Polymorphic assignments.** One collection handles both companies and contacts, so queries are not duplicated per target type. MongoDB gives no referential integrity here, so deleting a company or contact also deletes its assignments in the controller.
