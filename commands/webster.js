const axios = require('axios');

module.exports = {
  name: 'webster',
  description: 'Retrieve dictionary information for a word',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;

    if (args.length === 0) {
      await bot.sendMessage(chatId, `
🔍 <b>Webster Dictionary Lookup</b>

Usage: /webster [word]
Example: /webster science

Please provide a word to look up!
      `, { parse_mode: 'HTML' });
      return;
    }

    const word = args[0].toLowerCase();

    try {
      await bot.sendChatAction(chatId, 'typing');
      
      const response = await axios.get(`https://myapi-2f5b.onrender.com/webster/${word}`);
      const data = response.data;

      let messageText = `
<b>📘 Dictionary Entry: ${data.word.toUpperCase()}</b>

${data.partOfSpeech ? `<i>Part of Speech:</i> <b>${data.partOfSpeech}</b>\n` : ''}

${data.pronunciation ? `<b>📣 Pronunciation:</b>
• Spelled: <code>${data.pronunciation.spelled || 'N/A'}</code>
• Phonetic: <i>${data.pronunciation.phonetic || 'N/A'}</i>\n` : ''}

${data.definitions?.length > 0 ? `🔍 <b>Definitions:</b>
${data.definitions.map((def, index) => `${index + 1}. <i>${def}</i>`).join('\n')}\n` : ''}

${data.examples?.length > 0 ? `💡 <b>Example Usages:</b>
${data.examples.slice(0, 3).map((example, index) => `• <i>${example}</i>`).join('\n')}\n` : ''}

${data.pronunciation?.audioUrl ? `🔗 <a href="${data.pronunciation.audioUrl}">Listen to Pronunciation</a>` : ''}
      `.trim();

      if (data.wordOfTheDay) {
        messageText += `\n\n🌟 <b>Word of the Day:</b>
• ${data.wordOfTheDay.word}
• <a href="${data.wordOfTheDay.url}">Learn More</a>`;
      }

      await bot.sendMessage(chatId, messageText, {
        parse_mode: 'HTML',
        disable_web_page_preview: false
      });

    } catch (error) {
      console.error('Webster Dictionary Error:', error);
      
      const errorMessage = error.response?.status === 404 
        ? `❌ Word not found: <b>${word}</b>\nPlease check the spelling.`
        : '❌ An error occurred while fetching dictionary data. Please try again later.';

      await bot.sendMessage(chatId, errorMessage, { parse_mode: 'HTML' });
    }
  }
};
