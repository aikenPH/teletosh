module.exports = {
  name: 'notify',
  description: 'Send a notification to all groups (Bot owner only)',
  
  async execute(bot, msg, args, db) {
    // Check if the user is the owner
    const botOwnerId = process.env.OWNER_ID ? parseInt(process.env.OWNER_ID) : null;

    if (!botOwnerId || msg.from.id !== botOwnerId) {
      return bot.sendMessage(msg.chat.id, '❌ Sorry, only the bot owner can use this command.');
    }

    // Join all arguments to form the notification message
    const notificationText = args.join(' ');

    if (!notificationText) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a notification message.\nUsage: /notify Your message here');
    }

    try {
      // Get all chats the bot is currently in
      const chatList = await bot.getUpdates({
        offset: -1,
        limit: 100,
        timeout: 0
      });

      const uniqueChats = new Set();
      const successChats = [];
      const failedChats = [];

      // Process unique chats
      for (const update of chatList) {
        const chatId = update.message?.chat?.id || 
                       update.edited_message?.chat?.id || 
                       update.channel_post?.chat?.id;
        
        if (chatId && !uniqueChats.has(chatId)) {
          uniqueChats.add(chatId);

          try {
            await bot.sendMessage(chatId, `📢 *GLOBAL NOTIFICATION* 📢\n\n${notificationText}`, {
              parse_mode: 'Markdown'
            });
            successChats.push(chatId);
          } catch (sendError) {
            console.error(`Failed to send notification to chat ${chatId}:`, sendError);
            failedChats.push(chatId);
          }
        }
      }

      // Send summary to the owner
      await bot.sendMessage(msg.chat.id, `
✅ Notification Broadcast Complete!

📊 Delivery Report:
• Total Unique Chats: ${uniqueChats.size}
• Successful Deliveries: ${successChats.length}
• Failed Deliveries: ${failedChats.length}

${failedChats.length > 0 ? `Failed Chat IDs:\n${failedChats.join(', ')}` : ''}
      `);

    } catch (error) {
      console.error('Error in notify command:', error);
      await bot.sendMessage(msg.chat.id, '❌ An error occurred while sending notifications.');
    }
  }
};
