module.exports = {
  name: 'leave',
  description: 'Force bot to leave a group and optionally clear messages (Owner only)',
  
  async execute(bot, msg, args, db) {
    const botOwnerId = process.env.OWNER_ID ? parseInt(process.env.OWNER_ID) : null;

    if (!botOwnerId || msg.from.id !== botOwnerId) {
      return bot.sendMessage(msg.chat.id, '❌ This command is restricted to the bot creator only.');
    }

    if (msg.chat.type === 'private') {
      return bot.sendMessage(msg.chat.id, '❌ This command can only be used in group chats.');
    }

    const chatId = msg.chat.id;
    const clearMessages = args[0]?.toLowerCase() === 'clear';

    try {
      let deletedMessagesCount = 0;

      if (clearMessages) {
        try {
          const chatHistory = await bot.getUpdates({
            offset: -1,
            limit: 100,
            timeout: 0
          });

          const relevantMessages = chatHistory.filter(
            update => update.message?.chat?.id === chatId
          );

          for (const update of relevantMessages) {
            try {
              await bot.deleteMessage(chatId, update.message.message_id);
              deletedMessagesCount++;
            } catch (deleteError) {
              console.error(`Failed to delete message ${update.message.message_id}:`, deleteError);
            }
          }
        } catch (historyError) {
          console.error('Error retrieving chat history:', historyError);
        }
      }

      const leaveMessage = await bot.sendMessage(chatId, `
🚪 *Leaving Group* 🚪

${clearMessages ? `🗑️ Cleared ${deletedMessagesCount} messages` : ''}

Bot has been instructed to leave this group by the owner.
Goodbye! 👋
      `, { parse_mode: 'Markdown' });

      setTimeout(async () => {
        try {
          await bot.leaveChat(chatId);
          
          if (db && typeof db.removeChat === 'function') {
            await db.removeChat(chatId);
          }
        } catch (leaveError) {
          console.error('Error leaving chat:', leaveError);
        }
      }, 2000);

    } catch (error) {
      console.error('Leave Command Error:', error);
      await bot.sendMessage(chatId, '❌ An unexpected error occurred while processing the leave command.');
    }
  }
};
