const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

module.exports = {
  name: 'music',
  description: 'Download and send music from YouTube',
  
  async execute(bot, msg, args) {
    if (args.length === 0) {
      return bot.sendMessage(msg.chat.id, 'Please provide a music search term.');
    }

    const query = args.join(' ');
    const YOUTUBE_API_KEY = 'AIzaSyBuIbW42nk2hPliq7Uci1qsCwHQ0A5-3tU';

    try {
      // Send initial searching message
      const searchingMessage = await bot.sendMessage(msg.chat.id, `🔍 Searching for "${query}"...`);

      // YouTube Search API Request
      const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          key: YOUTUBE_API_KEY,
          maxResults: 1,
          videoEmbeddable: true,
          videoSyndicated: true
        }
      });

      // Check search results
      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        await bot.deleteMessage(msg.chat.id, searchingMessage.message_id);
        return bot.sendMessage(msg.chat.id, 'No music found matching your search.');
      }

      // Get first video details
      const video = searchResponse.data.items[0];
      const videoId = video.id.videoId;
      const videoTitle = video.snippet.title.replace(/[^a-zA-Z0-9 ]/g, '');

      // Delete searching message
      await bot.deleteMessage(msg.chat.id, searchingMessage.message_id);

      // Send processing message
      const processingMessage = await bot.sendMessage(msg.chat.id, '⏳ Processing music download...');

      // Prepare temporary directory
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      // Prepare file paths
      const fileName = `${videoTitle}_${Date.now()}.mp3`;
      const filePath = path.join(tempDir, fileName);

      // Download and convert
      await new Promise((resolve, reject) => {
        const stream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, { 
          quality: 'highestaudio' 
        });

        ffmpeg(stream)
          .audioBitrate(128)
          .toFormat('mp3')
          .save(filePath)
          .on('end', () => {
            console.log('Audio download complete');
            resolve();
          })
          .on('error', (err) => {
            console.error('Conversion error:', err);
            reject(err);
          });
      });

      // Check file size
      const fileStats = await fs.stat(filePath);
      if (fileStats.size > 52428800) { // 50 MB limit
        await fs.unlink(filePath);
        await bot.deleteMessage(msg.chat.id, processingMessage.message_id);
        return bot.sendMessage(msg.chat.id, 'The file is too large to send.');
      }

      // Prepare caption
      const caption = `🎵 Music Track\n📌 Title: ${videoTitle}`;

      // Send audio file
      await bot.sendAudio(msg.chat.id, filePath, {
        caption: caption,
        reply_to_message_id: msg.message_id
      });

      // Delete processing message
      await bot.deleteMessage(msg.chat.id, processingMessage.message_id);

      // Clean up temporary file
      await fs.unlink(filePath);

    } catch (error) {
      console.error('[Music Download Error]', error);
      
      const errorMessages = [
        'An error occurred while downloading the track.',
        'Unable to download the music. Please try again.',
        'Looks like there was a problem fetching the song.',
        'The music download failed. Please check the track name.'
      ];

      const randomErrorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      
      await bot.sendMessage(msg.chat.id, randomErrorMessage, {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
