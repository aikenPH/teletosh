const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  name: 'spotify',
  description: 'Search and download Spotify track preview',
  
  async execute(bot, msg, args) {
    if (args.length === 0) {
      return bot.sendMessage(msg.chat.id, 'Please provide a Spotify track name.');
    }

    const SPOTIFY_CLIENT_ID = 'YOUR_CLIENT_ID';
    const SPOTIFY_CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

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
        spotifyUrl: track.external_urls.spotify,
        previewUrl: track.preview_url
      };

      if (!trackDetails.previewUrl) {
        return bot.sendMessage(msg.chat.id, 'No preview available for this track.');
      }

      const processingMessage = await bot.sendMessage(msg.chat.id, '🔍 Preparing track preview...');

      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const fileName = `${trackDetails.artist}_${trackDetails.name}`.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = path.join(tempDir, `${fileName}_preview.mp3`);

      const previewResponse = await axios({
        method: 'get',
        url: trackDetails.previewUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      previewResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const fileStats = await fs.stat(filePath);
      if (fileStats.size === 0) {
        await fs.unlink(filePath);
        return bot.sendMessage(msg.chat.id, 'Failed to download track preview.');
      }

      const message = `🎵 Track Preview\n\n` +
                      `📌 Title: ${trackDetails.name}\n` +
                      `👤 Artist: ${trackDetails.artist}\n` +
                      `💿 Album: ${trackDetails.album}\n\n` +
                      `🎧 30-Second Preview Attached`;

      await bot.sendAudio(msg.chat.id, filePath, {
        caption: message,
        reply_to_message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [{
              text: '🎧 Full Track on Spotify',
              url: trackDetails.spotifyUrl
            }]
          ]
        }
      });

      await bot.deleteMessage(msg.chat.id, processingMessage.message_id);
      await fs.unlink(filePath);

    } catch (error) {
      console.error('[Spotify Track Preview Error]', error);
      
      const errorMessages = [
        'An error occurred while processing the track.',
        'Unable to fetch track preview. Please try again.',
        'Looks like there was a problem finding the song preview.',
        'The music preview download failed. Please check the track name.'
      ];

      const randomErrorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      
      await bot.sendMessage(msg.chat.id, randomErrorMessage, {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
