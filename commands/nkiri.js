const axios = require('axios');

module.exports = {
  name: 'nkiri',
  description: 'Search for movies/series on Nkiri',
  async execute(bot, msg, args) {
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a search query. Usage: /nkiri <title> [page]');
    }

    const page = args.length > 1 && !isNaN(args[args.length - 1]) 
      ? parseInt(args[args.length - 1]) 
      : 1;

    const searchQuery = args.length > 1 
      ? args.slice(0, -1).join(' ') 
      : args.join(' ');

    try {
      const response = await axios.get('https://myapi-2f5b.onrender.com/nkiri', {
        params: {
          search: searchQuery,
          page: page
        }
      });

      if (!response.data.results || response.data.results.length === 0) {
        return bot.sendMessage(msg.chat.id, '🔍 No results found.');
      }

      const resultMessage = `
🔍 <b>Search Results for "${searchQuery}" (Page ${page})</b>

${response.data.results.map((result, index) => `
<b>${index + 1}. ${result.title}</b>
🔗 Download Link: <code>${result.url}</code>
`).join('\n\n')}
      `;

      const mediaGroup = response.data.results.map(result => ({
        type: 'photo',
        media: result.thumbnail
      }));

      await bot.sendMessage(msg.chat.id, resultMessage, {
        parse_mode: 'HTML'
      });

      if (mediaGroup.length > 0) {
        await bot.sendMediaGroup(msg.chat.id, mediaGroup);
      }

    } catch (error) {
      console.error('Nkiri Search Error:', error);

      if (error.response) {
        bot.sendMessage(msg.chat.id, `
❌ Search failed. 
Status: ${error.response.status}
Message: ${error.response.data.message || 'Unknown error'}
        `);
      } else {
        bot.sendMessage(msg.chat.id, '❌ An error occurred during the search.');
      }
    }
  }
}