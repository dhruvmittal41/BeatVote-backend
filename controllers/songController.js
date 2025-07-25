const Song = require('../models/Song');
const Room = require('../models/Room');

// @desc    Submit a new song to a room
// @route   POST /api/songs/submit
exports.submitSong = async (req, res) => {
  try {
    const { title, artist, platform, platformLink, thumbnail, submittedBy, roomCode } = req.body;

    if (!title || !platform || !platformLink || !roomCode) {
      return res.status(400).json({ message: 'Missing required song details' });
    }

    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const newSong = await Song.create({
      title,
      artist,
      platform,
      platformLink,
      thumbnail,
      submittedBy,
      roomId: room._id,
    });

    room.playlist.push(newSong._id);
    await room.save();

    return res.status(201).json({
      message: 'Song submitted successfully',
      song: newSong,
    });
  } catch (err) {
    console.error('Error submitting song:', err.message);
    return res.status(500).json({ message: 'Server error while submitting song' });
  }
};

// @desc    Vote for a song
// @route   POST /api/songs/vote
exports.voteSong = async (req, res) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ message: 'songId is required' });
    }

    const song = await Song.findById(songId);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    song.voteCount += 1;
    await song.save();

    return res.status(200).json({
      message: 'Vote counted',
      song,
    });
  } catch (err) {
    console.error('Error voting for song:', err.message);
    return res.status(500).json({ message: 'Server error while voting' });
  }
};

// @desc    Finalize song with highest votes
// @route   POST /api/songs/finalize
exports.finalizeSong = async (req, res) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({ message: 'roomCode is required' });
    }

    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() }).populate('playlist');

    if (!room || room.playlist.length === 0) {
      return res.status(404).json({ message: 'Room not found or no songs submitted' });
    }

    // Find song with highest voteCount
    let winningSong = room.playlist[0];
    for (let song of room.playlist) {
      if (song.voteCount > winningSong.voteCount) {
        winningSong = song;
      }
    }

    room.finalizedSong = winningSong._id;
    await room.save();

    return res.status(200).json({
      message: 'Winning song finalized',
      song: winningSong,
    });
  } catch (err) {
    console.error('Error finalizing song:', err.message);
    return res.status(500).json({ message: 'Server error while finalizing vote' });
  }
};
