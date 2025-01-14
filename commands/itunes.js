const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'itunessearch',
  description: 'Advanced iTunes Search with Intelligent Media Handling',
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

      // Find the most relevant result (song or video)
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
<b>Type:</b> ${result.kind === 'song' ? 'Audio' : 'Video'}
<b>Genre:</b> ${escapeHtml(result.primaryGenreName)}
<b>Released:</b> ${new Date(result.releaseDate).getFullYear()}
<b>Duration:</b> ${formatDuration(result.trackTimeMillis)}

<i>Visit:</i> <a href="${result.trackViewUrl}">iTunes Link</a>
      `.trim();

      // Media options
      const mediaOptions = {
        caption: caption,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      };

      // Determine media type and send
      if (result.previewUrl) {
        try {
          // Check the file extension to determine if it's audio or video
          const isAudio = result.previewUrl.endsWith('.m4a') || result.previewUrl.endsWith('.mp3');
          const isVideo = result.previewUrl.endsWith('.m4v') || result.previewUrl.endsWith('.mp4');

          if (isAudio) {
            await bot.sendAudio(chatId, result.previewUrl, mediaOptions);
          } else if (isVideo) {
            await bot.sendVideo(chatId, result.previewUrl, mediaOptions);
          } else {
            await bot.sendMessage(chatId, '❌ Unsupported media type.', { parse_mode: 'HTML' });
          }
        } catch (mediaError) {
          console.error('Media Processing Error:', mediaError);
          await bot.sendMessage(chatId, '❌ Unable to process media preview.', { parse_mode: 'HTML' });
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
