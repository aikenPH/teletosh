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

      let ownerPhotos;
      let ownerUser;

      try {
        ownerUser = await bot.getChat(ownerId);
      } catch (userError) {
        console.error('Error fetching owner info:', userError);
        ownerUser = { 
          id: ownerId, 
          first_name: 'Bot Owner', 
          username: process.env.OWNER_USERNAME || 'Not Available'
        };
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
        const photoFileId = ownerPhotos.photos[0][0].file_id;
        
        await bot.sendPhoto(msg.chat.id, photoFileId, {
          caption: ownerDetails,
          parse_mode: 'HTML'
        });
      } else {
        await bot.sendMessage(msg.chat.id, '❌ No profile picture found for the owner.', {
          parse_mode: 'HTML'
        });
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
