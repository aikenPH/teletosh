module.exports = {
  name: 'pin',
  description: 'Pin a message in the group',
  async execute(bot, msg) {
    if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
      return bot.sendMessage(msg.chat.id, '❌ This command can only be used in groups.');
    }

    if (!msg.reply_to_message) {
      return bot.sendMessage(msg.chat.id, '❌ Please reply to a message with this command to pin it.');
    }

    try {
      const chatMember = await bot.getChatMember(msg.chat.id, msg.from.id);

      if (chatMember.status !== 'creator' && 
          (chatMember.status !== 'administrator' || !chatMember.can_pin_messages)) {
        return bot.sendMessage(msg.chat.id, `
🚫 <b>Permission Denied</b>

Only group creators and administrators with pin permissions can use this command.
\nYour current status: ${chatMember.status}
        `, { parse_mode: 'HTML' });
      }

      await bot.pinChatMessage(msg.chat.id, msg.reply_to_message.message_id, {
        disable_notification: false
      });

      const pinnedMessage = await bot.sendMessage(msg.chat.id, `
📌 <b>Message Pinned Successfully!</b>

Pinned by: @${msg.from.username || 'Unknown'}
        `, { 
          parse_mode: 'HTML',
          reply_to_message_id: msg.reply_to_message.message_id
        });

      setTimeout(() => {
        try {
          bot.deleteMessage(msg.chat.id, msg.message_id);
        } catch (deleteError) {
          console.log('Could not delete pin command message');
        }
      }, 5000);

    } catch (error) {
      console.error('Pin Message Error:', error);

      if (error.response && error.response.body) {
        const errorDescription = error.response.body.description;

        if (errorDescription.includes('not enough rights')) {
          return bot.sendMessage(msg.chat.id, '🚫 Bot lacks permission to pin messages.');
        }

        if (errorDescription.includes('can\'t pin a message')) {
          return bot.sendMessage(msg.chat.id, '⚠️ This message cannot be pinned.');
        }
      }

      bot.sendMessage(msg.chat.id, '❌ Failed to pin the message. Please try again later.');
    }
  }
};