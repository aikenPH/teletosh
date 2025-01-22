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
      const response = await axios.get(`https://myapi-2f5b.onrender.com/webster/${word}`);
      const data = response.data;

      let messageText = `
<b>📘 Dictionary Entry: ${data.word.toUpperCase()}</b>

<i>Part of Speech:</i> ${data.partOfSpeech}

<b>📣 Pronunciation:</b>
• Spelled: <code>${data.pronunciation.spelled}</code>
• Phonetic: <i>${data.pronunciation.phonetic}</i>

🔍 <b>Definitions:</b>
${data.definitions.map((def, index) => `${index + 1}. ${def}`).join('\n')}

💡 <b>Example Usages:</b>
${data.examples.slice(0, 3).map((example, index) => `• ${example}`).join('\n')}

🔗 <a href="${data.pronunciation.audioUrl}">Listen to Pronunciation</a>
      `;

      // Optional: Word of the Day section
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
        : '❌ An error occurred while fetching dictionary data.';

      await bot.sendMessage(chatId, errorMessage, { parse_mode: 'HTML' });
    }
  }
};
