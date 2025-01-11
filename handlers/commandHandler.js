class CommandHandler {
  constructor(bot, db) {
    this.bot = bot;
    this.db = db;
    this.commands = new Map();
  }

  addCommand(name, handler) {
    this.commands.set(name, handler);
  }

  handleCommand(msg) {
    const [command, ...args] = msg.text.split(' ');
    const handler = this.commands.get(command.substring(1).toLowerCase());

    if (handler) {
      handler(this.bot, msg, args, this.db);
    } else {
      this.bot.sendMessage(msg.chat.id, 'Unknown command. Type /help for a list of available commands.');
    }
  }
}

module.exports = CommandHandler;

