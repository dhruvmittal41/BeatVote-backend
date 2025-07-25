const axios = require('axios');

let accessToken = null;
let expiresAt = null;

async function getSpotifyToken() {
  if (accessToken && Date.now() < expiresAt) {
    return accessToken;
  }

  const res = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        'Authorization': `Basic ${Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  accessToken = res.data.access_token;
  expiresAt = Date.now() + res.data.expires_in * 1000;
  return accessToken;
}

module.exports = getSpotifyToken;
