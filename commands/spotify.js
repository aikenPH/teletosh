const axios = require('axios');

module.exports = {
  name: 'spotify',
  description: 'Search Spotify tracks',
  
  async execute(bot, msg, args) {
    if (args.length === 0) {
      return bot.sendMessage(msg.chat.id, 'Please provide a Spotify track name.');
    }

    const SPOTIFY_CLIENT_ID = '5dc12a729aa04fb799b08c6f0e1fc1e8';
    const SPOTIFY_CLIENT_SECRET = 'fc551efebd2143478550d5de6af96bc5';

    const query = args.join(' ');

    try {
      const authResponse = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials', 
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const accessToken = authResponse.data.access_token;

      const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q: query,
          type: 'track',
          limit: 1
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const track = searchResponse.data.tracks.items[0];
      if (!track) {
        return bot.sendMessage(msg.chat.id, 'No Spotify track found.');
      }

      const trackDetails = {
        name: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        spotifyUrl: track.external_urls.spotify
      };

      const message = `🎵 Track Details\n\n` +
                      `📌 Title: ${trackDetails.name}\n` +
                      `👤 Artist: ${trackDetails.artist}\n` +
                      `💿 Album: ${trackDetails.album}\n\n` +
                      `🔗 You can visit the Spotify page to enjoy the full track and explore more about this music.`;

      const sentMessage = await bot.sendMessage(msg.chat.id, message, {
        reply_to_message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [{
              text: '🎧 Open in Spotify',
              url: trackDetails.spotifyUrl
            }]
          ]
        }
      });

    } catch (error) {
      console.error('[Spotify Track Search Error]', error);
      
      const errorMessages = [
        'An error occurred while searching for the track.',
        'Unable to fetch track details. Please try again.',
        'Looks like there was a problem finding the song.',
        'The track search failed. Please check the track name.'
      ];

      const randomErrorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      
      await bot.sendMessage(msg.chat.id, randomErrorMessage, {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
