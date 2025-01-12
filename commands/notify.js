const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  name: 'notify',
  description: 'Send a notification to all groups (Owner only)',

  async execute(bot, msg, match) {
    // Check if the user is the owner
    if (msg.from.id !== parseInt(process.env.OWNER_ID)) {
      await bot.sendMessage(msg.chat.id, '❌ Sorry, only the bot owner can use this command.');
      return;
    }

    // Extract the notification message
    const notificationText = match[1];

    if (!notificationText) {
      await bot.sendMessage(msg.chat.id, '❌ Please provide a notification message.\nUsage: /notify Your message here');
      return;
    }

    try {
      // Get all chats the bot is a member of
      const chats = await bot.getMyCommands();

      let successCount = 0;
      let failureCount = 0;

      // Send notification to each chat
      for (const chat of chats) {
        try {
          await bot.sendMessage(chat.id, `📢 *GLOBAL NOTIFICATION* 📢\n\n${notificationText}`, {
            parse_mode: 'Markdown'
          });
          successCount++;
        } catch (sendError) {
          console.error(`Failed to send notification to chat ${chat.id}:`, sendError);
          failureCount++;
        }
      }

      // Send summary to the owner
      await bot.sendMessage(msg.chat.id, `
✅ Notification Sent Successfully!

📊 Delivery Report:
• Total Chats: ${chats.length}
• Successful Deliveries: ${successCount}
• Failed Deliveries: ${failureCount}
      `);

    } catch (error) {
      console.error('Error in notify command:', error);
      await bot.sendMessage(msg.chat.id, '❌ An error occurred while sending notifications.');
    }
  }
};

// In your main bot setup file:
bot.onText(/\/notify(?:\s+(.+))?$/, async (msg, match) => {
  try {
    await module.exports.execute(bot, msg, match);
  } catch (error) {
    console.error('Notify command error:', error);
  }
});
