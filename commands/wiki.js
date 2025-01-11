const axios = require('axios');

module.exports = {
  name: 'wiki',
  description: 'Search Wikipedia for a topic',
  async execute(bot, msg, args) {
    if (args.length === 0) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a search term. Usage: /wiki [topic]');
    }

    const searchTerm = args.join(' ');

    try {
      const searchResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          format: 'json',
          list: 'search',
          srsearch: searchTerm,
          srlimit: 1
        }
      });

      const pageId = searchResponse.data.query.search[0].pageid;

      const pageResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          format: 'json',
          pageids: pageId,
          prop: 'extracts|pageimages|info',
          exintro: true,
          explaintext: true,
          pithumbsize: 500,
          inprop: 'url'
        }
      });

      const pageData = pageResponse.data.query.pages[pageId];

      const fullSummary = pageData.extract;
      const truncatedSummary = fullSummary.split('.').slice(0, 3).join('.') + '...';

      const wikiMessage = `
📚 <b>Wikipedia: ${pageData.title}</b>

${truncatedSummary}

<b>📌 Read More:</b> <a href="${pageData.fullurl}">Full Wikipedia Article</a>
      `;

      if (pageData.thumbnail) {
        await bot.sendPhoto(msg.chat.id, pageData.thumbnail.source, {
          caption: wikiMessage,
          parse_mode: 'HTML'
        });
      } else {
        await bot.sendMessage(msg.chat.id, wikiMessage, {
          parse_mode: 'HTML',
          disable_web_page_preview: false
        });
      }

    } catch (error) {
      console.error('Wikipedia Search Error:', error);

      const fallbackMessage = `
❌ <b>Search Error</b>

Unable to find information about "${searchTerm}". 
Some possible reasons:
• Topic might not exist
• Spelling error
• Very specific or obscure topic

Try a different search term or check spelling.
      `;

      bot.sendMessage(msg.chat.id, fallbackMessage, { 
        parse_mode: 'HTML' 
      });
    }
  }
};