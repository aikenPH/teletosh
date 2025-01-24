module.exports = {
  name: "demote",
  description: "Demote an admin to regular user status",
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const targetUser = msg.reply_to_message ? msg.reply_to_message.from.id : args[0]

    if (!targetUser) {
      return bot.sendMessage(chatId, "Please reply to a user or provide a user ID to demote.")
    }

    try {
      const chatMember = await bot.getChatMember(chatId, userId)
      if (chatMember.status !== "creator" && chatMember.status !== "administrator") {
        return bot.sendMessage(chatId, "You must be an administrator to use this command.")
      }

      await bot.promoteChatMember(chatId, targetUser, {
        can_change_info: false,
        can_delete_messages: false,
        can_invite_users: false,
        can_restrict_members: false,
        can_pin_messages: false,
        can_promote_members: false,
      })

      bot.sendMessage(chatId, `User has been successfully demoted to regular user status.`)
    } catch (error) {
      console.error("Error in demote command:", error)
      bot.sendMessage(
        chatId,
        "An error occurred while trying to demote the user. Please check my permissions and try again.",
      )
    }
  },
}

