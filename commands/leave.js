module.exports = {
  name: 'leave',
  description: 'Force bot to leave a group (Owner only)',
  
  async execute(bot, msg, args, db) {
    try {
      const botOwnerId = process.env.OWNER_ID ? parseInt(process.env.OWNER_ID) : null;
      if (!botOwnerId || msg.from.id !== botOwnerId) {
        await bot.sendMessage(msg.chat.id, '❌ I only accept this command from my creator.');
        return;
      }

      if (msg.chat.type === 'private') {
        await bot.sendMessage(msg.chat.id, '❌ I can only use this command in group chats.');
        return;
      }

      const chatId = msg.chat.id;
      const chatName = msg.chat.title || 'this group';

      const leaveMessage = await bot.sendMessage(
        chatId,
        `👋 I've been instructed to leave ${chatName}. It was nice spending time with everyone! Goodbye! ✨`,
        { parse_mode: 'Markdown' }
      );

      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        await bot.leaveChat(chatId);
        
        if (db && typeof db.removeChat === 'function') {
          await db.removeChat(chatId);
        }

        if (botOwnerId) {
          await bot.sendMessage(
            botOwnerId,
            `✅ I've successfully left *${chatName}*`,
            { parse_mode: 'Markdown' }
          );
        }
      } catch (error) {
        console.error('Error during leave process:', error);
        
        if (botOwnerId) {
          await bot.sendMessage(
            botOwnerId,
            `❌ I encountered an error while trying to leave *${chatName}*:\n\`${error.message}\``,
            { parse_mode: 'Markdown' }
          );
        }
      }
    } catch (error) {
      console.error('Leave Command Error:', error);
      await bot.sendMessage(
        msg.chat.id,
        '❌ I encountered an unexpected error while trying to leave.'
      );
    }
  }
};
