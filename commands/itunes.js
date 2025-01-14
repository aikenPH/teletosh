const axios = require('axios');

// Persistent storage mechanism
const searchResultsCache = new Map();

module.exports = {
  name: 'itunes',
  description: 'Advanced iTunes Search with Interactive Results',
  
  async execute(bot, msg, args) {
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a search term. Usage: /itunessearch <term>', {
        parse_mode: 'HTML'
      });
    }

    const query = args.join(' ');
    const chatId = msg.chat.id;

    try {
      // Send initial loading message
      const loadingMessage = await bot.sendMessage(chatId, '🔍 Searching...', {
        parse_mode: 'HTML'
      });

      const response = await axios.get('https://myapi-2f5b.onrender.com/itunes/general', {
        params: { term: query }
      });

      const results = response.data.filter(item => 
        (item.wrapperType === 'track' && 
        (item.kind === 'song' || item.kind === 'music-video'))
      );

      if (results.length === 0) {
        await bot.editMessageText('🔍 No music or video results found.', {
          chat_id: chatId,
          message_id: loadingMessage.message_id,
          parse_mode: 'HTML'
        });
        return;
      }

      // Store results with a unique identifier
      const searchId = `${chatId}_${Date.now()}`;
      searchResultsCache.set(searchId, results);

      // Create keyboard with track information
      const inlineKeyboard = results.slice(0, 5).map((item, index) => [{
        text: `${index + 1}. ${item.artistName} - ${item.trackName}`,
        callback_data: `itunes_${searchId}_${index}`
      }]);

      // Update loading message with results
      await bot.editMessageText(`<b>🎵 Found ${results.length} results for "${query}":</b>\n\nClick on a track to see details:`, {
        chat_id: chatId,
        message_id: loadingMessage.message_id,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      });

    } catch (error) {
      console.error('iTunes Search Error:', error);
      await bot.sendMessage(chatId, '❌ Unable to perform iTunes search. Please try again later.', {
        parse_mode: 'HTML'
      });
    }
  },

  async handleCallback(bot, query) {
    try {
      const chatId = query.message.chat.id;
      const messageId = query.message.message_id;
      const queryData = query.data;

      // Acknowledge the callback query immediately
      await bot.answerCallbackQuery(query.id);

      if (queryData.startsWith('itunes_')) {
        const [, searchId, index] = queryData.split('_');
        const results = searchResultsCache.get(searchId);

        if (!results) {
          await bot.editMessageText('❌ Search results expired. Please search again.', {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML'
          });
          return;
        }

        const item = results[parseInt(index)];
        if (!item) {
          await bot.editMessageText('❌ Track not found. Please try again.', {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML'
          });
          return;
        }

        // Send track details
        const detailMessage = `
<b>🎵 Track Details</b>

<b>Title:</b> ${escapeHtml(item.trackName)}
<b>Artist:</b> ${escapeHtml(item.artistName)}
<b>Album:</b> ${escapeHtml(item.collectionName)}
<b>Genre:</b> ${escapeHtml(item.primaryGenreName)}
<b>Released:</b> ${new Date(item.releaseDate).getFullYear()}
<b>Duration:</b> ${formatDuration(item.trackTimeMillis)}`;

        // First, update the original message with track details
        await bot.editMessageText(detailMessage, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{
                text: '⬅️ Back to Search Results',
                callback_data: `back_${searchId}`
              }]
            ]
          }
        });

        // Then send the artwork if available
        if (item.artworkUrl100) {
          await bot.sendPhoto(chatId, item.artworkUrl100, {
            caption: `<b>🖼 ${escapeHtml(item.artistName)} - ${escapeHtml(item.trackName)}</b>`,
            parse_mode: 'HTML'
          });
        }

        // Finally send the preview if available
        if (item.previewUrl) {
          // Send preview based on content type
          if (item.kind === 'song') {
            await bot.sendAudio(chatId, item.previewUrl, {
              caption: `<b>🎧 ${escapeHtml(item.artistName)} - ${escapeHtml(item.trackName)}</b>`,
              parse_mode: 'HTML'
            }).catch(error => {
              console.error('Audio Preview Error:', error);
              bot.sendMessage(chatId, '❌ Unable to send audio preview.', {
                parse_mode: 'HTML'
              });
            });
          } else if (item.kind === 'music-video') {
            await bot.sendVideo(chatId, item.previewUrl, {
              caption: `<b>🎬 ${escapeHtml(item.artistName)} - ${escapeHtml(item.trackName)}</b>`,
              parse_mode: 'HTML'
            }).catch(error => {
              console.error('Video Preview Error:', error);
              bot.sendMessage(chatId, '❌ Unable to send video preview.', {
                parse_mode: 'HTML'
              });
            });
          }
        }

      } else if (queryData.startsWith('back_')) {
        const searchId = queryData.split('_')[1];
        const results = searchResultsCache.get(searchId);

        if (!results) {
          await bot.editMessageText('❌ Search results expired. Please search again.', {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML'
          });
          return;
        }

        const inlineKeyboard = results.slice(0, 5).map((item, index) => [{
          text: `${index + 1}. ${item.artistName} - ${item.trackName}`,
          callback_data: `itunes_${searchId}_${index}`
        }]);

        await bot.editMessageText('<b>🎵 Search Results:</b>\n\nClick on a track to see details:', {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: inlineKeyboard
          }
        });
      }

    } catch (error) {
      console.error('Callback Handler Error:', error);
      try {
        await bot.sendMessage(query.message.chat.id, '❌ An error occurred. Please try again.', {
          parse_mode: 'HTML'
        });
      } catch (sendError) {
        console.error('Error Send Message Error:', sendError);
      }
    }
  }
};

// Utility function to format duration
function formatDuration(ms) {
  if (!ms) return 'N/A';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Utility function to escape HTML special characters
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Cleanup mechanism for search results cache
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of searchResultsCache.entries()) {
    // Remove results older than 15 minutes
    if (now - parseInt(key.split('_')[1]) > 15 * 60 * 1000) {
      searchResultsCache.delete(key);
    }
  }
}, 15 * 60 * 1000);
