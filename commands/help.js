const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Show available commands with pagination',
  async execute(bot, msg, args) {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    const fullCommandList = commandFiles
      .map(file => {
        const command = require(path.join(commandsPath, file));
        return command.name && command.description 
          ? `• <b>/${command.name}</b> - ${command.description}`
          : '';
      })
      .filter(Boolean);

    const commandsPerPage = 5;
    const totalPages = Math.ceil(fullCommandList.length / commandsPerPage);

    const pageNumber = args[0] ? parseInt(args[0]) : 1;

    if (pageNumber < 1 || pageNumber > totalPages) {
      return bot.sendMessage(msg.chat.id, `
<b>❌ Invalid Page Number!</b>
Total Pages: ${totalPages}
Usage: /help <page_number>
      `, { parse_mode: 'HTML' });
    }

    const startIndex = (pageNumber - 1) * commandsPerPage;
    const endIndex = startIndex + commandsPerPage;
    const currentPageCommands = fullCommandList.slice(startIndex, endIndex);

    const helpMessage = `
🤖 <b>Lumina Bot Command Center</b> 🌟

<b>Commands (Page ${pageNumber}/${totalPages}):</b>

${currentPageCommands.join('\n')}

<b>Navigate:</b> Use /help &lt;page_number&gt;
\n<b>Total Commands:</b> ${fullCommandList.length}
    `;

    const helpImageUrl = 'https://i.ibb.co/3YN5ggW/lumina.jpg';

    try {
      await bot.sendPhoto(msg.chat.id, helpImageUrl, {
        caption: helpMessage,
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Error sending help photo:', error);
      await bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'HTML' });
    }
  }
};