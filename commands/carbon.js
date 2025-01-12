const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  name: 'carbon',
  description: 'Generate beautiful code screenshots with advanced customization',
  async execute(bot, msg, args) {
    try {
      // Default configuration
      const config = {
        themes: {
          dracula: { bg: '#282a36', fg: '#f8f8f2' },
          monokai: { bg: '#272822', fg: '#f8f8f2' },
          'night-owl': { bg: '#011627', fg: '#d6deeb' },
          solarized: { bg: '#002b36', fg: '#839496' },
          github: { bg: '#ffffff', fg: '#24292e' },
          'material-dark': { bg: '#263238', fg: '#EEFFFF' },
          'material-light': { bg: '#FAFAFA', fg: '#90A4AE' }
        },
        languages: [
          'javascript', 'python', 'java', 'cpp', 'ruby', 'swift', 
          'kotlin', 'typescript', 'go', 'rust', 'html', 'css', 'sql'
        ],
        defaultTheme: 'dracula',
        maxCodeLength: 2000
      };

      // Show help message if no arguments
      if (args.length === 0) {
        return bot.sendMessage(msg.chat.id, `
💻 <b>Carbon Code Screenshot Generator</b>

<b>Basic Usage:</b>
• /carbon [code] - Generate with default theme
• /carbon [theme] [code] - Generate with specific theme

<b>Advanced Usage:</b>
• /carbon [theme] [language] [code] - Specify language
• /carbon config [theme] - View theme colors
• /carbon themes - List all themes
• /carbon languages - List supported languages

<b>Available Themes:</b>
${Object.keys(config.themes).map(theme => `• ${theme}`).join('\n')}

<b>Examples:</b>
• /carbon console.log('Hello!')
• /carbon dracula print("Hello!")
• /carbon github javascript console.log('Hi!')

<b>Max Code Length:</b> ${config.maxCodeLength} characters
`, { parse_mode: 'HTML' });
      }

      // Handle special commands
      if (args[0] === 'themes') {
        return bot.sendMessage(msg.chat.id, `
<b>Available Themes:</b>
${Object.entries(config.themes)
  .map(([theme, colors]) => `• ${theme}\n  └ BG: ${colors.bg} | FG: ${colors.fg}`)
  .join('\n')}
`, { parse_mode: 'HTML' });
      }

      if (args[0] === 'languages') {
        return bot.sendMessage(msg.chat.id, `
<b>Supported Languages:</b>
${config.languages.map(lang => `• ${lang}`).join('\n')}
`, { parse_mode: 'HTML' });
      }

      if (args[0] === 'config' && args[1]) {
        const theme = config.themes[args[1]];
        if (!theme) {
          return bot.sendMessage(msg.chat.id, '❌ Theme not found.');
        }
        return bot.sendMessage(msg.chat.id, `
<b>Theme Configuration: ${args[1]}</b>
• Background: ${theme.bg}
• Foreground: ${theme.fg}
`, { parse_mode: 'HTML' });
      }

      // Parse arguments
      let theme = config.defaultTheme;
      let language = 'auto';
      let code = args.join(' ');

      // Check if first argument is a theme
      if (config.themes[args[0]]) {
        theme = args[0];
        code = args.slice(1).join(' ');
      }

      // Check if second argument is a language
      if (config.languages.includes(args[1])) {
        language = args[1];
        code = args.slice(2).join(' ');
      }

      // Validate code
      if (!code.trim()) {
        return bot.sendMessage(msg.chat.id, '❌ Please provide valid code to generate screenshot.');
      }

      if (code.length > config.maxCodeLength) {
        return bot.sendMessage(msg.chat.id, `❌ Code exceeds ${config.maxCodeLength} characters limit.`);
      }

      // Loading message
      const loadingMsg = await bot.sendMessage(msg.chat.id, '🔄 Generating code screenshot...');

      // Carbon API configuration
      const carbonConfig = {
        code: code,
        theme: theme,
        backgroundColor: config.themes[theme].bg,
        language: language,
        paddingVertical: '56px',
        paddingHorizontal: '56px',
        dropShadow: true,
        dropShadowOffset: '10px',
        dropShadowBlurRadius: '68px',
        windowTheme: 'none',
        windowControls: true,
        widthAdjustment: true,
        width: 680
      };

      // Multiple API endpoints for redundancy
      const carbonAPIs = [
        'https://carbonara.solopov.dev/api/cook',
        'https://carbon-api.vercel.app/api/carbon',
        'https://carbonara-api.now.sh/api/cook'
      ];

      let imageData = null;
      let usedAPI = null;
      let apiErrors = [];

      for (const apiUrl of carbonAPIs) {
        try {
          const formData = new FormData();
          Object.entries(carbonConfig).forEach(([key, value]) => {
            formData.append(key, value);
          });

          const response = await axios.post(apiUrl, formData, {
            headers: {
              ...formData.getHeaders(),
              'User-Agent': 'TelegramBot/1.0'
            },
            responseType: 'arraybuffer',
            timeout: 15000
          });

          if (response.data && response.data.byteLength > 0) {
            imageData = response.data;
            usedAPI = apiUrl;
            break;
          }
        } catch (apiError) {
          apiErrors.push(`${apiUrl}: ${apiError.message}`);
          continue;
        }
      }

      // Delete loading message
      await bot.deleteMessage(msg.chat.id, loadingMsg.message_id);

      if (!imageData) {
        return bot.sendMessage(msg.chat.id, `
❌ <b>Screenshot Generation Failed</b>
• All APIs returned errors
• Please try again later

<b>Debug Info:</b>
${apiErrors.map(err => `• ${err}`).join('\n')}
`, { parse_mode: 'HTML' });
      }

      // Send the generated image
      await bot.sendPhoto(msg.chat.id, imageData, {
        caption: `
🎨 <b>Code Screenshot Generated</b>
• Theme: ${theme}
• Language: ${language}
• API: ${new URL(usedAPI).hostname}
• Size: ${(imageData.length / 1024).toFixed(1)}KB
`,
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Carbon Command Error:', error);
      
      let errorMessage = `
❌ <b>Error Generating Screenshot</b>
• Type: ${error.name}
• Message: ${error.message}
`;

      if (error.response) {
        errorMessage += `
<b>API Response:</b>
• Status: ${error.response.status}
• Status Text: ${error.response.statusText}
`;
      }

      bot.sendMessage(msg.chat.id, errorMessage, { parse_mode: 'HTML' });
    }
  }
};
