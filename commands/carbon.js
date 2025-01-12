const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  name: 'carbon',
  description: 'Generate beautiful code screenshots',
  async execute(bot, msg, args) {
    try {
      if (args.length === 0) {
        return bot.sendMessage(msg.chat.id, `
❌ <b>Invalid Carbon Usage!</b>

• Provide code to generate a beautiful screenshot
• Supported Languages: JavaScript, Python, Java, C++, Ruby, Swift, Kotlin, TypeScript, Go, Rust

<b>Usage Examples:</b>
• /carbon console.log('Hello World!')
• /carbon def greet():
    print("Hello, World!")

<b>Optional Themes:</b>
• Add theme after code: /carbon [theme] [code]
• Available Themes: dracula, monokai, night-owl, solarized
        `, { parse_mode: 'HTML' });
      }

      let theme = 'dracula';
      let code = args.join(' ');

      const themeOptions = ['dracula', 'monokai', 'night-owl', 'solarized'];
      if (themeOptions.includes(args[0])) {
        theme = args[0];
        code = args.slice(1).join(' ');
      }

      if (!code.trim()) {
        return bot.sendMessage(msg.chat.id, '❌ Please provide valid code to generate screenshot.', { parse_mode: 'HTML' });
      }

      const formData = new FormData();
      formData.append('code', code);
      formData.append('theme', theme);
      formData.append('background', 'rgba(171, 184, 195, 1)');
      formData.append('language', 'auto');
      formData.append('padding', '56');
      formData.append('exportSize', '4x');

      const response = await axios.post('https://carbonara.solopov.dev/api/cook', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        responseType: 'arraybuffer'
      });

      await bot.sendPhoto(msg.chat.id, response.data, {
        caption: `🖼️ Carbon Screenshot (${theme} theme)`,
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Carbon Generation Error:', error);
      
      let errorMessage = '❌ Failed to generate code screenshot.';
      
      if (error.response) {
        errorMessage += `\n\n<b>Error Details:</b>
• Status: ${error.response.status}
• Message: ${error.response.statusText}`;
      }

      bot.sendMessage(msg.chat.id, errorMessage, { parse_mode: 'HTML' });
    }
  }
};
