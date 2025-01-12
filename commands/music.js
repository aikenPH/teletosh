const axios = require('axios');
const fs = require('fs-extra');
const ytdl = require('youtube-dl-exec');
const yts = require('yt-search');
const path = require('path');

module.exports = {
  name: 'music',
  description: 'Download and send music from YouTube',
  
  async execute(bot, msg, args) {
    if (args.length === 0) {
      return bot.sendMessage(msg.chat.id, 'Please provide a music search term.');
    }

    const searchQuery = args.join(' ');

    try {
      await bot.sendMessage(msg.chat.id, `Searching for music "${searchQuery}". Please wait...`);

      const searchResults = await yts(searchQuery);
      if (!searchResults.videos.length) {
        return bot.sendMessage(msg.chat.id, 'No music found.');
      }

      const music = searchResults.videos[0];
      const musicUrl = music.url;

      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const fileName = `music_${msg.from.id}_${Date.now()}.mp3`;
      const filePath = path.join(tempDir, fileName);

      await ytdl(musicUrl, {
        output: filePath,
        extractAudio: true,
        audioFormat: 'mp3',
        noOverwrites: true,
        noWarnings: true,
        noCheckCertificate: true,
        addHeader: [
          'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
      });

      const fileStats = await fs.stat(filePath);
      if (fileStats.size > 26214400) {
        await fs.unlink(filePath);
        return bot.sendMessage(msg.chat.id, 'The file could not be sent because it is larger than 25MB.');
      }

      const message = `🎵 Here's your music\n\n𝗧𝗜𝗧𝗟𝗘: ${music.title}\n𝗗𝗨𝗥𝗔𝗧𝗜𝗢𝗡: ${music.duration.timestamp}\n𝗩𝗜𝗘𝗪𝗦: ${music.views}`;

      await bot.sendAudio(msg.chat.id, filePath, {
        caption: message,
        reply_to_message_id: msg.message_id
      });

      await fs.unlink(filePath);

    } catch (error) {
      console.error('[ERROR]', error);
      
      const errorMessages = [
        'An error occurred while processing the command.',
        'Unable to download the music. Please try again.',
        'Looks like there was a problem fetching the music.',
        'The music download failed. Please check the link.'
      ];

      const randomErrorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      
      await bot.sendMessage(msg.chat.id, randomErrorMessage, {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
