const Room = require('../models/Room');

// @desc    Create a new room
// @route   POST /api/rooms/create
const createRoom = async (req, res) => {
  try {
    const { createdBy, roomCode } = req.body;

    if (!createdBy || !roomCode) {
      return res.status(400).json({ message: 'createdBy and roomCode are required' });
    }

    const upperRoomCode = roomCode.toUpperCase();

    const existing = await Room.findOne({ roomCode: upperRoomCode });
    if (existing) {
      return res.status(409).json({ message: 'Room code already exists' });
    }

    const newRoom = await Room.create({
      createdBy,
      roomCode: upperRoomCode,
    });

    return res.status(201).json({
      message: 'Room created successfully',
      room: {
        _id: newRoom._id,
        roomCode: newRoom.roomCode,
        createdBy: newRoom.createdBy,
      },
    });
  } catch (err) {
    console.error('Error creating room:', err.message);
    return res.status(500).json({ message: 'Server error while creating room' });
  }
};

// @desc    Join a room
// @route   POST /api/rooms/join
const joinRoom = async (req, res) => {
  try {
    const { name, roomCode } = req.body;

    if (!name || !roomCode) {
      return res.status(400).json({ message: 'Name and roomCode are required' });
    }

    const upperRoomCode = roomCode.toUpperCase();

    const room = await Room.findOne({ roomCode: upperRoomCode });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user with same name already joined
    const alreadyJoined = room.joinedUsers.some(
      (user) => user.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyJoined) {
      return res.status(200).json({
        message: `${name} already joined.`,
        roomCode: room.roomCode,
        joinedCount: room.joinedUsers.length,
      });
    }

    // Add the user to joinedUsers
    room.joinedUsers.push({ name });
    await room.save();

    return res.status(200).json({
      message: `${name} joined the room.`,
      roomCode: room.roomCode,
      joinedCount: room.joinedUsers.length,
    });
  } catch (err) {
    console.error('Error joining room:', err.message);
    return res.status(500).json({ message: 'Server error while joining room' });
  }
};

module.exports = {
  createRoom,
  joinRoom,
};
