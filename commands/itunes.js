const axios = require('axios');

module.exports = {
  name: 'itunes',
  description: 'iTunes Search with Media Preview',
  async execute(bot, msg, args) {
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a search term. Usage: /itunes <term>');
    }

    const query = args.join(' ');
    const chatId = msg.chat.id;

    try {
      const response = await axios.get('https://myapi-2f5b.onrender.com/itunes/general', {
        params: { term: query }
      });

      // Find most relevant result (song or music video)
      const result = response.data.find(item => 
        item.wrapperType === 'track' && 
        (item.kind === 'song' || item.kind === 'music-video')
      );

      if (!result) {
        return bot.sendMessage(chatId, '🔍 No music or video results found.');
      }

      // Construct detailed caption
      const caption = `
<b>🎵 iTunes Search Result</b>

<b>Artist:</b> ${escapeHtml(result.artistName)}
<b>Track:</b> ${escapeHtml(result.trackName)}
<b>Album:</b> ${escapeHtml(result.collectionName)}
<b>Type:</b> ${result.kind === 'song' ? 'Audio' : 'Music Video'}
<b>Genre:</b> ${escapeHtml(result.primaryGenreName)}
<b>Released:</b> ${new Date(result.releaseDate).getFullYear()}
<b>Duration:</b> ${formatDuration(result.trackTimeMillis)}

Visit: <a href="${result.trackViewUrl}">iTunes Link</a>
      `.trim();

      // Determine media type and send accordingly
      const mediaOptions = {
        caption: caption,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      };

      // Enhanced media handling
      if (result.previewUrl) {
        try {
          switch (result.kind) {
            case 'song':
              await sendAudioWithRetry(bot, chatId, result.previewUrl, mediaOptions);
              break;
            case 'music-video':
              await sendVideoWithRetry(bot, chatId, result.previewUrl, mediaOptions);
              break;
            default:
              await bot.sendMessage(chatId, caption, { 
                parse_mode: 'HTML',
                disable_web_page_preview: true 
              });
          }
        } catch (mediaError) {
          console.error('Media Send Error:', mediaError);
          await bot.sendMessage(chatId, '❌ Unable to send media preview.', { parse_mode: 'HTML' });
        }
      } else {
        // Fallback if no preview available
        await bot.sendMessage(chatId, caption, { 
          parse_mode: 'HTML',
          disable_web_page_preview: true 
        });
      }

    } catch (error) {
      console.error('iTunes Search Error:', error);
      bot.sendMessage(chatId, '❌ Unable to perform iTunes search.', { parse_mode: 'HTML' });
    }
  }
};

// Enhanced audio sending with multiple retry mechanisms
async function sendAudioWithRetry(bot, chatId, audioUrl, options, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await bot.sendAudio(chatId, audioUrl, options);
      return;
    } catch (error) {
      console.error(`Audio Send Attempt ${attempt} Failed:`, error);
      
      // Different strategies for different error types
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Enhanced video sending with multiple retry mechanisms
async function sendVideoWithRetry(bot, chatId, videoUrl, options, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await bot.sendVideo(chatId, videoUrl, options);
      return;
    } catch (error) {
      console.error(`Video Send Attempt ${attempt} Failed:`, error);
      
      // Different strategies for different error types
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

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
