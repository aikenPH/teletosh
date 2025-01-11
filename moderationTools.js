class ModerationTools {
  constructor(bot, db) {
    this.bot = bot;
    this.db = db;
  }

  handleNewMember(msg) {
    const chatId = msg.chat.id;
    const newMember = msg.new_chat_member;
    const welcomeMessage = `Welcome, ${newMember.first_name}! 👋 Please read the group rules and enjoy your stay.`;
    this.bot.sendMessage(chatId, welcomeMessage);
  }

  async handleMute(msg) {
    const chatId = msg.chat.id;
    const parts = msg.text.split(' ');
    if (parts.length < 3) {
      this.bot.sendMessage(chatId, 'Usage: /mute <username> <duration>');
      return;
    }
    const username = parts[1];
    const duration = parseInt(parts[2]);
    if (isNaN(duration)) {
      this.bot.sendMessage(chatId, 'Invalid duration. Please provide a number of minutes.');
      return;
    }
    try {
      await this.bot.restrictChatMember(chatId, username, {
        can_send_messages: false,
        until_date: Math.floor(Date.now() / 1000) + duration * 60
      });
      this.bot.sendMessage(chatId, `User ${username} has been muted for ${duration} minutes.`);
    } catch (error) {
      console.error('Error muting user:', error);
      this.bot.sendMessage(chatId, 'Failed to mute user. Make sure the bot has the necessary permissions.');
    }
  }

  async handleUnmute(msg) {
    const chatId = msg.chat.id;
    const parts = msg.text.split(' ');
    if (parts.length < 2) {
      this.bot.sendMessage(chatId, 'Usage: /unmute <username>');
      return;
    }
    const username = parts[1];
    try {
      await this.bot.restrictChatMember(chatId, username, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true
      });
      this.bot.sendMessage(chatId, `User ${username} has been unmuted.`);
    } catch (error) {
      console.error('Error unmuting user:', error);
      this.bot.sendMessage(chatId, 'Failed to unmute user. Make sure the bot has the necessary permissions.');
    }
  }

  async handleBan(msg) {
    const chatId = msg.chat.id;
    const parts = msg.text.split(' ');
    if (parts.length < 2) {
      this.bot.sendMessage(chatId, 'Usage: /ban <username>');
      return;
    }
    const username = parts[1];
    try {
      await this.bot.kickChatMember(chatId, username);
      this.bot.sendMessage(chatId, `User ${username} has been banned from the group.`);
    } catch (error) {
      console.error('Error banning user:', error);
      this.bot.sendMessage(chatId, 'Failed to ban user. Make sure the bot has the necessary permissions.');
    }
  }

  async handleUnban(msg) {
    const chatId = msg.chat.id;
    const parts = msg.text.split(' ');
    if (parts.length < 2) {
      this.bot.sendMessage(chatId, 'Usage: /unban <username>');
      return;
    }
    const username = parts[1];
    try {
      await this.bot.unbanChatMember(chatId, username);
      this.bot.sendMessage(chatId, `User ${username} has been unbanned from the group.`);
    } catch (error) {
      console.error('Error unbanning user:', error);
      this.bot.sendMessage(chatId, 'Failed to unban user. Make sure the bot has the necessary permissions.');
    }
  }
}

module.exports = ModerationTools;

