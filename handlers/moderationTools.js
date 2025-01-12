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

  handleLeftMember(msg) {
    const chatId = msg.chat.id;
    const leftMember = msg.left_chat_member;
    const goodbyeMessage = `Goodbye, ${leftMember.first_name}! We hope to see you again soon.`;
    this.bot.sendMessage(chatId, goodbyeMessage);
  }

  async restrictUser(chatId, userId, permissions, duration) {
    try {
      await this.bot.restrictChatMember(chatId, userId, {
        ...permissions,
        until_date: Math.floor(Date.now() / 1000) + duration * 60
      });
      return true;
    } catch (error) {
      console.error('Error restricting user:', error);
      return false;
    }
  }

  async unrestrictUser(chatId, userId) {
    try {
      await this.bot.restrictChatMember(chatId, userId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true
      });
      return true;
    } catch (error) {
      console.error('Error unrestricting user:', error);
      return false;
    }
  }

  async banUser(chatId, userId) {
    try {
      await this.bot.kickChatMember(chatId, userId);
      return true;
    } catch (error) {
      console.error('Error banning user:', error);
      return false;
    }
  }

  async unbanUser(chatId, userId) {
    try {
      await this.bot.unbanChatMember(chatId, userId);
      return true;
    } catch (error) {
      console.error('Error unbanning user:', error);
      return false;
    }
  }
}

module.exports = ModerationTools;

