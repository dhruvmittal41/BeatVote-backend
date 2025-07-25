const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Room = require('./models/Room'); 

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Apply CORS middleware early and only once
app.use(cors({
  origin: 'https://beat-vote-frontend.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// ✅ Socket.IO setup with CORS
const io = socketIO(server, {
  cors: {
    origin: 'https://beat-vote-frontend.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ✅ Routes
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/songs', require('./routes/songRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// ✅ Test route for Railway status check
app.get('/', (req, res) => {
  res.send('BeatVote Backend is running');
});

// ✅ Socket.IO event logic
const roomUserMap = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinRoom', (roomCode) => {
    socket.join(roomCode);
    console.log(`Client ${socket.id} joined room ${roomCode}`);

    roomUserMap[roomCode] = roomUserMap[roomCode] || new Set();
    roomUserMap[roomCode].add(socket.id);

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

 // server-side
socket.on("voteStarted", async ({ roomCode }) => {
  const room = await Room.findOne({ roomCode });
  if (room) {
    room.votedUsers = []; // Reset votes
    await room.save();
    io.to(roomCode).emit("voteStarted");
  }
});



  socket.on('disconnecting', () => {
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

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
