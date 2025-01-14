const axios = require('axios');

// Persistent storage mechanism
const searchResultsCache = new Map();

module.exports = {
  name: 'itunessearch',
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
      // Show searching message
      const searchingMsg = await bot.sendMessage(chatId, '🔍 Searching...', {
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
        return bot.editMessageText('🔍 No music or video results found.', {
          chat_id: chatId,
          message_id: searchingMsg.message_id,
          parse_mode: 'HTML'
        });
      }

      // Store results with a unique identifier
      const searchId = `${chatId}_${Date.now()}`;
      searchResultsCache.set(searchId, results);

      // Create keyboard with track information and separate buttons for preview and artwork
      const inlineKeyboard = [];
      
      // Add result buttons (max 5)
      results.slice(0, 5).forEach((item, index) => {
        inlineKeyboard.push([{
          text: `${index + 1}. ${item.artistName} - ${item.trackName}`,
          callback_data: `view_${searchId}_${index}`
        }]);
      });

      // Edit the searching message with results
      await bot.editMessageText(`🎵 Found ${results.length} results for "<b>${query}</b>":`, {
        chat_id: chatId,
        message_id: searchingMsg.message_id,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      });

    } catch (error) {
      console.error('iTunes Search Error:', error);
      bot.sendMessage(chatId, '❌ Unable to perform iTunes search. Please try again later.', {
        parse_mode: 'HTML'
      });
    }
  },

  // Register all callback handlers
  registerCallbacks(bot) {
    // View track details
    bot.on('callback_query', async (query) => {
      const data = query.data;
      
      if (!data.startsWith('view_') && 
          !data.startsWith('preview_') && 
          !data.startsWith('artwork_')) {
        return;
      }

      try {
        // Extract search ID and index
        const [action, searchId, index] = data.split('_');
        const results = searchResultsCache.get(searchId);

        if (!results) {
          return bot.answerCallbackQuery(query.id, {
            text: '⚠️ Search results expired. Please search again.',
            show_alert: true
          });
        }

        const item = results[parseInt(index)];
        if (!item) {
          return bot.answerCallbackQuery(query.id, {
            text: '⚠️ Track not found',
            show_alert: true
          });
        }

        switch (action) {
          case 'view':
            await handleViewDetails(bot, query, item);
            break;
          case 'preview':
            await handlePreview(bot, query, item);
            break;
          case 'artwork':
            await handleArtwork(bot, query, item);
            break;
        }

      } catch (error) {
        console.error('Callback Error:', error);
        bot.answerCallbackQuery(query.id, {
          text: '❌ An error occurred. Please try again.',
          show_alert: true
        });
      }
    });
  }
};

// Handler functions
async function handleViewDetails(bot, query, item) {
  const chatId = query.message.chat.id;
  
  // Create inline keyboard for media options
  const mediaKeyboard = [];
  
  if (item.previewUrl) {
    mediaKeyboard.push([{
      text: item.kind === 'song' ? '🎧 Play Preview' : '🎬 Play Video',
      callback_data: `preview_${query.data.split('_')[1]}_${query.data.split('_')[2]}`
    }]);
  }
  
  if (item.artworkUrl100) {
    mediaKeyboard.push([{
      text: '🖼 Show Artwork',
      callback_data: `artwork_${query.data.split('_')[1]}_${query.data.split('_')[2]}`
    }]);
  }

  const detailText = `
🎵 <b>${escapeHtml(item.trackName)}</b>

👤 <b>Artist:</b> ${escapeHtml(item.artistName)}
💿 <b>Album:</b> ${escapeHtml(item.collectionName)}
🎼 <b>Genre:</b> ${escapeHtml(item.primaryGenreName)}
📅 <b>Released:</b> ${new Date(item.releaseDate).getFullYear()}
⏱ <b>Duration:</b> ${formatDuration(item.trackTimeMillis)}
💰 <b>Price:</b> ${item.trackPrice ? `$${item.trackPrice}` : 'N/A'}
`;

  try {
    // Edit the original message with track details
    await bot.editMessageText(detailText, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: mediaKeyboard
      }
    });
    
    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('View Details Error:', error);
    throw error;
  }
}

async function handlePreview(bot, query, item) {
  const chatId = query.message.chat.id;
  
  try {
    // Send preview based on content type
    if (item.kind === 'song') {
      await bot.sendAudio(chatId, item.previewUrl, {
        caption: `🎧 ${escapeHtml(item.artistName)} - ${escapeHtml(item.trackName)}`,
        parse_mode: 'HTML'
      });
    } else if (item.kind === 'music-video') {
      await bot.sendVideo(chatId, item.previewUrl, {
        caption: `🎬 ${escapeHtml(item.artistName)} - ${escapeHtml(item.trackName)}`,
        parse_mode: 'HTML'
      });
    }
    
    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Preview Error:', error);
    throw error;
  }
}

async function handleArtwork(bot, query, item) {
  const chatId = query.message.chat.id;
  
  try {
    // Send high-quality artwork
    const artworkUrl = item.artworkUrl100.replace('100x100bb', '600x600bb');
    await bot.sendPhoto(chatId, artworkUrl, {
      caption: `🖼 ${escapeHtml(item.artistName)} - ${escapeHtml(item.trackName)}`,
      parse_mode: 'HTML'
    });
    
    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Artwork Error:', error);
    throw error;
  }
}

// Utility functions
function formatDuration(ms) {
  if (!ms) return 'N/A';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Cleanup mechanism
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of searchResultsCache.entries()) {
    if (now - parseInt(key.split('_')[1]) > 15 * 60 * 1000) {
      searchResultsCache.delete(key);
    }
  }
}, 15 * 60 * 1000);
