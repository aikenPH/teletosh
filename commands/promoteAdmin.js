module.exports = {
  name: "promote",
  description: "Promote a user to admin status",
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const targetUser = msg.reply_to_message ? msg.reply_to_message.from.id : args[0]

    if (!targetUser) {
      return bot.sendMessage(chatId, "Please reply to a user or provide a user ID to promote.")
    }

    try {
      const chatMember = await bot.getChatMember(chatId, userId)
      if (chatMember.status !== "creator" && chatMember.status !== "administrator") {
        return bot.sendMessage(chatId, "You must be an administrator to use this command.")
      }

      await bot.promoteChatMember(chatId, targetUser, {
        can_change_info: true,
        can_delete_messages: true,
        can_invite_users: true,
        can_restrict_members: true,
        can_pin_messages: true,
        can_promote_members: false,
      })

      bot.sendMessage(chatId, `User has been successfully promoted to admin.`)
    } catch (error) {
      console.error("Error in promote command:", error)
      bot.sendMessage(
        chatId,
        "An error occurred while trying to promote the user. Please check my permissions and try again.",
      )
    }
  },
}

