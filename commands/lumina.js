const axios = require('axios');
const gtts = require('gtts');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'lumina',
  description: 'Generate AI response with voice',
  
  async execute(bot, msg, args, db) {
    let counter = 1;

    function filterContent(content) {
      return content
        .replace(/\/\*/g, "   ➤")
        .replace(/\*/g, () => counter++);
    }

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
      // Send typing action
      await bot.sendChatAction(msg.chat.id, 'typing');

      // Fetch AI response
      const response = await axios.get(`https://myapi-2f5b.onrender.com/aichat`, {
        params: { query: query },
        headers: {
          'User-Agent': 'Lumina Telegram Bot/1.0',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      // Ensure temp directory exists
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      // Prepare response
      if (response.data && response.data.response) {
        const aiResponse = response.data.response;
        const filteredAnswer = filterContent(aiResponse);

        // Generate unique filename
        const gttsPath = path.join(tempDir, `lumina_voice_${Date.now()}.mp3`);
        
        // Create GTTS instance
        const gttsInstance = new gtts(filteredAnswer, 'en-US', true, 0.50);

        // Save and send voice
        await new Promise((resolve, reject) => {
          gttsInstance.save(gttsPath, async (error) => {
            if (error) {
              console.error("Voice Generation Error:", error);
              
              // Fallback to text message if voice fails
              await bot.sendMessage(msg.chat.id, filteredAnswer, {
                reply_to_message_id: msg.message_id
              });
              
              reject(error);
              return;
            }

            try {
              // Send voice message
              await bot.sendVoice(msg.chat.id, gttsPath, {
                caption: filteredAnswer,
                reply_to_message_id: msg.message_id
              });

              // Clean up temporary file
              fs.unlinkSync(gttsPath);
              
              resolve();
            } catch (sendError) {
              console.error("Message Send Error:", sendError);
              
              // Fallback to text message
              await bot.sendMessage(msg.chat.id, filteredAnswer, {
                reply_to_message_id: msg.message_id
              });
              
              reject(sendError);
            }
          });
        });
      } else {
        // Fallback response if no data received
        const fallbackMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        await bot.sendMessage(msg.chat.id, fallbackMessage, {
          reply_to_message_id: msg.message_id
        });
      }

    } catch (error) {
      console.error('Lumina AI Error:', error);

      // Select and send a random fallback response
      const fallbackMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      await bot.sendMessage(msg.chat.id, fallbackMessage, {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
