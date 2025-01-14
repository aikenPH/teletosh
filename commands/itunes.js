const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'itunessearch',
  description: 'Advanced iTunes Search with Robust Media Preview',
  async execute(bot, msg, args) {
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a search term. Usage: /itunessearch <term>');
    }

    const query = args.join(' ');
    const chatId = msg.chat.id;

    try {
      const response = await axios.get('https://myapi-2f5b.onrender.com/itunes/general', {
        params: { term: query }
      });

      // Find most relevant result (song or music video)
      const result = response.data.find(item => 
        item.wrapperType === 'track' && 
        (item.kind === 'song' || item.kind === 'music-video')
      );

      if (!result) {
        return bot.sendMessage(chatId, '🔍 No music or video results found.');
      }

      // Construct detailed caption
      const caption = `
<b>🎵 iTunes Search Result</b>

<b>Artist:</b> ${escapeHtml(result.artistName)}
<b>Track:</b> ${escapeHtml(result.trackName)}
<b>Album:</b> ${escapeHtml(result.collectionName)}
<b>Type:</b> ${result.kind === 'song' ? 'Audio' : 'Music Video'}
<b>Genre:</b> ${escapeHtml(result.primaryGenreName)}
<b>Released:</b> ${new Date(result.releaseDate).getFullYear()}
<b>Duration:</b> ${formatDuration(result.trackTimeMillis)}

<i>Visit:</i> <a href="${result.trackViewUrl}">iTunes Link</a>
      `.trim();

      // Media options
      const mediaOptions = {
        caption: caption,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      };

      // Determine media type and send
      if (result.previewUrl) {
        try {
          // Download and process media file
          const mediaPath = await downloadMedia(result.previewUrl, result.kind);
          
          if (result.kind === 'song') {
            await bot.sendAudio(chatId, mediaPath, mediaOptions);
          } else if (result.kind === 'music-video') {
            await bot.sendVideo(chatId, mediaPath, mediaOptions);
          }

          // Clean up temporary file
          fs.unlinkSync(mediaPath);
        } catch (mediaError) {
          console.error('Media Processing Error:', mediaError);
          await bot.sendMessage(chatId, '❌ Unable to process media preview.', { parse_mode: 'HTML' });
        }
      } else {
        // Fallback if no preview available
        await bot.sendMessage(chatId, caption, { 
          parse_mode: 'HTML',
          disable_web_page_preview: true 
        });
      }

    } catch (error) {
      console.error('iTunes Search Error:', error);
      bot.sendMessage(chatId, '❌ Unable to perform iTunes search.', { parse_mode: 'HTML' });
    }
  }
};

// Download media with enhanced format handling
function downloadMedia(url, mediaType) {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(__dirname, 'temp');
    
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Determine file extension
    const fileExtension = getFileExtension(url, mediaType);
    const tempFilePath = path.join(tempDir, `media_preview_${Date.now()}${fileExtension}`);

    // Create write stream
    const writeStream = fs.createWriteStream(tempFilePath);

    // Download file
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadMedia(response.headers.location, mediaType)
          .then(resolve)
          .catch(reject);
      }

      // Pipe response to file
      response.pipe(writeStream);

      // Handle completion
      writeStream.on('finish', () => {
        writeStream.close();
        resolve(tempFilePath);
      });
    }).on('error', (err) => {
      fs.unlink(tempFilePath, () => reject(err));
    });
  });
}

// Determine appropriate file extension
function getFileExtension(url, mediaType) {
  // Check URL for existing extension
  const urlExt = path.extname(url);
  if (urlExt) return urlExt;

  // Default extensions based on media type
  switch (mediaType) {
    case 'song':
      return '.mp3';
    case 'music-video':
      return '.mp4';
    default:
      return '.m4a';
  }
}

// Utility function to format duration
function formatDuration(ms) {
  if (!ms) return 'N/A';
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// HTML escape function
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
