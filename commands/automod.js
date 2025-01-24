module.exports = {
  name: "automod",
  description: "Group auto-moderation system",
  execute(bot, msg) {
    const warningTracker = new Map();
    const bannedWords = [
      // Vulgar words and offensive language
      "fuck", "shit", "bitch", "cunt", 
      "asshole", "dickhead", "motherfucker", 
      "whore", "slut", "retard", 
      // Racial slurs (partially masked)
      "nigger", "chink", "spic", 
      // Offensive terms
      "idiot", "moron", "dumbass"
    ];

    bot.onText(/^\/automod (on|off)$/, async (message, match) => {
      const chatId = message.chat.id;
      const userId = message.from.id;

      const chatMember = await bot.getChatMember(chatId, userId);
      const isAdmin = ['administrator', 'creator'].includes(chatMember.status);

      if (!isAdmin) {
        return bot.sendMessage(chatId, "Only admins can toggle auto-moderation.");
      }

      bot.sendMessage(chatId, `Auto-moderation is now ${match[1]}`);
    });

    bot.on("message", async (message) => {
      const chatId = message.chat.id;
      const userId = message.from.id;
      const username = message.from.username || message.from.first_name;

      const containsBannedWord = bannedWords.some(word => 
        message.text.toLowerCase().includes(word.toLowerCase())
      );

      if (containsBannedWord) {
        const currentWarnings = (warningTracker.get(userId) || 0) + 1;
        warningTracker.set(userId, currentWarnings);

        try {
          if (currentWarnings <= 3) {
            await bot.sendMessage(chatId, 
              `⚠️ Warning ${currentWarnings}/3 for @${username}: Inappropriate language detected!`
            );
          } else {
  
            await bot.restrictChatMember(chatId, userId, {
              until_date: Math.floor(Date.now() / 1000) + 3600,
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
              `🔇 @${username} has been muted for 1 hour due to repeated inappropriate language.`
            );

            warningTracker.set(userId, 0);
          }
        } catch (error) {
          console.error("Moderation error:", error);
        }
      }
    });
  }
};
