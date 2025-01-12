const axios = require('axios');
const fs = require('fs-extra');
const ytdl = require('@distube/ytdl-core');
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

      const stream = ytdl(musicUrl, { filter: 'audioonly' });

      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const fileName = `music_${msg.from.id}_${Date.now()}.mp3`;
      const filePath = path.join(tempDir, fileName);

      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);

      stream.on('response', () => {
        console.info('[DOWNLOADER]', 'Starting download now!');
      });

      stream.on('info', (info) => {
        console.info('[DOWNLOADER]', `Downloading music: ${info.videoDetails.title}`);
      });

      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      if (fs.statSync(filePath).size > 26214400) {
        fs.unlinkSync(filePath);
        return bot.sendMessage(msg.chat.id, 'The file could not be sent because it is larger than 25MB.');
      }

      const message = `🎵 Here's your music\n\n𝗧𝗜𝗧𝗟𝗘: ${music.title}\n𝗗𝗨𝗥𝗔𝗧𝗜𝗢𝗡: ${music.duration.timestamp}\n𝗩𝗜𝗘𝗪𝗦: ${music.views}`;

      await bot.sendAudio(msg.chat.id, filePath, {
        caption: message,
        reply_to_message_id: msg.message_id
      });

      // Clean up the temporary file
      fs.unlinkSync(filePath);

    } catch (error) {
      console.error('[ERROR]', error);
      await bot.sendMessage(msg.chat.id, 'An error occurred while processing the command.');
    }
  }
};
