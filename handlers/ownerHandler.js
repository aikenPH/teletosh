class OwnerHandler {
  constructor(bot, db) {
    this.bot = bot;
    this.db = db;
  }

  async handleOwnerCommand(command, msg, args) {
    const ownerId = process.env.OWNER_ID ? parseInt(process.env.OWNER_ID) : null;
    if (!ownerId || msg.from.id !== ownerId) {
      await this.bot.sendMessage(msg.chat.id, '❌ This command is restricted to the bot owner only.');
      return;
    }

    if (typeof command.execute === 'function') {
      await command.execute(this.bot, msg, args, this.db);
    } else {
      await this.bot.sendMessage(msg.chat.id, '❌ Invalid command structure.');
    }
  }
}

module.exports = OwnerHandler;

