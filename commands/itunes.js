const axios = require('axios');

module.exports = {
  name: 'itunessearch',
  description: 'Search iTunes with interactive results',
  async execute(bot, msg, args) {
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a search term. Usage: /itunessearch <term>');
    }

    const query = args.join(' ');

    try {
      const response = await axios.get('https://myapi-2f5b.onrender.com/itunes/general', {
        params: { term: query }
      });

      const results = response.data.filter(item => 
        (item.wrapperType === 'track' && 
        (item.kind === 'song' || item.kind === 'music-video'))
      );

      if (results.length === 0) {
        return bot.sendMessage(msg.chat.id, '🔍 No music or video results found.');
      }

      const inlineKeyboard = results.slice(0, 5).map((item, index) => [{
        text: `${item.artistName} - ${item.trackName}`,
        callback_data: `itunes_detail_${index}`
      }]);

      await bot.sendMessage(msg.chat.id, `🔍 Search Results for "${query}":`, {
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      });

      // Store results in a temporary context
      global.iTunesSearchResults = results;

    } catch (error) {
      console.error('iTunes Search Error:', error);
      bot.sendMessage(msg.chat.id, '❌ Unable to perform iTunes search.');
    }
  }
};

// Callback query handler
module.exports.handleCallbackQuery = async (bot, query) => {
  const match = query.data.match(/itunes_detail_(\d+)/);
  if (!match) return;

  const index = parseInt(match[1]);
  const item = global.iTunesSearchResults[index];

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
*Duration:* ${formatMilliseconds(item.trackTimeMillis)}
  `;

  const mediaButtons = [];

  // Preview URL Button
  if (item.previewUrl) {
    mediaButtons.push([
      { 
        text: '🎧 Preview Audio', 
        callback_data: `preview_audio_${index}` 
      }
    ]);
  }

  // Artwork Button
  if (item.artworkUrl100) {
    mediaButtons.push([
      { 
        text: '🖼️ Album Artwork', 
        callback_data: `artwork_${index}` 
      }
    ]);
  }

  await bot.editMessageText(detailMessage, {
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: mediaButtons
    }
  });

  bot.answerCallbackQuery(query.id);
};

// Nested callback handlers
module.exports.handleMediaCallback = async (bot, query) => {
  const previewMatch = query.data.match(/preview_audio_(\d+)/);
  const artworkMatch = query.data.match(/artwork_(\d+)/);

  if (previewMatch) {
    const index = parseInt(previewMatch[1]);
    const item = global.iTunesSearchResults[index];

    if (item.previewUrl) {
      await bot.sendAudio(query.message.chat.id, item.previewUrl, {
        caption: `Preview: ${item.artistName} - ${item.trackName}`
      });
    }
  }

  if (artworkMatch) {
    const index = parseInt(artworkMatch[1]);
    const item = global.iTunesSearchResults[index];

    if (item.artworkUrl100) {
      await bot.sendPhoto(query.message.chat.id, item.artworkUrl100, {
        caption: `Artwork: ${item.artistName} - ${item.trackName}`
      });
    }
  }

  bot.answerCallbackQuery(query.id);
};

// Utility function to format milliseconds
function formatMilliseconds(ms) {
  if (!ms) return 'N/A';
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
