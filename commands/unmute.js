module.exports = {
  name: 'unmute',
  description: 'Remove mute restriction for a user',
  async execute(bot, msg) {
    if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
      return bot.sendMessage(msg.chat.id, '❌ This command can only be used in groups.');
    }

    if (!msg.reply_to_message) {
      return bot.sendMessage(msg.chat.id, '❌ Please reply to a user\'s message to unmute them.');
    }

    try {
      const senderChatMember = await bot.getChatMember(msg.chat.id, msg.from.id);

      if (senderChatMember.status !== 'creator') {
        return bot.sendMessage(msg.chat.id, `
🚫 <b>Permission Denied</b>

Only the group creator can unmute users.
Your current status: ${senderChatMember.status}
        `, { parse_mode: 'HTML' });
      }

      const targetUserId = msg.reply_to_message.from.id;
      const targetUsername = msg.reply_to_message.from.username || 'Unknown';

      const userPhotos = await bot.getUserProfilePhotos(targetUserId);

      const unmutedMessage = `
✅ <b>User Unmuted Successfully!</b>

Unmuted User: @${targetUsername}
Unmuted by: @${msg.from.username || 'Unknown'}
      `;

      try {
        if (global.mutedUsers && global.mutedUsers[targetUserId]) {
          delete global.mutedUsers[targetUserId];
        }

        await bot.restrictChatMember(msg.chat.id, targetUserId, {
          can_send_messages: true,
          can_send_media_messages: true,
          can_send_polls: true,
          can_send_other_messages: true
        });

        if (userPhotos.photos.length > 0) {
          const fileId = userPhotos.photos[0][0].file_id;
          await bot.sendPhoto(msg.chat.id, fileId, {
            caption: unmutedMessage,
            parse_mode: 'HTML'
          });
        } else {
          await bot.sendMessage(msg.chat.id, unmutedMessage, { 
            parse_mode: 'HTML' 
          });
        }

        try {
          await bot.sendMessage(msg.chat.id, `
🔊 <b>Good news!</b>

@${targetUsername}, you have been unmuted and can now send messages in the group.
          `, { 
            parse_mode: 'HTML',
            reply_to_message_id: msg.reply_to_message.message_id
          });
        } catch (notificationError) {
          console.error('Error sending unmute notification:', notificationError);
        }

      } catch (unmuteError) {
        console.error('Unmute Error:', unmuteError);

        const errorMessage = unmuteError.response?.body?.description || 'Unknown error';

        if (errorMessage.includes('not enough rights')) {
          return bot.sendMessage(msg.chat.id, '🚫 Bot lacks permission to unmute users.');
        }

        bot.sendMessage(msg.chat.id, '❌ Failed to unmute user. Please try again later.');
      }

    } catch (permissionError) {
      console.error('Permission Check Error:', permissionError);
      bot.sendMessage(msg.chat.id, '❌ Unable to verify user status.');
    }
  }
};