module.exports = {
  name: 'createtopic',
  description: 'Create a new topic in the group',
  async execute(bot, msg, args) {
    if (msg.chat.type !== 'supergroup' || !msg.chat.is_forum) {
      return bot.sendMessage(msg.chat.id, '❌ This command can only be used in forum groups.');
    }

    try {
      const chatMember = await bot.getChatMember(msg.chat.id, msg.from.id);

      if (chatMember.status !== 'creator' && chatMember.status !== 'administrator') {
        return bot.sendMessage(msg.chat.id, '🚫 Only group creators and administrators can create topics.');
      }
    } catch (permissionError) {
      console.error('Permission check error:', permissionError);
      return bot.sendMessage(msg.chat.id, '❌ Unable to verify your permissions.');
    }

    if (args.length < 2) {
      return bot.sendMessage(msg.chat.id, '❌ Usage: /createtopic <name> <icon_color>');
    }

    const iconColor = args[args.length - 1];
    const name = args.slice(0, -1).join(' ');

    const validColors = [
      'blue', 'yellow', 'purple', 'green', 
      'red', 'gray', 'light_blue', 'cyan'
    ];

    if (!validColors.includes(iconColor.toLowerCase())) {
      return bot.sendMessage(msg.chat.id, `
❌ Invalid icon color. 
Please choose from:
• blue
• yellow
• purple
• green
• red
• gray
• light_blue
• cyan
      `);
    }

    try {
      const result = await bot.createForumTopic(msg.chat.id, {
        name: name,
        icon_color: iconColor.toLowerCase()
      });

      bot.sendMessage(msg.chat.id, `
✅ <b>Topic Created Successfully!</b>

📌 Topic Name: ${name}
🎨 Icon Color: ${iconColor}
🆔 Topic ID: <code>${result.message_thread_id}</code>
      `, { parse_mode: 'HTML' });

    } catch (error) {
      console.error('Topic Creation Error:', error);

      if (error.response && error.response.body) {
        const errorDescription = error.response.body.description;

        if (errorDescription.includes('not enough rights')) {
          return bot.sendMessage(msg.chat.id, '🚫 Bot lacks permission to create topics.');
        }

        if (errorDescription.includes('maximum number of topics')) {
          return bot.sendMessage(msg.chat.id, '⚠️ Maximum number of topics reached.');
        }
      }

      bot.sendMessage(msg.chat.id, '❌ Failed to create topic. Please try again later.');
    }
  }
};