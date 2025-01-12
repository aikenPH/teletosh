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
      // Retrieve all chats from the database
      const allChats = await db.getAllChats();

      let successCount = 0;
      let failureCount = 0;
      const failedChats = [];

      // Send notification to each chat
      for (const chat of allChats) {
        try {
          await bot.sendMessage(chat.chat_id, `📢 *GLOBAL NOTIFICATION* 📢\n\n${notificationText}`, {
            parse_mode: 'Markdown'
          });
          successCount++;
        } catch (sendError) {
          console.error(`Failed to send notification to chat ${chat.chat_id}:`, sendError);
          failureCount++;
          failedChats.push(chat.chat_id);
        }
      }

      // Send summary to the owner
      await bot.sendMessage(msg.chat.id, `
✅ Notification Sent Successfully!

📊 Delivery Report:
• Total Chats: ${allChats.length}
• Successful Deliveries: ${successCount}
• Failed Deliveries: ${failureCount}

${failureCount > 0 ? `Failed Chat IDs:\n${failedChats.join(', ')}` : ''}
      `);

    } catch (error) {
      console.error('Error in notify command:', error);
      await bot.sendMessage(msg.chat.id, '❌ An error occurred while sending notifications.');
    }
  }
};
