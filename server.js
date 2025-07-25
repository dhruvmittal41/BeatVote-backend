// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: 'https://beat-vote-frontend.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
// Middleware
app.use(cors());
app.use(express.json());

// Routes (to be added)
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/songs', require('./routes/songRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));


// Socket.IO basic setup
// Track users per room
const roomUserMap = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinRoom', (roomCode) => {
    socket.join(roomCode);
    console.log(`Client ${socket.id} joined room ${roomCode}`);

    // Track user in room
    roomUserMap[roomCode] = roomUserMap[roomCode] || new Set();
    roomUserMap[roomCode].add(socket.id);

    // Broadcast updated count
    io.to(roomCode).emit('userCountUpdate', roomUserMap[roomCode].size);
  });

  socket.on('leaveRoom', (roomCode) => {
    socket.leave(roomCode);
    console.log(`Client ${socket.id} left room ${roomCode}`);

    if (roomUserMap[roomCode]) {
      roomUserMap[roomCode].delete(socket.id);
      if (roomUserMap[roomCode].size === 0) {
        delete roomUserMap[roomCode];
      } else {
        io.to(roomCode).emit('userCountUpdate', roomUserMap[roomCode].size);
      }
    }
  });

  socket.on('songAdded', ({ roomCode, song }) => {
    socket.to(roomCode).emit('songAdded', { song });
  });

  socket.on('voteUpdated', ({ roomCode, song }) => {
    socket.to(roomCode).emit('voteUpdated', { song });
  });

  socket.on('winnerFinalized', ({ roomCode, song }) => {
    socket.to(roomCode).emit('winnerFinalized', { song });
  });

  socket.on('userJoined', ({ roomCode, username }) => {
  socket.to(roomCode).emit('userJoined', { username });
});


  socket.on('disconnecting', () => {
    // Leave all rooms cleanly
    for (const roomCode of socket.rooms) {
      if (roomCode !== socket.id && roomUserMap[roomCode]) {
        roomUserMap[roomCode].delete(socket.id);
        if (roomUserMap[roomCode].size === 0) {
          delete roomUserMap[roomCode];
        } else {
          io.to(roomCode).emit('userCountUpdate', roomUserMap[roomCode].size);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


app.use(cors({
  origin: ['https://beat-vote-frontend.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// ✅ Socket.IO with CORS


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
