const fs = require('fs');
const path = require('path');

class GroupManager {
  constructor(bot, db) {
    this.bot = bot;
    this.db = db;
  }

  async handleNewMember(msg) {
  try {
    const chatId = msg.chat.id;
    const newMember = msg.new_chat_member;

    if (newMember.id === this.bot.botInfo.id) {
      await this.sendBotIntroduction(chatId);
      
      const botOwnerId = process.env.OWNER_ID ? parseInt(process.env.OWNER_ID) : null;
      
      if (botOwnerId) {
        const ownerNotificationMessage = `
🌟 <b>New Group Addition Alert!</b> 🌟

📍 Group Details:
• Name: ${msg.chat.title || 'Unnamed Group'}
• Type: ${msg.chat.type}
• Chat ID: <code>${chatId}</code>

👤 Added by: @${msg.from.username || 'Unknown User'}
• User ID: <code>${msg.from.id}</code>

📅 Added at: ${new Date().toUTCString()}
        `;

        await this.bot.sendMessage(botOwnerId, ownerNotificationMessage, {
          parse_mode: 'HTML',
          disable_web_page_preview: true
        });
      }
      
      return;
    }

    const welcomeMessage = this.generateWelcomeMessage(newMember.first_name);
    const welcomeImageUrl = 'https://i.ibb.co/hRmZ4NR/welcome.png';
    
    try {
      await this.bot.sendPhoto(chatId, welcomeImageUrl, {
        caption: welcomeMessage,
        parse_mode: 'HTML'
      });
    } catch (photoError) {
      console.error('Error sending welcome photo:', photoError);
      await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' });
    }
  } catch (error) {
    console.error('Error in handleNewMember:', error);
  }
}

