const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Show available commands with pagination',
  async execute(bot, msg, args) {
    try {
      const commandsPath = path.join(__dirname, '../commands');
      
      if (!fs.existsSync(commandsPath)) {
        return bot.sendMessage(msg.chat.id, '❌ Commands directory not found!', { parse_mode: 'HTML' });
      }

      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

      if (commandFiles.length === 0) {
        return bot.sendMessage(msg.chat.id, '❌ No command files found!', { parse_mode: 'HTML' });
      }

      const fullCommandList = commandFiles
        .map(file => {
          try {
            const command = require(path.join(commandsPath, file));
            return command.name && command.description 
              ? {
                  name: command.name,
                  description: command.description
                }
              : null;
          } catch (cmdError) {
            console.error(`Error loading command ${file}:`, cmdError);
            return null;
          }
        })
        .filter(Boolean);

      if (fullCommandList.length === 0) {
        return bot.sendMessage(msg.chat.id, '❌ No valid commands found!', { parse_mode: 'HTML' });
      }

      const commandsPerPage = 5;
      const totalPages = Math.ceil(fullCommandList.length / commandsPerPage);

      let pageNumber = 1;
      if (args[0]) {
        const parsedPage = parseInt(args[0], 10);
        if (isNaN(parsedPage) || parsedPage < 1) {
          return bot.sendMessage(msg.chat.id, `
<b>❌ Invalid Page Number!</b>
• Please enter a valid number
• Total Pages: ${totalPages}
• Usage: /help <page_number>
          `, { parse_mode: 'HTML' });
        }
        pageNumber = parsedPage > totalPages ? totalPages : parsedPage;
      }

      const startIndex = (pageNumber - 1) * commandsPerPage;
      const endIndex = startIndex + commandsPerPage;
      const currentPageCommands = fullCommandList.slice(startIndex, endIndex);

      const helpMessage = `
🤖 <b>Lumina Bot Command Center</b> 🌟

<b>Commands (Page ${pageNumber}/${totalPages}):</b>

${currentPageCommands.map(cmd => `• <b>/${cmd.name}</b> - ${cmd.description}`).join('\n')}

<b>Navigate:</b> Use /help &lt;page_number&gt;
<b>Total Commands:</b> ${fullCommandList.length}
      `;

      const helpImageUrl = 'https://i.ibb.co/3YN5ggW/lumina.jpg';

      const inlineKeyboard = {
        inline_keyboard: currentPageCommands.map(cmd => [
          {
            text: `/${cmd.name}`,
            switch_inline_query_current_chat: cmd.name
          }
        ])
      };

      try {
        await bot.sendPhoto(msg.chat.id, helpImageUrl, {
          caption: helpMessage,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard
        });
      } catch (photoError) {
        console.error('Error sending help photo:', photoError);
        await bot.sendMessage(msg.chat.id, helpMessage, {
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard
        });
      }

      bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const commandName = callbackQuery.data;

        await bot.answerCallbackQuery(callbackQuery.id);
        await bot.sendMessage(chatId, `Please enter a query for /${commandName}`);
      });

    } catch (error) {
      console.error('Unexpected error in help command:', error);
      await bot.sendMessage(msg.chat.id, '❌ An unexpected error occurred while fetching help.', { parse_mode: 'HTML' });
    }
  }
};
