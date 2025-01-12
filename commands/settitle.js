module.exports = {
  name: 'settitle',
  description: 'Change the group title (Creators/Admins Only)',
  async execute(bot, msg, args) {
    if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
      return bot.sendMessage(msg.chat.id, '❌ This command can only be used in groups.');
    }

    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Usage: /settitle <new_title>');
    }

    try {
      const chatMember = await bot.getChatMember(msg.chat.id, msg.from.id);

      if (chatMember.status !== 'creator' && chatMember.status !== 'administrator') {
        return bot.sendMessage(msg.chat.id, `
🚫 <b>Permission Denied</b>

Only group creators and administrators can change the group title.
\nYour current status: ${chatMember.status}
        `, { parse_mode: 'HTML' });
      }

      if (chatMember.status === 'administrator' && !chatMember.can_change_info) {
        return bot.sendMessage(msg.chat.id, '🚫 You do not have permission to change group info.');
      }

      const newTitle = args.join(' ');

      if (newTitle.length > 255) {
        return bot.sendMessage(msg.chat.id, '❌ Group title cannot exceed 255 characters.');
      }

      await bot.setChatTitle(msg.chat.id, newTitle);

      bot.sendMessage(msg.chat.id, `
✅ <b>Group Title Updated!</b>

New Title: "${newTitle}"
Changed by: @${msg.from.username || 'Unknown'}
      `, { parse_mode: 'HTML' });

    } catch (error) {
      const errorMessage = error.response?.body?.description || 'Unknown error';

      if (errorMessage.includes('not enough rights')) {
        return bot.sendMessage(msg.chat.id, `🚫 Oops! I don't have enough permissions to change the group title. Could you please make sure I'm an admin with the right privileges? 💕`);
      }

      bot.sendMessage(msg.chat.id, '❌ Failed to change group title. Please try again later.');
    }
  }
};
