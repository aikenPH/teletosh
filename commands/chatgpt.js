const axios = require('axios');

module.exports = {
  name: 'chatgpt',
  description: 'Interact with AI assistant',
  async execute(bot, msg, args) {
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a message. Usage: /chatgpt <your message>');
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
      await bot.sendChatAction(msg.chat.id, 'typing');

      const response = await axios.get('https://myapi-2f5b.onrender.com/aichat', {
        params: { query: query }
      });

      const aiResponse = response.data.response;

      await bot.sendMessage(msg.chat.id, aiResponse || fallbackResponses[0], {
        reply_to_message_id: msg.message_id
      });

    } catch (error) {
      console.error('ChatGPT API Error:', error);

      const fallbackMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      if (error.response) {
        console.error('Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }

      await bot.sendMessage(msg.chat.id, fallbackMessage, {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
