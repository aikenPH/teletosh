const ytdl = require('ytdl-core');
const ytpl = require('ytpl');

module.exports = {
  name: 'musicinfo',
  description: 'Get music information from YouTube',
  
  async execute(bot, msg, args) {
    if (args.length === 0) {
      return bot.sendMessage(msg.chat.id, 'Please provide a YouTube URL or search term.');
    }

    const input = args.join(' ');

    try {
      let songInfo;

      // Check if input is a valid YouTube URL
      if (ytdl.validateURL(input)) {
        songInfo = await ytdl.getInfo(input);
        const title = songInfo.videoDetails.title;
        const artist = songInfo.videoDetails.author.name;
        const duration = this.formatDuration(songInfo.videoDetails.lengthSeconds);
        const views = this.formatViews(songInfo.videoDetails.viewCount);

        const message = `🎵 Music Information:\n\n` +
                        `📌 Title: ${title}\n` +
                        `👤 Artist: ${artist}\n` +
                        `⏱️ Duration: ${duration}\n` +
                        `👀 Views: ${views}`;

        await bot.sendMessage(msg.chat.id, message, {
          reply_to_message_id: msg.message_id
        });
      } else {
        // If not a URL, search for the first result
        const searchResults = await ytpl.search(input, { limit: 1 });
        
        if (searchResults.length === 0) {
          return bot.sendMessage(msg.chat.id, 'No music found.');
        }

        const song = searchResults[0];
        const message = `🎵 Music Information:\n\n` +
                        `📌 Title: ${song.title}\n` +
                        `👤 Artist: ${song.author.name}\n` +
                        `⏱️ Duration: ${song.duration || 'N/A'}\n` +
                        `👀 Views: ${this.formatViews(song.views)}`;

        await bot.sendMessage(msg.chat.id, message, {
          reply_to_message_id: msg.message_id
        });
      }

    } catch (error) {
      console.error('[ERROR]', error);
      
      const errorMessages = [
        'An error occurred while fetching music information.',
        'Unable to retrieve music details. Please try again.',
        'Looks like there was a problem finding the music information.',
        'The music information retrieval failed. Please check the link.'
      ];

      const randomErrorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      
      await bot.sendMessage(msg.chat.id, randomErrorMessage, {
        reply_to_message_id: msg.message_id
      });
    }
  },

  // Helper method to format duration
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  // Helper method to format view count
  formatViews(views) {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  }
};
