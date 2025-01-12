const axios = require('axios');
const gtts = require('gtts');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'lumina',
  description: 'Generate AI response with voice',
  
  async execute(bot, msg, args, db) {
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a message. Usage: /lumina <your message>');
    }

    const query = args.join(' ');

    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
    ];

    const fallbackResponses = [
      "I'm experiencing some technical difficulties. Could you please try again?",
      "Apologies, but I'm unable to process your request right now.",
      "My systems are temporarily unavailable. Please try again later.",
      "Seems like there's a temporary glitch in my network.",
      "I'm having trouble connecting to my knowledge base at the moment."
    ];

    try {
      await bot.sendChatAction(msg.chat.id, 'typing');

      const selectedUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

      const response = await axios.get(`https://myapi-2f5b.onrender.com/aichat`, {
        params: { query: query },
        headers: {
          'User-Agent': selectedUserAgent,
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        }
      });

      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      if (response.data && response.data.response) {
        let aiResponse = response.data.response;
        
        aiResponse = aiResponse.replace(/\*/g, '➤');

        const gttsPath = path.join(tempDir, `lumina_voice_${Date.now()}.mp3`);
        
        function generateVoiceWithSpeed(text, speed = 0.9) {
          return new Promise((resolve, reject) => {
            const tempVoicePath = path.join(tempDir, `lumina_voice_speed_${Date.now()}.mp3`);
            
            const gttsInstance = new gtts(text, 'en-US');
            
            gttsInstance.save(gttsPath, (error) => {
              if (error) {
                reject(error);
                return;
              }

              const { exec } = require('child_process');
              exec(`ffmpeg -i ${gttsPath} -filter:a "atempo=${speed}" ${tempVoicePath}`, 
                (ffmpegError) => {
                  if (ffmpegError) {
                    console.error('Speed modification error:', ffmpegError);
                    resolve(gttsPath);
                    return;
                  }
                  
                  fs.unlinkSync(gttsPath);
                  resolve(tempVoicePath);
                }
              );
            });
          });
        }

        await new Promise(async (resolve, reject) => {
          try {
            const textMessage = await bot.sendMessage(msg.chat.id, aiResponse, {
              reply_to_message_id: msg.message_id
            });

            const voicePath = await generateVoiceWithSpeed(aiResponse);

            await bot.sendVoice(msg.chat.id, voicePath);

            fs.unlinkSync(voicePath);
              
            resolve();
          } catch (sendError) {
            console.error("Message Send Error:", sendError);
            
            await bot.sendMessage(msg.chat.id, aiResponse, {
              reply_to_message_id: msg.message_id
            });
            
            reject(sendError);
          }
        });
      } else {
        const fallbackMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        await bot.sendMessage(msg.chat.id, fallbackMessage, {
          reply_to_message_id: msg.message_id
        });
      }

    } catch (error) {
      console.error('Lumina AI Error:', error);

      const fallbackMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      await bot.sendMessage(msg.chat.id, fallbackMessage, {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
