const axios = require('axios');

// Persistent storage mechanism
const searchResultsCache = new Map();

module.exports = {
  name: 'itunessearch',
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

      const inlineKeyboard = results.slice(0, 5).map((item, index) => [{
        text: `${item.artistName} - ${item.trackName}`,
        callback_data: `itunes_detail_${searchId}_${index}`
      }]);

      await bot.sendMessage(chatId, `🔍 Search Results for "${query}":`, {
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      });

    } catch (error) {
      console.error('iTunes Search Error:', error);
      bot.sendMessage(chatId, '❌ Unable to perform iTunes search.');
    }
  },

  async handleDetailCallback(bot, query) {
    const detailMatch = query.data.match(/itunes_detail_(.+)_(\d+)/);
    if (!detailMatch) return;

    const [, searchId, index] = detailMatch;
    const results = searchResultsCache.get(searchId);

    if (!results) {
      return bot.answerCallbackQuery(query.id, 'Search results expired. Please search again.');
    }

    const item = results[parseInt(index)];

    if (!item) {
      return bot.answerCallbackQuery(query.id, 'Result not found');
    }

    let detailMessage = `
🎵 *Detailed Track Information*

*Artist:* ${item.artistName}
*Track:* ${item.trackName}
*Album:* ${item.collectionName}
*Genre:* ${item.primaryGenreName}
*Released:* ${new Date(item.releaseDate).getFullYear()}
*Duration:* ${formatDuration(item.trackTimeMillis)}
    `;

    const mediaButtons = [];

    // Media preview buttons
    if (item.previewUrl) {
      mediaButtons.push([
        { 
          text: item.kind === 'song' ? '🎧 Preview Audio' : '🎬 Preview Video', 
          callback_data: `preview_media_${searchId}_${index}` 
        }
      ]);
    }

    // Artwork button
    if (item.artworkUrl100) {
      mediaButtons.push([
        { 
          text: '🖼️ Album Artwork', 
          callback_data: `artwork_${searchId}_${index}` 
        }
      ]);
    }

    try {
      await bot.editMessageText(detailMessage, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: mediaButtons
        }
      });
    } catch (error) {
      console.error('Edit Message Error:', error);
    }

    await bot.answerCallbackQuery(query.id);
  },

  async handleMediaCallback(bot, query) {
    const mediaMatch = query.data.match(/preview_media_(.+)_(\d+)/);
    const artworkMatch = query.data.match(/artwork_(.+)_(\d+)/);

    let searchId, index, results, item;

    // Media Preview
    if (mediaMatch) {
      [, searchId, index] = mediaMatch;
      results = searchResultsCache.get(searchId);
      
      if (!results) {
        return bot.answerCallbackQuery(query.id, 'Search results expired.');
      }

      item = results[parseInt(index)];

      if (item.previewUrl) {
        try {
          if (item.kind === 'song') {
            await bot.sendAudio(query.message.chat.id, item.previewUrl, {
              caption: `Preview: ${item.artistName} - ${item.trackName}`
            });
          } else if (item.kind === 'music-video') {
            await bot.sendVideo(query.message.chat.id, item.previewUrl, {
              caption: `Preview: ${item.artistName} - ${item.trackName}`
            });
          }
        } catch (error) {
          console.error('Media Send Error:', error);
          await bot.sendMessage(query.message.chat.id, '❌ Unable to send media preview.');
        }
      }
    }

    // Artwork
    if (artworkMatch) {
      [, searchId, index] = artworkMatch;
      results = searchResultsCache.get(searchId);
      
      if (!results) {
        return bot.answerCallbackQuery(query.id, 'Search results expired.');
      }

      item = results[parseInt(index)];

      if (item.artworkUrl100) {
        try {
          await bot.sendPhoto(query.message.chat.id, item.artworkUrl100, {
            caption: `Artwork: ${item.artistName} - ${item.trackName}`
          });
        } catch (error) {
          console.error('Artwork Send Error:', error);
          await bot.sendMessage(query.message.chat.id, '❌ Unable to send artwork.');
        }
      }
    }

    await bot.answerCallbackQuery(query.id);
  }
};

// Utility function to format duration
function formatDuration(ms) {
  if (!ms) return 'N/A';
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
