const axios = require('axios');

module.exports = {
  name: 'itunes',
  description: 'Search for songs or videos using the iTunes API.',
  async execute(bot, msg, args) {
    const searchTerm = args.join(' ') || 'bored';
    try {
      const response = await axios.get(`https://myapi-2f5b.onrender.com/itunes/general?term=${encodeURIComponent(searchTerm)}`);
      const tracks = response.data;

      if (tracks.length === 0) {
        return bot.sendMessage(msg.chat.id, '❌ No results found for your search.');
      }

      const inlineKeyboard = [];

      tracks.forEach(track => {
        const trackName = track.trackCensoredName;
        const collectionName = track.collectionCensoredName;
        const previewUrl = track.previewUrl;
        const isVideo = track.kind === 'music-video';

        const buttonText = `${trackName} - ${collectionName}`;
        inlineKeyboard.push([{
          text: buttonText,
          url: previewUrl
        }]);
      });

      const messageText = '🎶 Here are the results:';
      await bot.sendMessage(msg.chat.id, messageText, {
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      });

    } catch (error) {
      console.error('iTunes Command Error:', error);
      await bot.sendMessage(msg.chat.id, '❌ An error occurred while fetching data from the iTunes API.');
    }
  }
};
