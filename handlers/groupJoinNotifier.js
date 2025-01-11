class GroupJoinNotifier {
  constructor(bot) {
    this.bot = bot;
    this.ownerId = process.env.OWNER_ID;
  }

  async handleBotAddedToGroup(msg) {
    try {
      const newMembers = msg.new_chat_members;
      const botUsername = this.bot.botInfo.username;

      const botMember = newMembers.find(member => 
        member.username === botUsername
      );

      if (botMember) {
        const chatId = msg.chat.id;
        const chatTitle = msg.chat.title || 'Unknown Group';
        const chatType = msg.chat.type;

        const notificationMessage = `
🤖 <b>Bot Added to New Group</b>

📌 Group Details:
• Name: <code>${chatTitle}</code>
• Type: <code>${chatType}</code>
• Group ID: <code>${chatId}</code>

🕒 Added at: ${new Date().toLocaleString()}
        `;

        try {
          await this.bot.sendMessage(this.ownerId, notificationMessage, {
            parse_mode: 'HTML'
          });
        } catch (ownerNotifyError) {
          console.error('Could not notify owner:', ownerNotifyError);
          console.error('Error Details:', {
            ownerId: this.ownerId,
            botUsername: botUsername,
            chatTitle: chatTitle
          });
        }
      }
    } catch (error) {
      console.error('Group Join Notification Error:', error);
    }
  }

  setupListener() {
    this.bot.on('new_chat_members', async (msg) => {
      await this.handleBotAddedToGroup(msg);
    });
  }
}

module.exports = GroupJoinNotifier;
