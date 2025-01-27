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
              ? `• /${command.name} - ${command.description}`
              : '';
          } catch (cmdError) {
            console.error(`Error loading command ${file}:`, cmdError);
            return '';
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
        const sanitizedPageInput = args[0].trim();
        const parsedPage = parseInt(sanitizedPageInput, 10);
        
        if (isNaN(parsedPage) || parsedPage < 1 || sanitizedPageInput !== parsedPage.toString()) {
          const errorMessage = `
❌ <b>Invalid Page Number!</b>

• Please enter a valid number between 1 and ${totalPages}
• Current input: <code>${sanitizedPageInput}</code>
• Usage: /help &lt;page_number&gt;
          `.trim();

          return bot.sendMessage(msg.chat.id, errorMessage, { 
            parse_mode: 'HTML' 
          });
        }

        if (parsedPage > totalPages) {
          const errorMessage = `
❌ <b>Page Number Exceeded!</b>

• Maximum page number is ${totalPages}
• Current input: <code>${parsedPage}</code>
• Available pages: 1 to ${totalPages}
• Usage: /help &lt;page_number&gt;
          `.trim();

          return bot.sendMessage(msg.chat.id, errorMessage, { 
            parse_mode: 'HTML' 
          });
        }

        pageNumber = parsedPage;
      }

      const startIndex = (pageNumber - 1) * commandsPerPage;
      const endIndex = startIndex + commandsPerPage;
      const currentPageCommands = fullCommandList.slice(startIndex, endIndex);

      const helpMessage = `
🤖 <b>TOSHIA Command Center</b> 🌟

<b>Commands (Page ${pageNumber}/${totalPages}):</b>

${currentPageCommands.map(cmd => 
  cmd.replace(/</g, '&lt;').replace(/>/g, '&gt;')
).join('\n')}

<b>Navigate:</b> Use /help &lt;page_number&gt;
<b>Total Commands:</b> ${fullCommandList.length}
      `.trim();

      const helpImageUrl = 'https://i.ibb.co/2669rNr/YAWAAARA.gif';

      try {
        await bot.sendPhoto(msg.chat.id, helpImageUrl, {
          caption: helpMessage,
          parse_mode: 'HTML'
        });
      } catch (photoError) {
        console.error('Error sending help photo:', photoError);
        
        try {
          await bot.sendMessage(msg.chat.id, helpMessage, { 
            parse_mode: 'HTML' 
          });
        } catch (messageError) {
          console.error('Error sending help message:', messageError);
          
          await bot.sendMessage(msg.chat.id, '❌ Failed to send help message. Please try again.', {
            parse_mode: 'HTML'
          });
        }
      }
    } catch (error) {
      console.error('Unexpected error in help command:', error);
      
      try {
        await bot.sendMessage(msg.chat.id, '❌ An unexpected error occurred while fetching help.', { 
          parse_mode: 'HTML' 
        });
      } catch (sendError) {
        console.error('Critical error sending error message:', sendError);
      }
    }
  }
};
