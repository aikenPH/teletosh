const { escapeMarkdown } = require('../utils/helpers');

module.exports = {
  name: 'group',
  description: 'Manage groups: list, leave, or invite',
  async execute(bot, msg, args, db) {
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    if (args.length === 0 || args[0] === 'list') {
      const groups = await db.getAllGroups();
      if (groups.length === 0) {
        bot.sendMessage(chatId, 'I am not a member of any groups at the moment.');
        return;
      }

      let message = 'Groups I am a member of:\n\n';
      groups.forEach((group) => {
        message += `*${escapeMarkdown(group.title)}*\n`;
        message += `_ID: \`${group.id}\`_\n\n`;
      });

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } else if (args.length === 2 && args[1] === 'leave') {
      const groupId = args[0];
      try {
        await bot.leaveChat(groupId);
        await db.removeGroup(groupId);
        bot.sendMessage(chatId, `Successfully left the group with ID: ${groupId}`);
      } catch (error) {
        console.error('Error leaving group:', error);
        bot.sendMessage(chatId, 'Failed to leave the group. Please check the group ID and try again.');
      }
    } else if (args.length === 2 && args[1] === 'invite') {
      const groupId = args[0];
      try {
        const chatInviteLink = await bot.exportChatInviteLink(groupId);
        bot.sendMessage(chatId, `Here's your invite link to join the group: ${chatInviteLink}`);
      } catch (error) {
        console.error('Error creating invite link:', error);
        bot.sendMessage(chatId, 'Failed to create an invite link. Please check the group ID and ensure I have the necessary permissions.');
      }
    } else {
      bot.sendMessage(chatId, 'Invalid usage. Use /group list, /group <groupId> leave, or /group <groupId> invite');
    }
  },
};

