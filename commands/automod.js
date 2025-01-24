module.exports = {
  name: "automod",
  description: "Enhanced group auto-moderation system",
  execute(bot, msg) {
    // Track group-specific automod status
    const groupAutomodStatus = new Map();
    const warningTracker = new Map();
    
    const bannedWords = [
      // Comprehensive list of offensive terms
      "fuck", "shit", "bitch", "cunt", 
      "asshole", "dickhead", "motherfucker", 
      "whore", "slut", "retard", 
      "nigger", "chink", "spic", 
      "idiot", "moron", "dumbass",
      // Add more variations and common misspellings
      "f*ck", "f**k", "sh*t", 
      "b*tch", "c*nt"
    ];

    // Regex to handle on/off command with group-specific tracking
    bot.onText(/^\/automod (on|off)$/, async (message) => {
      const chatId = message.chat.id;
      const userId = message.from.id;

      try {
        // Verify admin status
        const chatMember = await bot.getChatMember(chatId, userId);
        const isAdmin = ['administrator', 'creator'].includes(chatMember.status);

        if (!isAdmin) {
          return bot.sendMessage(chatId, "❌ Only admins can manage auto-moderation.");
        }

        // Toggle group's automod status
        const newStatus = message.text.includes(" on");
        groupAutomodStatus.set(chatId, newStatus);

        // Send confirmation with detailed message
        const statusMessage = newStatus 
          ? "🛡️ Auto-moderation ENABLED. Inappropriate messages will be monitored."
          : "🔓 Auto-moderation DISABLED. Monitoring suspended.";

        bot.sendMessage(chatId, statusMessage);

      } catch (error) {
        console.error("Automod toggle error:", error);
        bot.sendMessage(chatId, "❌ Failed to toggle auto-moderation. Please try again.");
      }
    });

    // Message monitoring
    bot.on("message", async (message) => {
      const chatId = message.chat.id;
      const userId = message.from.id;
      const username = message.from.username || message.from.first_name;

      // Check if automod is enabled for this group
      const isAutomodActive = groupAutomodStatus.get(chatId) || false;
      if (!isAutomodActive) return;

      // Advanced banned word detection with regex for variations
      const containsBannedWord = bannedWords.some(word => 
        new RegExp(`\\b${word.replace(/\*/g, '\\*')}\\b`, 'gi').test(message.text)
      );

      if (containsBannedWord) {
        // Initialize or increment warning count
        const currentWarnings = (warningTracker.get(`${chatId}:${userId}`) || 0) + 1;
        warningTracker.set(`${chatId}:${userId}`, currentWarnings);

        try {
          if (currentWarnings <= 3) {
            // Graduated warning system
            await bot.sendMessage(chatId, 
              `⚠️ Warning ${currentWarnings}/3 for @${username}: Inappropriate language detected! Next violation results in mute.`
            );
          } else {
            // Mute for escalating duration
            const muteDuration = currentWarnings * 3600; // Increasing mute time
            await bot.restrictChatMember(chatId, userId, {
              until_date: Math.floor(Date.now() / 1000) + muteDuration,
              permissions: {
                can_send_messages: false,
                can_send_media_messages: false,
                can_send_polls: false,
                can_send_other_messages: false,
                can_add_web_page_previews: false
              }
            });

            await bot.deleteMessage(chatId, message.message_id);
            await bot.sendMessage(chatId, 
              `🔇 @${username} muted for ${muteDuration/3600} hour(s) due to repeated inappropriate language.`
            );

            // Reset warnings after mute
            warningTracker.set(`${chatId}:${userId}`, 0);
          }
        } catch (error) {
          console.error("Moderation error:", error);
        }
      }
    });
  }
};
