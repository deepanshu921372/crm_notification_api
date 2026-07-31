const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

function roomFor(userId) {
  return `user:${userId}`;
}

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || '*' }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('token missing'));
    }

    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(roomFor(socket.user.id));
  });

  return io;
}

function emitToUser(userId, event, payload) {
  if (!io) {
    return;
  }

  io.to(roomFor(userId)).emit(event, payload);
}

module.exports = { initSocket, emitToUser };
