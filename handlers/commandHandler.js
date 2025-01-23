const levenshtein = require("fast-levenshtein")

class CommandHandler {
  constructor(bot, db) {
    this.bot = bot
    this.db = db
    this.commands = new Map()
    this.ownerCommands = new Map()
    this.commandAliases = new Map()
    this.commandDescriptions = new Map()
  }

  addCommand(name, handler, options = {}) {
    const { isOwnerCommand = false, aliases = [], description = "" } = options

    if (isOwnerCommand) {
      this.ownerCommands.set(name, handler)
    } else {
      this.commands.set(name, handler)
    }

    this.commandDescriptions.set(name, description)

    aliases.forEach((alias) => {
      this.commandAliases.set(alias, name)
    })
  }

  async handleCommand(msg) {
    const [command, ...args] = msg.text.split(" ")
    const commandName = command.substring(1).toLowerCase()

    const actualCommandName = this.commandAliases.get(commandName) || commandName

    const ownerHandler = this.ownerCommands.get(actualCommandName)
    if (ownerHandler) {
      return this.handleOwnerCommand(ownerHandler, msg, args)
    }

    const handler = this.commands.get(actualCommandName)

    if (!handler) {
      const suggestion = this.findSimilarCommand(actualCommandName)
      return this.handleUnknownCommand(msg, actualCommandName, suggestion)
    }

    try {
      if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
        await this.checkBotAdminStatus(msg, actualCommandName)
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

  findSimilarCommand(inputCommand) {
    const allCommands = [...this.commands.keys(), ...this.ownerCommands.keys()]
    let closestMatch = ""
    let minDistance = Number.POSITIVE_INFINITY

    for (const command of allCommands) {
      const distance = levenshtein.get(inputCommand, command)
      if (distance < minDistance) {
        minDistance = distance
        closestMatch = command
      }
    }

    return minDistance <= inputCommand.length / 2 ? closestMatch : ""
  }

  handleUnknownCommand(msg, inputCommand, suggestion) {
    let responseMessage = `🚫 Unknown command: /${inputCommand}. `

    if (suggestion) {
      responseMessage += `Did you mean: /${suggestion}?`
      if (this.commandDescriptions.has(suggestion)) {
        responseMessage += `\n\n${this.commandDescriptions.get(suggestion)}`
      }
    } else {
      responseMessage += `Type /help for a list of available commands.`
    }

    return this.bot.sendMessage(msg.chat.id, responseMessage, { parse_mode: "HTML" })
  }

  loadCommands() {
    const fs = require("fs")
    const path = require("path")
    const commandsPath = path.join(__dirname, "..", "commands")
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"))

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file))
      this.addCommand(command.name, command.execute, {
        isOwnerCommand: command.owner === true,
        aliases: command.aliases || [],
        description: command.description || "",
      })
    }
  }

  getCommandList() {
    const commandList = []
    for (const [name, description] of this.commandDescriptions) {
      commandList.push(`/${name} - ${description}`)
    }
    return commandList.join("\n")
  }
}

module.exports = CommandHandler

