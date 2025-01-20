const axios = require('axios');

module.exports = {
  name: 'httpheaders',
  description: 'Retrieve and display HTTP headers for a specified URL',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;

    if (args.length === 0) {
      return bot.sendMessage(chatId, 'Please provide a URL.\n\nUsage: /httpheaders [url]');
    }

    const url = args[0];

    try {
      const response = await axios.head(url);
      
      const headers = response.headers;

      const headerLines = Object.entries(headers)
        .map(([key, value]) => `<b>${key}:</b> ${value}`)
        .join('\n');

      const message = `
📡 HTTP Headers for: <code>${url}</code>

${headerLines}
      `;

      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error fetching HTTP headers:', error);
      if (error.response) {
        await bot.sendMessage(chatId, `❌ Error: ${error.response.status} - ${error.response.statusText}`);
      } else {
        await bot.sendMessage(chatId, '❌ Failed to retrieve HTTP headers. Please check the URL and try again.');
      }
    }
  }
};
