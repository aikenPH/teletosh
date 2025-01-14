const axios = require('axios');

// Persistent storage mechanism
const searchResultsCache = new Map();

module.exports = {
  name: 'itunes',
  description: 'Advanced iTunes Search with Interactive Results',
  
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

      const results = response.data.filter(item => 
        (item.wrapperType === 'track' && 
        (item.kind === 'song' || item.kind === 'music-video'))
      );

      if (results.length === 0) {
        return bot.sendMessage(chatId, '🔍 No music or video results found.');
      }

      // Store results with a unique identifier
      const searchId = `${chatId}_${Date.now()}`;
      searchResultsCache.set(searchId, results);

      // Create keyboard with track information
      const inlineKeyboard = results.slice(0, 5).map((item, index) => [{
        text: `${index + 1}. ${item.artistName} - ${item.trackName}`,
        callback_data: `itunes_detail_${searchId}_${index}`
      }]);

      await bot.sendMessage(chatId, `🎵 Found ${results.length} results for "${query}":`, {
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      });

    } catch (error) {
      console.error('iTunes Search Error:', error);
      bot.sendMessage(chatId, '❌ Unable to perform iTunes search. Please try again later.');
    }
  },

  async handleDetailCallback(bot, query) {
    try {
      const [, searchId, index] = query.data.match(/itunes_detail_(.+)_(\d+)/) || [];
      
      if (!searchId || !index) {
        return bot.answerCallbackQuery(query.id, 'Invalid search data');
      }

      const results = searchResultsCache.get(searchId);
      if (!results) {
        return bot.answerCallbackQuery(query.id, 'Search results expired. Please search again.');
      }

      const item = results[parseInt(index)];
      if (!item) {
        return bot.answerCallbackQuery(query.id, 'Track not found');
      }

      // Prepare track information
      const detailMessage = `
🎵 *${item.trackName}*
👤 Artist: ${item.artistName}
💿 Album: ${item.collectionName}
🎼 Genre: ${item.primaryGenreName}
📅 Released: ${new Date(item.releaseDate).getFullYear()}
⏱ Duration: ${formatDuration(item.trackTimeMillis)}`;

      // Send track details first
      await bot.sendMessage(query.message.chat.id, detailMessage, {
        parse_mode: 'Markdown'
      });

      // Send preview if available
      if (item.previewUrl) {
        if (item.kind === 'song') {
          await bot.sendAudio(query.message.chat.id, item.previewUrl, {
            caption: `🎧 Preview: ${item.artistName} - ${item.trackName}`
          });
        } else if (item.kind === 'music-video') {
          await bot.sendVideo(query.message.chat.id, item.previewUrl, {
            caption: `🎬 Preview: ${item.artistName} - ${item.trackName}`
          });
        }
      }

      // Send artwork if available
      if (item.artworkUrl100) {
        await bot.sendPhoto(query.message.chat.id, item.artworkUrl100, {
          caption: `🖼 Artwork: ${item.artistName} - ${item.trackName}`
        });
      }

      await bot.answerCallbackQuery(query.id);

    } catch (error) {
      console.error('Handle Detail Callback Error:', error);
      bot.answerCallbackQuery(query.id, '❌ Error showing track details');
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
