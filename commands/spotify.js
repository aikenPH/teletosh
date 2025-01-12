const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'spotify',
  description: 'Search and retrieve Spotify tracks',
  
  async execute(bot, msg, args, db) {
    // Hardcoded Spotify API Credentials
    const CLIENT_ID = '5dc12a729aa04fb799b08c6f0e1fc1e8';
    const CLIENT_SECRET = 'fc551efebd2143478550d5de6af96bc5';

    // Validate input
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a song name. Usage: /spotify <song name>');
    }

    const query = encodeURIComponent(args.join(' '));

    try {
      // Get Access Token
      const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials', 
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Search Track
      const searchResponse = await axios.get(`https://api.spotify.com/v1/search`, {
        params: {
          q: query,
          type: 'track',
          limit: 5  // Increased to show multiple results
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const tracks = searchResponse.data.tracks.items;
      
      if (tracks.length === 0) {
        return bot.sendMessage(msg.chat.id, '🚫 No tracks found.');
      }

      // Create inline keyboard with track results
      const trackKeyboard = tracks.map((track, index) => [{
        text: `${index + 1}. ${track.name} - ${track.artists[0].name}`,
        callback_data: `spotify_track_${index}`
      }]);

      // Send track selection message
      await bot.sendMessage(msg.chat.id, '🎵 Select a track:', {
        reply_markup: {
          inline_keyboard: trackKeyboard
        }
      });

      // Handle track selection
      bot.on('callback_query', async (callbackQuery) => {
        const match = callbackQuery.data.match(/spotify_track_(\d+)/);
        if (match) {
          const selectedTrackIndex = parseInt(match[1]);
          const track = tracks[selectedTrackIndex];

          // Track Metadata
          const trackName = track.name;
          const artists = track.artists.map(artist => artist.name).join(', ');
          const albumCover = track.album.images[0]?.url;
          const spotifyUrl = track.external_urls.spotify;
          const previewUrl = track.preview_url;

          // Send Detailed Track Information
          const infoMessage = await bot.sendPhoto(msg.chat.id, albumCover || '', {
            caption: `🎵 Track: ${trackName}\n👤 Artist: ${artists}\n💿 Album: ${track.album.name}`,
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔗 Open on Spotify', url: spotifyUrl }],
                [{ text: '🎧 30s Preview', callback_data: 'spotify_preview' }]
              ]
            }
          });

          // Preview Handling
          bot.on('callback_query', async (previewCallback) => {
            if (previewCallback.data === 'spotify_preview' && previewUrl) {
              try {
                // Download Preview
                const tempAudioPath = path.join(__dirname, 'temp', `spotify_preview_${Date.now()}.mp3`);
                
                const previewResponse = await axios({
                  method: 'get',
                  url: previewUrl,
                  responseType: 'stream'
                });

                const writer = fs.createWriteStream(tempAudioPath);
                previewResponse.data.pipe(writer);

                await new Promise((resolve, reject) => {
                  writer.on('finish', resolve);
                  writer.on('error', reject);
                });

                // Send Preview Audio
                await bot.sendAudio(msg.chat.id, tempAudioPath, {
                  title: `${trackName} (Preview)`,
                  performer: artists
                });

                // Cleanup
                fs.unlinkSync(tempAudioPath);

                // Answer Callback Query
                await bot.answerCallbackQuery(previewCallback.id, {
                  text: '🎵 Playing 30s Preview'
                });

              } catch (previewError) {
                console.error('Preview Download Error:', previewError);
                await bot.answerCallbackQuery(previewCallback.id, {
                  text: '❌ Preview unavailable',
                  show_alert: true
                });
              }
            }
          });

          // Answer the initial callback query
          await bot.answerCallbackQuery(callbackQuery.id);
        }
      });

    } catch (error) {
      console.error('Spotify API Error:', error);
      
      // Detailed Error Handling
      const errorMessage = error.response 
        ? `API Error: ${error.response.status} - ${error.response.data.error.message}`
        : 'Network error occurred';

      await bot.sendMessage(msg.chat.id, `❌ ${errorMessage}`);
    }
  }
};
