const { findMostSimilarCommand } = require("../utils/stringSimilarity")

class CommandHandler {
  constructor(bot, db) {
    this.bot = bot
    this.db = db
    this.commands = new Map()
    this.ownerCommands = new Map()
  }

  addCommand(name, handler, isOwnerCommand = false) {
    if (isOwnerCommand) {
      this.ownerCommands.set(name, handler)
    } else {
      this.commands.set(name, handler)
    }
  }

  async handleCommand(msg) {
    const [command, ...args] = msg.text.split(" ")
    const commandName = command.substring(1).toLowerCase()

    const ownerHandler = this.ownerCommands.get(commandName)
    if (ownerHandler) {
      return this.handleOwnerCommand(ownerHandler, msg, args)
    }

    const handler = this.commands.get(commandName)

    if (!handler) {
      const allCommands = [...this.commands.keys(), ...this.ownerCommands.keys()]
      const suggestion = findMostSimilarCommand(commandName, allCommands)

      let responseMessage = "🚫 Unknown command. Type /help for a list of available commands."
      if (suggestion) {
        responseMessage += `\n\nDid you mean: /${suggestion}?`
      }

      return this.bot.sendMessage(msg.chat.id, responseMessage)
    }

    try {
      if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
        await this.checkBotAdminStatus(msg, commandName)
      }

      await handler(this.bot, msg, args, this.db)
    } catch (error) {
      this.handleCommandError(msg, error)
    }
  }

  async handleOwnerCommand(handler, msg, args) {
    const ownerId = process.env.OWNER_ID ? Number.parseInt(process.env.OWNER_ID) : null
    if (!ownerId || msg.from.id !== ownerId) {
      await this.bot.sendMessage(msg.chat.id, "🚫 This command is restricted to the bot owner only.")
      return
    }

    try {
      await handler(this.bot, msg, args, this.db)
    } catch (error) {
      this.handleCommandError(msg, error)
    }
  }

  async checkBotAdminStatus(msg, commandName) {
    try {
      const botChatMember = await this.bot.getChatMember(msg.chat.id, this.bot.botInfo.id)

      const requiredPermissions = [
        "can_change_info",
        "can_delete_messages",
        "can_invite_users",
        "can_restrict_members",
        "can_pin_messages",
      ]

      const missingPermissions = requiredPermissions.filter((perm) => !botChatMember[perm])

      if (botChatMember.status !== "administrator" && botChatMember.status !== "creator") {
        throw new Error("bot_not_admin")
      }

      if (missingPermissions.length > 0) {
        throw new Error("insufficient_permissions")
      }
    } catch (error) {
      if (error.message === "bot_not_admin") {
        throw new Error(`
🤖 <b>Admin Privileges Required</b>

Hey there! I need admin permissions to function effectively in this group. 

Please:
• Add me as an admin
• Grant me the following key permissions:
  - Change Group Info
  - Delete Messages
  - Invite Users
  - Restrict Members
  - Pin Messages

Without these, I can't help manage the group properly! 💕
        `)
      }

      if (error.message === "insufficient_permissions") {
        throw new Error(`
🔒 <b>Insufficient Permissions</b>

I'm an admin, but I'm missing some crucial permissions. 
Please review and grant me:
• Change Group Info
• Delete Messages
• Invite Users
• Restrict Members
• Pin Messages

This will help me serve the group effectively! 🌟
        `)
      }

      throw error
    }
  }

  handleCommandError(msg, error) {
    console.error(`Command Error: ${error.message}`)

    this.bot.sendMessage(msg.chat.id, error.message, {
      parse_mode: "HTML",
    })
  }

  loadCommands() {
    const commandsPath = path.join(__dirname, "../commands")
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"))

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file))
      this.addCommand(command.name, command.execute, command.owner === true)
    }
  }
}

module.exports = CommandHandler

