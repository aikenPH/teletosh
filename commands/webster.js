module.exports = {
  name: 'webster',
  description: 'Comprehensive dictionary lookup with rich visualization',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;

    if (args.length === 0) {
      await bot.sendMessage(chatId, `
🔍 <b>Webster Dictionary Assistant</b>

Hey there! I'm your friendly dictionary companion. 
Need help finding a word's meaning? Just use:

/webster [word]

Example: 
• <code>/webster science</code>
• <code>/webster serendipity</code>

I'll provide:
✨ Detailed definitions
🔊 Pronunciation guide
📝 Example sentences
🌈 Rich formatting

Ready to explore language? Let's go! 📚
      `, { 
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎲 Random Word', callback_data: 'random_word' }],
            [{ text: '📖 Word of the Day', callback_data: 'word_of_day' }]
          ]
        }
      });
      return;
    }

    const word = args[0].toLowerCase();

    try {
      const response = await axios.get(`https://myapi-2f5b.onrender.com/webster/${word}`);
      const data = response.data;

      // Create visually appealing message
      const messageText = `
🌟 <b>${data.word.toUpperCase()} DICTIONARY ENTRY</b> 🌟

📊 <b>Word Profile</b>
• <i>Part of Speech:</i> ${data.partOfSpeech}
• <i>Linguistic Category:</i> Reference Term

🔊 <b>Pronunciation Guide</b>
• <code>📝 Spelled: ${data.pronunciation.spelled}</code>
• <code>🔉 Phonetic: ${data.pronunciation.phonetic}</code>

🧠 <b>Comprehensive Definitions</b>
${data.definitions.slice(0, 5).map((def, index) => 
  `${index + 1}. <i>${def}</i>`
).join('\n')}

💬 <b>Real-World Examples</b>
${data.examples.slice(0, 3).map((example, index) => 
  `• "<i>${example}</i>"`
).join('\n')}

🔗 Quick Links:
• <a href="${data.pronunciation.audioUrl}">🎧 Listen to Pronunciation</a>
• <a href="https://www.merriam-webster.com/dictionary/${word}">📖 Full Dictionary Entry</a>

<i>Linguistically yours,</i>
<b>Webster Bot 🤖</b>
      `;

      // Send message with enhanced design
      await bot.sendMessage(chatId, messageText, {
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔍 More Definitions', callback_data: `more_defs_${word}` },
              { text: '📝 Example Sentences', callback_data: `more_examples_${word}` }
            ]
          ]
        }
      });

    } catch (error) {
      console.error('Webster Dictionary Error:', error);
      
      const errorMessages = [
        "Oops! 🕵️ I couldn't find that word in my magical dictionary.",
        "Hmm... 🤔 This word seems to be playing hide and seek!",
        "Looks like we've encountered a linguistic mystery! 🧩"
      ];

      const randomErrorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];

      const errorResponse = `
❌ <b>Word Not Found</b>

${randomErrorMessage}

Tips from your dictionary buddy:
• Double-check spelling
• Try alternative word forms
• Use common dictionary words

Want to try again? Just type:
<code>/webster [your word]</code>

Need inspiration? Try:
• science
• serendipity
• eloquent

Linguistically yours,
<b>Webster Bot 🤖</b>
      `;

      await bot.sendMessage(chatId, errorResponse, { 
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎲 Random Word', callback_data: 'random_word' }],
            [{ text: '🔍 Try Again', callback_data: 'retry_dictionary' }]
          ]
        }
      });
    }
  }
};
