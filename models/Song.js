const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: String,
  platform: {
    type: String,
    enum: ['Spotify', 'YouTube'],
    required: true,
  },
  platformLink: {
    type: String,
    required: true,
  },
  thumbnail: String,
  voteCount: {
    type: Number,
    default: 0,
  },
  submittedBy: {
    type: String, // optional user name or ID
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
   votedUsers: {
  type: [String],
  default: [],
},
});

module.exports = mongoose.model('Song', SongSchema);
