module.exports = {
  name: "automod",
  description: "Enhanced group auto-moderation system",
  execute(bot, msg) {
    const groupAutomodStatus = new Map();
    const warningTracker = new Map();
    
    const bannedWords = [
      "fuck", "shit", "bitch", "cunt", 
      "asshole", "dickhead", "motherfucker", 
      "whore", "slut", "retard", 
      "nigger", "chink", "spic", 
      "idiot", "moron", "dumbass",
      "f*ck", "f**k", "sh*t", 
      "b*tch", "c*nt"
    ];

    const bannedWordPatterns = bannedWords.map(word => 
      new RegExp(`\\b${word.replace(/\*/g, '[*]?')}\\b`, 'gi')
    );

    bot.onText(/^\/automod (on|off)$/, async (message) => {
      const chatId = message.chat.id;
      const userId = message.from.id;

      try {
        const chatMember = await bot.getChatMember(chatId, userId);
        const isAdmin = ['administrator', 'creator'].includes(chatMember.status);

        if (!isAdmin) {
          return bot.sendMessage(chatId, "❌ Only admins can manage auto-moderation.");
        }

        const newStatus = message.text.includes(" on");
        groupAutomodStatus.set(chatId, newStatus);

        const statusMessage = newStatus 
          ? "🛡️ Auto-moderation ENABLED. Inappropriate messages will be monitored."
          : "🔓 Auto-moderation DISABLED. Monitoring suspended.";

        bot.sendMessage(chatId, statusMessage);

      } catch (error) {
        console.error("Automod toggle error:", error);
        bot.sendMessage(chatId, "❌ Failed to toggle auto-moderation. Please try again.");
      }
    });

    bot.on("message", async (message) => {
      const chatId = message.chat.id;
      const userId = message.from.id;
      const username = message.from.username || message.from.first_name;

      const isAutomodActive = groupAutomodStatus.get(chatId) || false;
      if (!isAutomodActive || !message.text) return;

      const containsBannedWord = bannedWordPatterns.some(pattern => 
        pattern.test(message.text)
      );

      if (containsBannedWord) {
        const warningKey = `${chatId}:${userId}`;
        const currentWarnings = (warningTracker.get(warningKey) || 0) + 1;
        warningTracker.set(warningKey, currentWarnings);

        try {
          if (currentWarnings <= 3) {
            await bot.sendMessage(chatId, 
              `⚠️ Warning ${currentWarnings}/3 for @${username}: Inappropriate language detected! Next violation results in mute.`
            );
            await bot.deleteMessage(chatId, message.message_id);
          } else {
            const muteDuration = Math.min(currentWarnings * 3600, 86400);
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

            warningTracker.set(warningKey, 0);
          }
        } catch (error) {
          console.error("Moderation error:", error);
          bot.sendMessage(chatId, "❌ Moderation action failed.");
        }
      }
    });

    bot.onText(/^\/automodstatus$/, async (message) => {
      const chatId = message.chat.id;
      const isActive = groupAutomodStatus.get(chatId) || false;
      
      bot.sendMessage(chatId, 
        `Current Auto-Moderation Status: ${isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}`
      );
    });
  }
};
