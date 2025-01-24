module.exports = {
  name: "rules",
  description: "Display the group rules",
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id
    const rules = `
📜 Group Rules:

1. Be respectful to all members
2. No spam or excessive self-promotion
3. Keep discussions on-topic
4. No NSFW content
5. No hate speech or discrimination
6. Use appropriate language
7. Respect the privacy of others
8. Follow the bot's instructions
9. Have fun and be kind to each other!
10. Administrators have the final say in disputes

Please follow these rules to ensure a positive environment for everyone.
    `

    await bot.sendMessage(chatId, rules, { parse_mode: "HTML" })
  },
}

