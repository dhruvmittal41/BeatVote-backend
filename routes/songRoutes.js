const express = require('express');
const router = express.Router();
const {
  submitSong,
  voteSong,
  finalizeSong,
} = require('../controllers/songController');

router.post('/submit', submitSong);
router.post('/vote', voteSong);
router.post('/finalize', finalizeSong);

module.exports = router;
