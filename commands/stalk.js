module.exports = {
  name: 'stalk',
  description: 'Stalk a user by mentioning them in the group',
  async execute(bot, msg, args) {
    try {
      let targetUser ;
      let userPhotos;

      if (msg.reply_to_message && msg.reply_to_message.from) {
        targetUser  = msg.reply_to_message.from;
      } else {
        return bot.sendMessage(msg.chat.id, '❌ Please mention a user by replying to their message.');
      }

      try {
        userPhotos = await bot.getUser ProfilePhotos(targetUser .id);
      } catch (photoError) {
        console.error('Profile photo error:', photoError);
        userPhotos = null;
      }

      const userDetails = `
📋 <b>User Information</b>

${targetUser .first_name ? `👤 Name: ${targetUser .first_name}${targetUser .last_name ? ' ' + targetUser .last_name : ''}` : ''}
🆔 User ID: <code>${targetUser .id}</code>
${targetUser .username ? `👥 Username: @${targetUser .username}` : ''}
${targetUser .bio ? `📝 Bio: ${targetUser .bio}` : ''}
${targetUser .last_seen ? `🕒 Last Seen: ${targetUser .last_seen}` : ''}

🌐 <b>Chat Details:<b/>
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
      console.error('Stalk Command Error:', error);
      bot.sendMessage(msg.chat.id, '❌ An error occurred while retrieving user information.');
    }
  }
};
