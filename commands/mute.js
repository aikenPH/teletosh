module.exports = {
  name: 'mute',
  description: 'Temporarily mute a user from sending messages',
  async execute(bot, msg, args) {
    if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
      return bot.sendMessage(msg.chat.id, '❌ This command can only be used in groups.');
    }

    if (!msg.reply_to_message) {
      return bot.sendMessage(msg.chat.id, '❌ Please reply to a user\'s message to mute them.');
    }

    const duration = parseInt(args[0]);

    if (isNaN(duration) || duration <= 0) {
      return bot.sendMessage(msg.chat.id, '❌ Invalid duration. Please provide a positive number of minutes.');
    }

    try {
      const senderChatMember = await bot.getChatMember(msg.chat.id, msg.from.id);
      const targetChatMember = await bot.getChatMember(msg.chat.id, msg.reply_to_message.from.id);

      if (senderChatMember.status !== 'creator') {
        return bot.sendMessage(msg.chat.id, `
🚫 <b>Permission Denied</b>

Only the group creator can mute users.
\nYour current status: ${senderChatMember.status}
        `, { parse_mode: 'HTML' });
      }

      const targetUserId = msg.reply_to_message.from.id;
      const targetUsername = msg.reply_to_message.from.username || 'Unknown';

      const userPhotos = await bot.getUserProfilePhotos(targetUserId);

      const muteMessage = `
✅ <b>User Muted Successfully!</b>

Muted User: @${targetUsername}
Duration: ${duration} minutes
Muted by: @${msg.from.username || 'Unknown'}
      `;

      try {
        global.mutedUsers = global.mutedUsers || {};
        global.mutedUsers[targetUserId] = {
          chatId: msg.chat.id,
          until: Math.floor(Date.now() / 1000) + duration * 60
        };

        await bot.restrictChatMember(msg.chat.id, targetUserId, {
          can_send_messages: false,
          can_send_media_messages: false,
          can_send_polls: false,
          can_send_other_messages: false,
          until_date: Math.floor(Date.now() / 1000) + duration * 60
        });

        if (userPhotos.photos.length > 0) {
          const fileId = userPhotos.photos[0][0].file_id;
          await bot.sendPhoto(msg.chat.id, fileId, {
            caption: muteMessage,
            parse_mode: 'HTML'
          });
        } else {
          await bot.sendMessage(msg.chat.id, muteMessage, { 
            parse_mode: 'HTML' 
          });
        }

      } catch (muteError) {
        console.error('Mute Error:', muteError);

        const errorMessage = muteError.response?.body?.description || 'Unknown error';

        if (errorMessage.includes('not enough rights')) {
          return bot.sendMessage(msg.chat.id, '🚫 Bot lacks permission to mute users.');
        }

        bot.sendMessage(msg.chat.id, '❌ Failed to mute user. Please try again later.');
      }

    } catch (permissionError) {
      console.error('Permission Check Error:', permissionError);
      bot.sendMessage(msg.chat.id, '❌ Unable to verify user status.');
    }
  }
};

function setupMuteHandler(bot) {
  bot.on('message', async (msg) => {
    if (global.mutedUsers && global.mutedUsers[msg.from.id]) {
      const muteInfo = global.mutedUsers[msg.from.id];

      if (muteInfo.chatId === msg.chat.id && muteInfo.until > Math.floor(Date.now() / 1000)) {
        try {
          await bot.deleteMessage(msg.chat.id, msg.message_id);

          const remainingTime = Math.ceil((muteInfo.until - Math.floor(Date.now() / 1000)) / 60);

          await bot.sendMessage(msg.chat.id, `
🔇 <b>You are currently muted!</b>

Remaining mute time: ${remainingTime} minutes
\nYou cannot send messages during this period.
          `, {
            parse_mode: 'HTML',
            reply_to_message_id: msg.message_id
          });
        } catch (error) {
          console.error('Error handling muted user:', error);
        }
      } else {
        delete global.mutedUsers[msg.from.id];
      }
    }
  });
}
