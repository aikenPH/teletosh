const axios = require('axios');

module.exports = {
  name: 'image',
  description: 'Search and send Google images',
  async execute(bot, msg, args) {
    const query = args.join(' ');
    
    if (!query) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a search query. Usage: /image [search term]');
    }

    try {
      const response = await axios.get(`https://myapi-2f5b.onrender.com/google/image`, {
        params: {
          search: query,
          count: 5
        }
      });

      const images = response.data.images;
      const chatId = msg.chat.id;

      if (!images || images.length === 0) {
        return bot.sendMessage(chatId, '🔍 No images found for your search.');
      }

      const caption = `🖼️ Search Image Results for "${query}"`;

      for (const image of images) {
        try {
          await bot.sendPhoto(chatId, image.url, {
            caption: caption
          });
        } catch (sendError) {
          console.error(`Error sending image: ${image.url}`, sendError);
        }
      }

    } catch (error) {
      console.error('Image Search Error:', error);
      
      const errorMessage = error.response 
        ? `❌ API Error: ${error.response.data.message || 'Unknown error'}` 
        : '❌ Network error. Please try again later.';
      
      bot.sendMessage(msg.chat.id, errorMessage);
    }
  }
};
