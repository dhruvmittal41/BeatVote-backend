const express = require('express');
const axios = require('axios');
const getSpotifyToken = require('../utils/spotifyAuth');
const router = express.Router();

// GET /api/search/spotify?q=searchTerm
router.get('/spotify', async (req, res) => {
  try {
    const token = await getSpotifyToken();
    const query = req.query.q;
     console.log(req.query.q)

    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type: 'track', limit: 5 },
    });

   const tracks = response.data.tracks.items.map((track) => ({
  id: track.id,
  title: track.name,
  artist: track.artists[0]?.name || 'Unknown',
  platform: 'Spotify',
  platformLink: track.external_urls.spotify,
  thumbnail: track.album.images[0]?.url || '',  // ✅ ADD THIS LINE
}));


    res.json({ results: tracks });
  } catch (err) {
    console.error('Spotify search error:', err.message);
    res.status(500).json({ message: 'Spotify search failed' });
  }
});

module.exports = router;
