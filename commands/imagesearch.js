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

      const validImages = await Promise.all(
        images.map(async (image) => {
          try {
            const checkResponse = await axios.head(image.url, { 
              timeout: 5000,
              validateStatus: (status) => status < 500 
            });
            return checkResponse.status === 200 ? image : null;
          } catch (error) {
            console.error(`Image check failed: ${image.url}`, error.message);
            return null;
          }
        })
      );

      const filteredImages = validImages.filter(img => img !== null);

      if (filteredImages.length === 0) {
        return bot.sendMessage(chatId, '❌ Unable to download images. Please try another search.');
      }

      try {
        const mediaGroup = filteredImages.map((image, index) => ({
          type: 'photo',
          media: image.url,
          caption: index === 0 ? `🖼️ Search Image Results for "${query}"` : ''
        }));

        await bot.sendMediaGroup(chatId, mediaGroup);
      } catch (sendError) {
        console.error('Media Group Send Error:', sendError);
        
        for (const image of filteredImages) {
          try {
            await bot.sendPhoto(chatId, image.url, {
              caption: filteredImages.indexOf(image) === 0 
                ? `🖼️ Search Image Results for "${query}"` 
                : ''
            });
          } catch (individualSendError) {
            console.error(`Failed to send individual image: ${image.url}`, individualSendError);
          }
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
