const axios = require('axios');

module.exports = {
  name: 'nkiridownload',
  description: 'Get download links for a Nkiri series',
  async execute(bot, msg, args) {
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a Nkiri series URL. Usage: /nkiridownload <url>');
    }

    const url = args[0];

    try {
      const response = await axios.get('https://myapi-2f5b.onrender.com/nkiri/download', {
        params: { url: url }
      });

      const seriesInfo = response.data;

      const seasonedEpisodes = seriesInfo.episodes.reduce((acc, episode) => {
        const seasonMatch = episode.downloadUrl.match(/S0?(\d+)E0?(\d+)/i);
        if (seasonMatch) {
          const [, season, episodeNum] = seasonMatch;
          if (!acc[season]) acc[season] = [];
          acc[season].push({ 
            episodeNum, 
            downloadUrl: episode.downloadUrl 
          });
        }
        return acc;
      }, {});

      let message = `
🎬 <b>${seriesInfo.title}</b>

🔗 <b>Download Links:</b>
`;

      Object.keys(seasonedEpisodes).forEach(season => {
        message += `\n<b>Season ${season}:</b>\n`;
        seasonedEpisodes[season]
          .sort((a, b) => parseInt(a.episodeNum) - parseInt(b.episodeNum))
          .forEach(episode => {
            message += `Episode ${episode.episodeNum}: <code>${episode.downloadUrl}</code>\n\n`;
          });
      });

      await bot.sendMessage(msg.chat.id, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });

    } catch (error) {
      console.error('Nkiri Download Error:', error);

      if (error.response) {
        bot.sendMessage(msg.chat.id, `
❌ Download failed. 
Status: ${error.response.status}
Message: ${error.response.data.message || 'Unknown error'}
        `);
      } else {
        bot.sendMessage(msg.chat.id, '❌ An error occurred while fetching download links.');
      }
    }
  }
};