  async sendBotIntroduction(chatId) {
    const introMessage = `
<b>🤖 Hello! I'm Lumina Bot!</b>

Thank you for adding me to your group! I'm here to help manage and enhance your group experience.

<b>🔐 Getting Started:</b>
1. Make sure I have admin privileges
2. Use /help to see all available commands
3. Start using my features!

<i>Developed by JohnDev19 with ❤️</i>

Need help? Just type /help to get started!
    `;

    try {
      const botLogoUrl = 'https://i.ibb.co/3YN5ggW/lumina.jpg';
      await this.bot.sendPhoto(chatId, botLogoUrl, {
        caption: introMessage,
        parse_mode: 'HTML'
      });

      await this.bot.sendMessage(chatId, '📌 <b>Tip:</b> Pin the introduction message above for quick access to bot information!', {
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Error sending bot introduction:', error);
      await this.bot.sendMessage(chatId, introMessage, { parse_mode: 'HTML' });
    }
  }

  async handleLeftMember(msg) {
    try {
      const chatId = msg.chat.id;
      const leftMember = msg.left_chat_member;
      const goodbyeMessage = this.generateGoodbyeMessage(leftMember.first_name);
      
      const goodbyeImageUrl = 'https://i.ibb.co/kqWn2FY/goodbye.png';
      
      try {
        await this.bot.sendPhoto(chatId, goodbyeImageUrl, {
          caption: goodbyeMessage,
          parse_mode: 'HTML'
        });
      } catch (photoError) {
        console.error('Error sending goodbye photo:', photoError);
        await this.bot.sendMessage(chatId, goodbyeMessage, { parse_mode: 'HTML' });
      }
    } catch (error) {
      console.error('Error in handleLeftMember:', error);
    }
  }

  generateWelcomeMessage(userName) {
    return `
<b>Welcome, ${userName}! 🎉</b>

We're thrilled to have you join our group. Here's what you can do:

• Introduce yourself to the community
• Check out our pinned messages for important info
• Use /help to see available commands

Enjoy your stay and happy chatting! 😊
    `;
  }

  generateGoodbyeMessage(userName) {
    return `
<b>${userName} has left the group. 👋</b>

We're sad to see you go! Remember, you're always welcome to return if you change your mind.

Wishing you all the best! 🌟
    `;
  }

  async inviteUser(chatId, userId) {
    try {
      const permissions = await this.checkBotPermissions(chatId);
      if (!permissions.canInviteUsers) {
        throw new Error('Bot does not have permission to invite users');
      }
      const result = await this.bot.inviteChat(chatId, userId);
      return result;
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  }

  async addAdministrator(chatId, userId) {
    try {
      const result = await this.bot.promoteChatMember(chatId, userId, {
        can_change_info: true,
        can_post_messages: true,
        can_edit_messages: true,
        can_delete_messages: true,
        can_invite_users: true,
        can_restrict_members: true,
        can_pin_messages: true,
        can_promote_members: false
      });
      return result;
    } catch (error) {
      console.error('Error adding administrator:', error);
      throw error;
    }
  }

  async changeGroupTitle(chatId, newTitle) {
    try {
      const permissions = await this.checkBotPermissions(chatId);
      if (!permissions.canChangeInfo) {
        throw new Error('Bot does not have permission to change group info');
      }
      const result = await this.bot.setChatTitle(chatId, newTitle);
      return result;
    } catch (error) {
      console.error('Error changing group title:', error);
      throw error;
    }
  }

  async changeGroupPhoto(chatId, photo) {
    try {
      const permissions = await this.checkBotPermissions(chatId);
      if (!permissions.canChangeInfo) {
        throw new Error('Bot does not have permission to change group info');
      }
      const result = await this.bot.setChatPhoto(chatId, photo);
      return result;
    } catch (error) {
      console.error('Error changing group photo:', error);
      throw error;
    }
  }

  async createTopic(chatId, name, iconColor) {
    try {
      const permissions = await this.checkBotPermissions(chatId);
      if (!permissions.canManageTopics) {
        throw new Error('Bot does not have permission to manage topics');
      }
      const result = await this.bot.createForumTopic(chatId, name, iconColor);
      return result;
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  }

  async editTopic(chatId, messageThreadId, name, iconCustomEmojiId) {
    try {
      const result = await this.bot.editForumTopic(chatId, messageThreadId, name, iconCustomEmojiId);
      return result;
    } catch (error) {
      console.error('Error editing topic:', error);
      throw error;
    }
  }

  async closeTopic(chatId, messageThreadId) {
    try {
      const result = await this.bot.closeForumTopic(chatId, messageThreadId);
      return result;
    } catch (error) {
      console.error('Error closing topic:', error);
      throw error;
    }
  }

  async reopenTopic(chatId, messageThreadId) {
    try {
      const result = await this.bot.reopenForumTopic(chatId, messageThreadId);
      return result;
    } catch (error) {
      console.error('Error reopening topic:', error);
      throw error;
    }
  }

  async deleteTopic(chatId, messageThreadId) {
    try {
      const result = await this.bot.deleteForumTopic(chatId, messageThreadId);
      return result;
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  }

  async pinMessage(chatId, messageId) {
    try {
      const permissions = await this.checkBotPermissions(chatId);
      if (!permissions.canPinMessages) {
        throw new Error('Bot does not have permission to pin messages');
      }
      const result = await this.bot.pinChatMessage(chatId, messageId);
      return result;
    } catch (error) {
      console.error('Error pinning message:', error);
      throw error;
    }
  }

  async unpinMessage(chatId, messageId) {
    try {
      const result = await this.bot.unpinChatMessage(chatId, messageId);
      return result;
    } catch (error) {
      console.error('Error unpinning message:', error);
      throw error;
    }
  }

  async checkBotPermissions(chatId) {
    try {
      const botMember = await this.bot.getChatMember(chatId, this.bot.botInfo.id);
      return {
        canChangeInfo: botMember.can_change_info,
        canInviteUsers: botMember.can_invite_users,
        canPinMessages: botMember.can_pin_messages,
        canManageTopics: botMember.can_manage_topics
      };
    } catch (error) {
      console.error('Error checking bot permissions:', error);
      throw error;
    }
  }
}

module.exports = GroupManager;
