module.exports = {
  name: 'groupurl',
  description: 'Generate an invite link for a specified group',
  
  async execute(bot, msg, args, db) {
    try {
      const botOwnerId = process.env.OWNER_ID ? parseInt(process.env.OWNER_ID) : null;
      
      if (!botOwnerId || msg.from.id !== botOwnerId) {
        return bot.sendMessage(msg.chat.id, '❌ This command is restricted to the bot owner.');
      }

      if (args.length === 0) {
        return bot.sendMessage(msg.chat.id, '❌ Please provide a group ID. Usage: /groupurl <group_id>');
      }

      const targetGroupId = args[0];

      try {
        const inviteLink = await generateGroupInviteLink(bot, targetGroupId);

        await bot.sendMessage(botOwnerId, `
🔗 <b>Group Invite Link Generated</b>

📍 Group ID: <code>${targetGroupId}</code>
🌐 Invite Link: ${inviteLink}

<i>Direct invite link retrieved</i>
        `, {
          parse_mode: 'HTML',
          disable_web_page_preview: true
        });

        await bot.sendMessage(msg.chat.id, '✅ Invite link generated and sent to your private chat.');

      } catch (linkError) {
        console.error('Invite Link Generation Error:', linkError);
        await bot.sendMessage(msg.chat.id, `❌ ${linkError.message}`);
      }

    } catch (error) {
      console.error('Group URL Command Error:', error);
      await bot.sendMessage(msg.chat.id, '❌ An unexpected error occurred.');
    }
  }
};

async function generateGroupInviteLink(bot, chatId) {
  try {
    try {
      const inviteLink = await bot.exportChatInviteLink(chatId);
      
      if (inviteLink && inviteLink.startsWith('https://t.me/')) {
        return inviteLink;
      }
    } catch (exportError) {}

    try {
      const newInviteLink = await bot.createChatInviteLink(chatId, {
        expire_date: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        member_limit: 0
      });

      if (newInviteLink.invite_link && newInviteLink.invite_link.startsWith('https://t.me/')) {
        return newInviteLink.invite_link;
      }
    } catch (createError) {}

    const chatUsername = await getChatUsername(bot, chatId);
    if (chatUsername) {
      return `https://t.me/${chatUsername}`;
    }

    throw new Error('Unable to generate a valid invite link');
  } catch (error) {
    throw error;
  }
}

async function getChatUsername(bot, chatId) {
  try {
    const chat = await bot.getChat(chatId);
    return chat.username || null;
  } catch (error) {
    return null;
  }
}
