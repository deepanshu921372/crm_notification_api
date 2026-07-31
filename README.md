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
npm run dev
```

Fill `.env` before starting:

| Key | What it is |
|---|---|
| `PORT` | Server port, defaults to 5000 |
| `MONGO_URI` | Atlas connection string, include the database name |
| `JWT_SECRET` | Any long random string |
| `CLIENT_URL` | Frontend origin, used by both Express CORS and Socket.IO CORS |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
