class ModerationTools {
  constructor(bot, db) {
    this.bot = bot;
    this.db = db;
  }

  async handleNewMember(msg) {
    const chatId = msg.chat.id;
    const newMember = msg.new_chat_member;

    if (newMember.is_bot && newMember.username === process.env.BOT_USERNAME) {
      await this.handleBotAdded(msg);
    } else {
      await this.handleUserJoined(msg);
    }
  }

  async handleBotAdded(msg) {
    const chatId = msg.chat.id;
    const botInfo = await this.bot.getMe();
    const introImage = 'https://i.ibb.co/3YN5ggW/lumina.jpg';
    
    const introMessage = `
🤖 *Lumina Bot Introduction* 🌟

Hello! I'm Lumina, your intelligent group management assistant. 

👥 *How to get started:*
• Add me as an admin
• Use /help to see available commands

💡 *Tip:* I work best with admin permissions!

*Developed with ❤️ by JohnDev19*
    `;

    try {
      const botAdmins = await this.bot.getChatAdministrators(chatId);
      const isBotAdmin = botAdmins.some(admin => 
        admin.user.username === process.env.BOT_USERNAME
      );

      const photoMessage = await this.bot.sendPhoto(chatId, introImage, {
        caption: introMessage,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📖 View Commands', callback_data: 'show_commands' },
              { text: '⚙️ Setup Guide', callback_data: 'setup_guide' }
            ],
            [
              { text: `🔒 Admin Status: ${isBotAdmin ? '✅ Enabled' : '❌ Not Admin'}`, 
                callback_data: 'check_admin_status' }
            ]
          ]
        }
      });

      this.db.addChat(chatId, {
        title: msg.chat.title || 'Unknown Group',
        type: msg.chat.type,
        addedTimestamp: Date.now(),
        botAdminStatus: isBotAdmin
      });

      console.log(`Bot added to chat: ${chatId}, Title: ${msg.chat.title || 'Unknown'}`);

    } catch (error) {
      console.error('Bot introduction message error:', error);
      
      try {
        await this.bot.sendMessage(chatId, introMessage, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📖 View Commands', callback_data: 'show_commands' },
                { text: '⚙️ Setup Guide', callback_data: 'setup_guide' }
              ]
            ]
          }
        });
      } catch (textError) {
        console.error('Fallback introduction message error:', textError);
      }
    }
  }

  async handleUserJoined(msg) {
    const chatId = msg.chat.id;
    const newMember = msg.new_chat_member;

    if (newMember.is_bot) return;

    const welcomeMessage = `
👋 Welcome to the group, ${newMember.first_name}!

🌟 We're excited to have you here. 
📝 Please take a moment to read the group rules.
🤝 Feel free to introduce yourself!

Enjoy your stay! 
    `;

    try {
      await this.bot.sendMessage(chatId, welcomeMessage, {
        reply_to_message_id: msg.message_id
      });
      this.db.updateUser(newMember.id, {
        username: newMember.username,
        firstName: newMember.first_name,
        joinedGroups: (this.db.getUser(newMember.id).joinedGroups || 0) + 1
      });

    } catch (error) {
      console.error('User welcome message error:', error);
    }
  }

  handleLeftMember(msg) {
    const chatId = msg.chat.id;
    const leftMember = msg.left_chat_member;
    
    if (leftMember.is_bot) return;

    const goodbyeMessage = `
👋 Goodbye, ${leftMember.first_name}!

We're sad to see you go. Hope you enjoyed your time here.
Feel free to come back anytime! 
    `;

    try {
      this.bot.sendMessage(chatId, goodbyeMessage);
    } catch (error) {
      console.error('Goodbye message error:', error);
    }
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
