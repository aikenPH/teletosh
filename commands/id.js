module.exports = {
  name: 'id',
  description: 'Get user ID information',
  async execute(bot, msg, args) {
    try {
      let targetUser;
      let userPhotos;

      if (args[0] && args[0].startsWith('@')) {
        try {
          const chatMembers = await bot.getChatAdministrators(msg.chat.id);

          const foundMember = chatMembers.find(member => 
            member.user.username && 
            '@' + member.user.username.toLowerCase() === args[0].toLowerCase()
          );

          if (!foundMember) {
            return bot.sendMessage(msg.chat.id, `❌ User ${args[0]} not found in this group.`);
          }

          targetUser = foundMember.user;
        } catch (memberError) {
          console.error('Member search error:', memberError);
          return bot.sendMessage(msg.chat.id, '❌ Unable to find user in the group.');
        }
      } 
      else {
        targetUser = msg.from;
      }

      try {
        userPhotos = await bot.getUserProfilePhotos(targetUser.id);
      } catch (photoError) {
        console.error('Profile photo error:', photoError);
        userPhotos = null;
      }

      const userDetails = `
📋 <b>User Information</b>

👤 Name: ${targetUser.first_name || ''} ${targetUser.last_name || ''}
🆔 User ID: <code>${targetUser.id}</code>
👥 Username: ${targetUser.username ? '@' + targetUser.username : 'No username'}

🌐 Chat Details:
💬 Chat ID: <code>${msg.chat.id}</code>
📊 Chat Type: ${msg.chat.type}
      `;

      if (userPhotos && userPhotos.photos.length > 0) {
        await bot.sendPhoto(msg.chat.id, userPhotos.photos[0][0].file_id, {
          caption: userDetails,
          parse_mode: 'HTML'
        });
      } else {
        await bot.sendMessage(msg.chat.id, userDetails, {
          parse_mode: 'HTML'
        });
      }

    } catch (error) {
      console.error('ID Command Error:', error);
      bot.sendMessage(msg.chat.id, '❌ An error occurred while retrieving ID information.');
    }
  }
};