const { escapeMarkdown } = require('../utils/helpers');

module.exports = {
  name: 'group',
  description: 'Manage groups: list, leave, or invite',
  async execute(bot, msg, args = [], db) {
    try {
      if (!msg || !msg.from || !msg.chat) {
        console.error('Invalid message object received');
        return;
      }

      const userId = msg.from.id;
      const chatId = msg.chat.id;

      // Validate user permissions
      try {
        const chatMember = await bot.getChatMember(chatId, userId);
        if (!['creator', 'administrator'].includes(chatMember.status)) {
          await bot.sendMessage(chatId, 'You need to be an admin to use group management commands.');
          return;
        }
      } catch (error) {
        console.error('Error checking user permissions:', error);
        // Continue execution as this might be a private chat
      }

      // Handle subcommands
      const subCommand = args && args.length > 0 ? args[0].toLowerCase() : 'list';

      switch (subCommand) {
        case 'list':
          await handleListGroups(bot, chatId, db);
          break;

        case 'leave':
          if (args.length < 2) {
            await bot.sendMessage(chatId, 'Please provide a group ID: /group leave <groupId>');
            return;
          }
          await handleLeaveGroup(bot, chatId, args[1], db);
          break;

        case 'invite':
          if (args.length < 2) {
            await bot.sendMessage(chatId, 'Please provide a group ID: /group invite <groupId>');
            return;
          }
          await handleInvite(bot, chatId, args[1]);
          break;

        default:
          await bot.sendMessage(
            chatId,
            'Available commands:\n' +
            '/group list - Show all groups\n' +
            '/group leave <groupId> - Leave a group\n' +
            '/group invite <groupId> - Create invite link'
          );
      }
    } catch (error) {
      console.error('Error in group command:', error);
      await bot.sendMessage(
        msg.chat.id,
        'An error occurred while processing your request. Please try again later.'
      );
    }
  },
};

async function handleListGroups(bot, chatId, db) {
  try {
    const groups = await db.getAllGroups();
    
    if (!groups || groups.length === 0) {
      await bot.sendMessage(chatId, 'I am not a member of any groups at the moment.');
      return;
    }

    let message = 'Groups I am a member of:\n\n';
    groups.forEach((group) => {
      if (group && group.title) {
        message += `*${escapeMarkdown(group.title)}*\n`;
        message += `_ID: \`${group.id}\`_\n\n`;
      }
    });

    await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
  } catch (error) {
    console.error('Error listing groups:', error);
    await bot.sendMessage(chatId, 'Failed to retrieve group list. Please try again later.');
  }
}

async function handleLeaveGroup(bot, chatId, groupId, db) {
  try {
    // Validate group ID
    if (!groupId || isNaN(parseInt(groupId))) {
      await bot.sendMessage(chatId, 'Please provide a valid group ID.');
      return;
    }

    // Check if bot is actually in the group
    try {
      await bot.getChat(groupId);
    } catch (error) {
      await bot.sendMessage(chatId, 'I am not a member of this group or the group ID is invalid.');
      return;
    }

    await bot.leaveChat(groupId);
    await db.removeGroup(groupId);
    await bot.sendMessage(chatId, `Successfully left the group with ID: ${groupId}`);
  } catch (error) {
    console.error('Error leaving group:', error);
    await bot.sendMessage(
      chatId,
      'Failed to leave the group. Please check the group ID and ensure I have the necessary permissions.'
    );
  }
}

async function handleInvite(bot, chatId, groupId) {
  try {
    // Validate group ID
    if (!groupId || isNaN(parseInt(groupId))) {
      await bot.sendMessage(chatId, 'Please provide a valid group ID.');
      return;
    }

    // Check if bot is actually in the group and has invite permissions
    try {
      const chatMember = await bot.getChatMember(groupId, bot.botInfo.id);
      if (!chatMember.can_invite_users) {
        await bot.sendMessage(chatId, 'I don\'t have permission to create invite links in this group.');
        return;
      }
    } catch (error) {
      await bot.sendMessage(chatId, 'I am not a member of this group or the group ID is invalid.');
      return;
    }

    const chatInviteLink = await bot.exportChatInviteLink(groupId);
    await bot.sendMessage(
      chatId,
      `Here's your invite link to join the group: ${chatInviteLink}`,
      { disable_web_page_preview: true }
    );
  } catch (error) {
    console.error('Error creating invite link:', error);
    await bot.sendMessage(
      chatId,
      'Failed to create an invite link. Please check the group ID and ensure I have the necessary permissions.'
    );
  }
}
