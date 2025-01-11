module.exports = {
  name: 'notification',
  description: 'Toggle group join notifications',
  async execute(bot, msg, args) {
    const ownerId = process.env.OWNER_ID;

    if (msg.from.id.toString() !== ownerId) {
      return bot.sendMessage(msg.chat.id, '❌ This command is restricted to the bot owner.');
    }

    const action = args[0]?.toLowerCase();

    if (!action || !['on', 'off', 'status'].includes(action)) {
      return bot.sendMessage(msg.chat.id, `
🔔 Notification Management

Usage: 
• /notification on - Enable group join/leave notifications
• /notification off - Disable group join/leave notifications
• /notification status - Check current notification status

Current status: ${process.env.GROUP_JOIN_NOTIFICATIONS || 'on'}
      `);
    }

    try {
      if (action === 'status') {
        const currentStatus = process.env.GROUP_JOIN_NOTIFICATIONS || 'on';
        return bot.sendMessage(msg.chat.id, `
🔔 Current Notification Status:
• Group Join/Leave Notifications: ${currentStatus.toUpperCase()}
        `);
      }

      process.env.GROUP_JOIN_NOTIFICATIONS = action;

      const statusMessage = action === 'on' 
        ? '🔔 Group join/leave notifications are now ENABLED.' 
        : '🔇 Group join/leave notifications are now DISABLED.';

      await bot.sendMessage(msg.chat.id, statusMessage);

    } catch (error) {
      console.error('Notification Toggle Error:', error);
      await bot.sendMessage(msg.chat.id, '❌ Failed to update notification settings.');
    }
  },

  async notifyGroupEvent(bot, msg, eventType) {
    const ownerId = process.env.OWNER_ID;
    
    if (process.env.GROUP_JOIN_NOTIFICATIONS === 'off') return;

    try {
      const chatId = msg.chat.id;
      const chatTitle = msg.chat.title || 'Unknown Group';
      const chatType = msg.chat.type;

      let notificationMessage = '';
      let eventIcon = '';
      let eventDescription = '';

      switch (eventType) {
        case 'join':
          const newMembers = msg.new_chat_members;
          const botUsername = bot.botInfo.username;

          const botMember = newMembers.find(member => 
            member.username === botUsername
          );

          if (!botMember) return;

          eventIcon = '🤖';
          eventDescription = 'Bot Added to New Group';
          break;

        case 'leave':
          eventIcon = '🚫';
          eventDescription = 'Bot Removed from Group';
          break;

        default:
          return;
      }

      notificationMessage = `
${eventIcon} <b>${eventDescription}</b>

📌 Group Details:
• Name: <code>${chatTitle}</code>
• Type: <code>${chatType}</code>
• Group ID: <code>${chatId}</code>

🕒 ${eventDescription} at: ${new Date().toLocaleString()}

${eventType === 'join' ? '🔗 Invite Link: ' + (await generateInviteLink(bot, chatId) || 'Not Available') : ''}
      `;

      await sendNotificationWithRetry(bot, ownerId, notificationMessage);
    } catch (error) {
      console.error('Group Event Notification Error:', error);
    }
  },

  setupPollingErrorHandler(bot) {
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 5;
    const RESTART_DELAY = 30000; // 30 seconds

    bot.on('polling_error', async (error) => {
      console.error('Polling Error:', error);
      consecutiveErrors++;

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.log(`Multiple polling errors detected. Attempting to restart bot...`);
        
        try {
          await sendOwnerAlert(bot, `
⚠️ Bot Polling Issues Detected

• Consecutive Errors: ${consecutiveErrors}
• Attempting Automatic Restart
• Timestamp: ${new Date().toLocaleString()}
          `);

          await restartBot(bot);
        } catch (restartError) {
          console.error('Bot Restart Failed:', restartError);
        }

        consecutiveErrors = 0;
      }
    });
  }
};

async function generateInviteLink(bot, chatId) {
  try {
    return await bot.exportChatInviteLink(chatId);
  } catch {
    return null;
  }
}

async function sendNotificationWithRetry(bot, ownerId, message, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await bot.sendMessage(ownerId, message, {
        parse_mode: 'HTML'
      });
      return;
    } catch (error) {
      console.error(`Notification send attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.error('Failed to send notification after max retries');
      }

      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}

async function sendOwnerAlert(bot, message) {
  const ownerId = process.env.OWNER_ID;
  try {
    await bot.sendMessage(ownerId, message);
  } catch (error) {
    console.error('Failed to send owner alert:', error);
  }
}

async function restartBot(bot) {
  try {
    bot.stopPolling();
    await new Promise(resolve => setTimeout(resolve, 5000));
    bot.startPolling();
    console.log('Bot polling restarted successfully');
  } catch (error) {
    console.error('Bot restart failed:', error);
    throw error;
  }
}
