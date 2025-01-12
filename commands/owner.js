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

      let ownerUser;
      let ownerPhotos;

      try {
        const chatMembers = await bot.getChatAdministrators(msg.chat.id);
        const foundMember = chatMembers.find(member => 
          member.user.id === ownerId
        );

        ownerUser = foundMember 
          ? foundMember.user 
          : { id: ownerId, first_name: 'Bot Owner' };

      } catch (memberError) {
        console.error('Member search error:', memberError);
        ownerUser = { id: ownerId, first_name: 'Bot Owner' };
      }

      try {
        ownerPhotos = await bot.getUserProfilePhotos(ownerId);
      } catch (photoError) {
        console.error('Profile photo error:', photoError);
        ownerPhotos = null;
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
• Username: ${ownerUser.username ? '@' + ownerUser.username : 'Not Available'}

🌐 Chat Details:
💬 Current Chat ID: <code>${msg.chat.id}</code>
📊 Chat Type: ${msg.chat.type}
      `;

      if (ownerPhotos && ownerPhotos.photos.length > 0) {
        await bot.sendPhoto(msg.chat.id, ownerPhotos.photos[0][0].file_id, {
          caption: ownerDetails,
          parse_mode: 'HTML'
        });
      } else {
        await bot.sendMessage(msg.chat.id, ownerDetails, {
          parse_mode: 'HTML'
        });
      }

    } catch (error) {
      console.error('Owner Command Error:', error);
      await bot.sendMessage(msg.chat.id, '❌ An unexpected error occurred while retrieving owner information.');
    }
  }
};
