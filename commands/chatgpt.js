const axios = require('axios');

module.exports = {
  name: 'chatgpt',
  description: 'Interact with AI assistant',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (args.length < 1) {
      return bot.sendMessage(chatId, '❌ Please provide a message. Usage: /chatgpt <your message>');
    }

    const query = args.join(' ');

    const fallbackResponses = [
      "I'm experiencing some technical difficulties. Could you please try again?",
      "Apologies, but I'm unable to process your request right now.",
      "My systems are temporarily unavailable. Please try again later.",
      "Seems like there's a temporary glitch in my network.",
      "I'm having trouble connecting to my knowledge base at the moment."
    ];

    try {
      await bot.sendChatAction(chatId, 'typing');

      const response = await axios.get('https://myapi-2f5b.onrender.com/aichat', {
        params: { query: query }
      });

      const aiResponse = response.data.response;

      const formattedResponse = aiResponse.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `\`\`\`${lang || ''}\n${code}\n\`\`\``;
      });

      const sendOptions = {
        reply_to_message_id: messageId,
        parse_mode: 'Markdown'
      };

      await bot.sendMessage(chatId, formattedResponse || fallbackResponses[0], sendOptions);

    } catch (error) {
      console.error('ChatGPT API Error:', error);

      const fallbackMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      const errorDetails = error.response 
        ? `Status: ${error.response.status}\nDetails: ${JSON.stringify(error.response.data)}` 
        : 'Network or timeout error';

      console.error('Detailed Error:', errorDetails);

      const sendOptions = {
        reply_to_message_id: messageId
      };

      await bot.sendMessage(chatId, fallbackMessage, sendOptions);
    }
  }
};
