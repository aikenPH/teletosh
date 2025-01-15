const { escapeMarkdown } = require('../utils/helpers');

module.exports = {
  name: 'managegroups',
  description: 'Manage groups: list, leave, or set auto-leave',
  owner: true,
  async execute(bot, msg, args, db) {
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
        message += `ID: \`${group.id}\`\n`;
        message += `Type: ${group.type}\n`;
        message += `Joined: ${new Date(group.joinedAt).toLocaleString()}\n\n`;
      });

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } else if (args.length === 2 && args[0] === 'leave') {
      // Leave a group
      const groupId = args[1];
      try {
        await bot.leaveChat(groupId);
        await db.removeGroup(groupId);
        bot.sendMessage(chatId, `Successfully left the group with ID: ${groupId}`);
      } catch (error) {
        console.error('Error leaving group:', error);
        bot.sendMessage(chatId, 'Failed to leave the group. Please check the group ID and try again.');
      }
    } else if (args.length === 3 && args[0] === 'autoleave') {
      const groupId = args[1];
      const days = parseInt(args[2]);
      if (isNaN(days) || days <= 0) {
        bot.sendMessage(chatId, 'Please provide a valid number of days for auto-leave.');
        return;
      }
      try {
        const group = (await db.getAllGroups()).find(g => g.id === groupId);
        if (!group) {
          bot.sendMessage(chatId, 'Group not found. Please check the group ID.');
          return;
        }
        const leaveDate = new Date();
        leaveDate.setDate(leaveDate.getDate() + days);
        await db.updateGroup(groupId, { autoLeaveDate: leaveDate.toISOString() });
        bot.sendMessage(chatId, `Auto-leave set for group ${group.title} (ID: ${groupId}) on ${leaveDate.toLocaleString()}`);
      } catch (error) {
        console.error('Error setting auto-leave:', error);
        bot.sendMessage(chatId, 'Failed to set auto-leave. Please try again.');
      }
    } else {
      bot.sendMessage(chatId, 'Invalid usage. Use /managegroups list, /managegroups leave <groupId>, or /managegroups autoleave <groupId> <days>');
    }
  },
};

