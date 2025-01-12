module.exports = {
  name: 'owner',
  description: 'Get information about the bot owner',
  
  async execute(bot, msg, args, db) {
    try {
      const ownerId = process.env.OWNER_ID 
        ? parseInt(process.env.OWNER_ID) 
        : null;
      
      if (!ownerId) {
        return bot.sendMessage(msg.chat.id, '❌ Owner information is not configured.');
      }

      const profilePhotoUrl = 'https://i.ibb.co/cTcsnr3/IMG-20241217-090531.jpg';

      let ownerUser;
      try {
        ownerUser = await bot.getChat(ownerId);
      } catch (userError) {
        console.error('Error fetching owner info:', userError);
        ownerUser = { 
          id: ownerId, 
          first_name: process.env.OWNER_NAME || 'Bot Owner', 
          username: process.env.OWNER_USERNAME || 'Not Available'
        };
      }

      const ownerDetails = `
📋 <b>Bot Owner Information</b>

👤 Name: ${ownerUser.first_name || ''} ${ownerUser.last_name || ''}
🆔 User ID: <code>${ownerUser.id}</code>
👥 Username: ${ownerUser.username ? '@' + ownerUser.username : 'No username'}

🤖 Bot Ownership:
• Responsible for bot maintenance
• Primary point of contact
• Development and updates

📞 Contact Methods:
• Telegram Direct Message
• Facebook: https://www.facebook.com/JohnDev19
• GitHub: https://github.com/JohnDev19

🌐 Chat Details:
💬 Current Chat ID: <code>${msg.chat.id}</code>
📊 Chat Type: ${msg.chat.type}
      `;

      await bot.sendPhoto(msg.chat.id, profilePhotoUrl, {
        caption: ownerDetails,
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Owner Command Error:', error);
      await bot.sendMessage(msg.chat.id, '❌ An unexpected error occurred while retrieving owner information.');
    }
  }
};
