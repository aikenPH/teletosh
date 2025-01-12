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
    const botMember = await bot.getChatMember(chatId, bot.botInfo.id);
    
    if (botMember.status !== 'administrator' && botMember.status !== 'creator') {
      throw new Error('Bot must be an admin to generate invite link');
    }

    try {
      const newInviteLink = await bot.createChatInviteLink(chatId, {
        expire_date: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        member_limit: 0
      });

      if (newInviteLink && newInviteLink.invite_link) {
        return newInviteLink.invite_link;
      }
    } catch (createLinkError) {}

    try {
      const existingLink = await bot.exportChatInviteLink(chatId);
      if (existingLink) {
        return existingLink;
      }
    } catch (exportError) {}

    try {
      const chat = await bot.getChat(chatId);
      if (chat.username) {
        return `https://t.me/${chat.username}`;
      }
    } catch (chatError) {}

    const numericId = chatId.toString().replace('-100', '');
    const manualLink = `https://t.me/+${numericId}`;

    throw new Error(`Unable to generate invite link. Manual link: ${manualLink}`);

  } catch (error) {
    throw error;
  }
}
