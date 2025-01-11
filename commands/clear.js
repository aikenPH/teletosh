module.exports = {
  name: 'clear',
  description: 'Clear all messages except confirmation (Bot owner only)',
  async execute(bot, msg, args, db) {
    const botOwnerId = process.env.OWNER_ID ? parseInt(process.env.OWNER_ID) : null;

    if (!botOwnerId || msg.from.id !== botOwnerId) {
      return bot.sendMessage(msg.chat.id, '❌ This command is restricted to the bot creator only.');
    }

    try {
      const startMessageId = msg.message_id;

      if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
        const deletedMessages = [];
        const failedMessages = [];

        for (let i = 1; i < startMessageId; i++) {
          try {
            await bot.deleteMessage(msg.chat.id, i);
            deletedMessages.push(i);
          } catch (deleteError) {
            failedMessages.push(i);
          }
        }

        const confirmMsg = await bot.sendMessage(msg.chat.id, `
✅ Messages Cleared Successfully!

📊 Clearing Statistics:
• Total Messages Deleted: ${deletedMessages.length}
• Failed to Delete: ${failedMessages.length}

Cleared by: @${msg.from.username || msg.from.first_name}
        `);

        setTimeout(() => {
          bot.deleteMessage(msg.chat.id, confirmMsg.message_id);
        }, 5000);

      } else if (msg.chat.type === 'private') {
        const deletedMessages = [];
        const failedMessages = [];

        for (let i = 1; i < startMessageId; i++) {
          try {
            await bot.deleteMessage(msg.chat.id, i);
            deletedMessages.push(i);
          } catch (deleteError) {
            failedMessages.push(i);
          }
        }

        const confirmMsg = await bot.sendMessage(msg.chat.id, `
✅ Messages Cleared Successfully!

📊 Clearing Statistics:
• Total Messages Deleted: ${deletedMessages.length}
• Failed to Delete: ${failedMessages.length}

Cleared by: @${msg.from.username || msg.from.first_name}
        `);

        setTimeout(() => {
          bot.deleteMessage(msg.chat.id, confirmMsg.message_id);
        }, 5000);
      }

    } catch (error) {
      console.error('Clear Messages Error:', error);

      const errorMessage = error.response 
        ? error.response.body.description 
        : error.message;

      bot.sendMessage(msg.chat.id, `
❌ Failed to clear messages.
Error: ${errorMessage}

Possible reasons:
• No messages to delete
• Telegram API limitations
• Temporary network issues
      `);
    }
  }
};