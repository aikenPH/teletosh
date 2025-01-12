module.exports = {
  name: 'owner',
  description: 'Get information about the bot owner',
  
  async execute(bot, msg, args, db) {
    try {
      const ownerId = process.env.OWNER_ID;
      
      if (!ownerId) {
        return bot.sendMessage(msg.chat.id, '❌ Owner information is not configured.');
      }

      try {
        // Fetch owner's user profile
        const ownerProfile = await bot.getChat(ownerId);

        // Prepare owner details
        const ownerInfo = {
          id: ownerProfile.id,
          first_name: ownerProfile.first_name || 'Not Available',
          last_name: ownerProfile.last_name || '',
          username: ownerProfile.username ? `@${ownerProfile.username}` : 'No Username',
          language_code: ownerProfile.language_code || 'Not Available'
        };

        // Construct detailed message
        const ownerMessage = `
👤 Bot Owner Information:

📌 Name: ${ownerInfo.first_name} ${ownerInfo.last_name}
🆔 User ID: ${ownerInfo.id}
👥 Username: ${ownerInfo.username}
🌐 Language: ${ownerInfo.language_code}

🤖 Bot Ownership:
• Responsible for bot maintenance
• Primary point of contact
• Development and updates

📞 Contact Methods:
• Telegram Direct Message
• Username: ${ownerInfo.username}
        `;

        // Try to get and send profile photo
        try {
          const userProfilePhotos = await bot.getUserProfilePhotos(ownerId, {
            limit: 1
          });

          if (userProfilePhotos.total_count > 0) {
            const photoId = userProfilePhotos.photos[0][0].file_id;

            // Send message with photo
            await bot.sendPhoto(msg.chat.id, photoId, {
              caption: ownerMessage
            });
          } else {
            // If no profile photo, send text message
            await bot.sendMessage(msg.chat.id, ownerMessage);
          }
        } catch (photoError) {
          console.error('Error fetching owner profile photo:', photoError);
          // Fallback to sending text message
          await bot.sendMessage(msg.chat.id, ownerMessage);
        }

      } catch (profileError) {
        console.error('Error fetching owner profile:', profileError);
        await bot.sendMessage(msg.chat.id, '❌ Unable to retrieve owner information.');
      }

    } catch (error) {
      console.error('Owner Command Error:', error);
      await bot.sendMessage(msg.chat.id, '❌ An unexpected error occurred.');
    }
  }
};
