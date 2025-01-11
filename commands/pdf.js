const axios = require('axios');

module.exports = {
  name: 'pdf',
  description: 'Search and download PDF books',
  async execute(bot, msg, args) {
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a book title. Usage: /pdf <title> [count]');
    }

    const countArg = args[args.length - 1];
    const count = !isNaN(countArg) ? parseInt(countArg) : 3;

    const searchQuery = !isNaN(countArg) 
      ? args.slice(0, -1).join(' ')
      : args.join(' ');

    try {
      const response = await axios.get('https://myapi-2f5b.onrender.com/pdf', {
        params: {
          find: searchQuery,
          count: count
        }
      });

      const pdfResults = response.data.results;

      if (!pdfResults || pdfResults.length === 0) {
        return bot.sendMessage(msg.chat.id, '🔍 No PDF results found.');
      }

      for (const result of pdfResults) {
        try {
          await bot.sendDocument(msg.chat.id, result.url, {
            caption: `
📖 <b>${result.title}</b>

<i>${result.snippet}</i>
            `,
            parse_mode: 'HTML'
          });
        } catch (sendError) {
          console.error(`Error sending PDF: ${result.title}`, sendError);

          await bot.sendMessage(msg.chat.id, `
❌ Could not send PDF: ${result.title}
          `, {
            parse_mode: 'HTML'
          });
        }
      }

    } catch (error) {
      console.error('PDF Search Error:', error);

      if (error.response) {
        bot.sendMessage(msg.chat.id, `
❌ Search failed. 
Status: ${error.response.status}
Message: ${error.response.data.message || 'Unknown error'}
        `);
      } else {
        bot.sendMessage(msg.chat.id, '❌ An error occurred during the PDF search.');
      }
    }
  }
};