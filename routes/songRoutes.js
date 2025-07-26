const express = require('express');
const router = express.Router();
const {
  submitSong,
  voteSong,
  finalizeSong,
  getSongsByRoom
} = require('../controllers/songController');

router.post('/submit', submitSong);
router.post('/vote', voteSong);
router.post('/finalize', finalizeSong);
router.get('/:roomCode', getSongsByRoom);

module.exports = router;
