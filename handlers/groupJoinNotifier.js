class GroupJoinNotifier {
  constructor(bot) {
    this.bot = bot;
    this.ownerId = process.env.OWNER_ID;
  }

  async handleBotAddedToGroup(msg) {
    if (process.env.GROUP_JOIN_NOTIFICATIONS !== 'on') return;

    try {
      const newMembers = msg.new_chat_members;
      const botUsername = this.bot.botInfo.username;

      const isBotAdded = newMembers.some(member => 
        member.username === botUsername
      );

      if (isBotAdded) {
        const chatId = msg.chat.id;
        const chatTitle = msg.chat.title || 'Unknown Group';
        const chatType = msg.chat.type;

        let inviteLink = '';
        try {
          inviteLink = await this.bot.exportChatInviteLink(chatId);
        } catch (linkError) {
          console.error('Could not generate invite link:', linkError);
        }

        const notificationMessage = `
🤖 <b>Bot Added to New Group</b>

📌 Group Details:
• Name: <code>${chatTitle}</code>
• Type: <code>${chatType}</code>
• Group ID: <code>${chatId}</code>

${inviteLink ? `🔗 Invite Link: ${inviteLink}` : ''}

🕒 Added at: ${new Date().toLocaleString()}
        `;

        try {
          await this.bot.sendMessage(this.ownerId, notificationMessage, {
            parse_mode: 'HTML'
          });
        } catch (ownerNotifyError) {
          console.error('Could not notify owner:', ownerNotifyError);
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