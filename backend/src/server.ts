import http from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: env.CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  logger.info({ socketId: socket.id }, 'Socket connected (handshake awaiting auth).');

  socket.on('disconnect', () => {
    logger.info({ socketId: socket.id }, 'Socket disconnected.');
  });
});

const PORT = env.PORT || 4000;

server.listen(PORT, () => {
  logger.info(`🚀 CivicPulse API Server running at http://localhost:${PORT}`);
  logger.info(`📡 Socket.IO gateway ready for connections`);
});
