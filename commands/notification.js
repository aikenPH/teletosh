module.exports = {
  name: 'notification',
  description: 'Toggle group join notifications',
  async execute(bot, msg, args, db) {
    const ownerId = process.env.OWNER_ID;

    if (msg.from.id.toString() !== ownerId) {
      return bot.sendMessage(msg.chat.id, '❌ This command is restricted to the bot owner.');
    }

    const action = args[0]?.toLowerCase();

    if (!action || !['on', 'off'].includes(action)) {
      return bot.sendMessage(msg.chat.id, `
🔔 Notification Management

Usage: /notification [on/off]

Current options:
• /notification on - Enable group join notifications
• /notification off - Disable group join notifications
      `);
    }

    try {
      process.env.GROUP_JOIN_NOTIFICATIONS = action;

      const statusMessage = action === 'on' 
        ? '🔔 Group join notifications are now ENABLED.' 
        : '🔇 Group join notifications are now DISABLED.';

      await bot.sendMessage(msg.chat.id, statusMessage);

    } catch (error) {
      console.error('Notification Toggle Error:', error);
      await bot.sendMessage(msg.chat.id, '❌ Failed to update notification settings.');
    }
  }
};