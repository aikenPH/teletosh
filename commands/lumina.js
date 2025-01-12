const axios = require('axios');
const gtts = require('node-gtts')('en');
const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'lumina',
  description: 'Interact with Lumina AI assistant',
  async execute(bot, msg, args) {
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a message. Usage: /lumina <your message>');
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
      const responseText = aiResponse || fallbackResponses[0];

      // Create voice response
      const voiceFilePath = await convertTextToSpeech(responseText);

      // Send voice message
      await bot.sendVoice(msg.chat.id, voiceFilePath, {
        caption: responseText,
        reply_to_message_id: msg.message_id
      });

      // Clean up the temporary voice file
      fs.unlinkSync(voiceFilePath);

    } catch (error) {
      console.error('Lumina AI Error:', error);

      const fallbackMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      if (error.response) {
        console.error('Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }

      try {
        // Create voice response for fallback message
        const voiceFilePath = await convertTextToSpeech(fallbackMessage);

        // Send voice message
        await bot.sendVoice(msg.chat.id, voiceFilePath, {
          caption: fallbackMessage,
          reply_to_message_id: msg.message_id
        });

        // Clean up the temporary voice file
        fs.unlinkSync(voiceFilePath);

      } catch (voiceError) {
        console.error('Voice Conversion Error:', voiceError);
        await bot.sendMessage(msg.chat.id, fallbackMessage, {
          reply_to_message_id: msg.message_id
        });
      }
    }
  }
};

// Text to Speech Conversion Function
function convertTextToSpeech(text) {
  return new Promise((resolve, reject) => {
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Generate unique filename
    const fileName = `lumina_voice_${Date.now()}.mp3`;
    const filePath = path.join(tempDir, fileName);

    // Convert text to speech
    gtts.save(filePath, text, (err) => {
      if (err) {
        console.error('Text to Speech Conversion Error:', err);
        reject(err);
      } else {
        resolve(filePath);
      }
    });
  });
}
