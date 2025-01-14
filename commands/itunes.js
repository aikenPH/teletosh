const axios = require('axios');

module.exports = {
  name: 'itunes',
  description: 'Quick iTunes Search with Direct Result',
  async execute(bot, msg, args) {
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a search term. Usage: /itunessearch <term>');
    }

    const query = args.join(' ');
    const chatId = msg.chat.id;

    try {
      const response = await axios.get('https://myapi-2f5b.onrender.com/itunes/general', {
        params: { term: query }
      });

      // Filter and get the most relevant result
      const result = response.data.find(item => 
        item.wrapperType === 'track' && 
        (item.kind === 'song' || item.kind === 'music-video')
      );

      if (!result) {
        return bot.sendMessage(chatId, '🔍 No music or video results found.');
      }

      // Construct detailed message
      const message = `
<b>🎵 iTunes Search Result</b>

<b>Artist:</b> ${escapeHtml(result.artistName)}
<b>Track:</b> ${escapeHtml(result.trackName)}
<b>Album:</b> ${escapeHtml(result.collectionName)}
<b>Genre:</b> ${escapeHtml(result.primaryGenreName)}
<b>Released:</b> ${new Date(result.releaseDate).getFullYear()}
<b>Duration:</b> ${formatDuration(result.trackTimeMillis)}
      `;

      // Prepare media attachments
      const mediaOptions = {
        caption: `${escapeHtml(result.artistName)} - ${escapeHtml(result.trackName)}`,
        parse_mode: 'HTML'
      };

      // Send media based on type
      if (result.kind === 'song' && result.previewUrl) {
        try {
          await bot.sendAudio(chatId, result.previewUrl, mediaOptions);
        } catch (audioError) {
          console.error('Audio Send Error:', audioError);
        }
      } 
      else if (result.kind === 'music-video' && result.previewUrl) {
        try {
          await bot.sendVideo(chatId, result.previewUrl, mediaOptions);
        } catch (videoError) {
          console.error('Video Send Error:', videoError);
        }
      }

      // Send artwork if available
      if (result.artworkUrl100) {
        try {
          await bot.sendPhoto(chatId, result.artworkUrl100, {
            caption: `Artwork: ${escapeHtml(result.artistName)} - ${escapeHtml(result.trackName)}`,
            parse_mode: 'HTML'
          });
        } catch (artworkError) {
          console.error('Artwork Send Error:', artworkError);
        }
      }

      // Send text description
      await bot.sendMessage(chatId, message, { 
        parse_mode: 'HTML',
        disable_web_page_preview: true 
      });

    } catch (error) {
      console.error('iTunes Search Error:', error);
      bot.sendMessage(chatId, '❌ Unable to perform iTunes search.', { parse_mode: 'HTML' });
    }
  }
};

// Utility function to format duration
function formatDuration(ms) {
  if (!ms) return 'N/A';
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// HTML escape function
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
