class CommandHandler {
  constructor(bot, db) {
    this.bot = bot;
    this.db = db;
    this.setupCommands();
  }

  setupCommands() {
    this.commands = {
      start: this.handleStart.bind(this),
      help: this.handleHelp.bind(this),
      setreminder: this.handleSetReminder.bind(this),
      mute: this.handleMute.bind(this),
      unmute: this.handleUnmute.bind(this),
      ban: this.handleBan.bind(this),
      unban: this.handleUnban.bind(this),
    };
  }

  handleCommand(msg) {
    const command = msg.text.split(' ')[0].substring(1);
    const handler = this.commands[command];
    if (handler) {
      handler(msg);
    } else {
      this.bot.sendMessage(msg.chat.id, 'Unknown command. Type /help for a list of available commands.');
    }
  }

  handleStart(msg) {
    const welcomeMessage = `Welcome to Lumina Bot! 🌟
I'm here to assist you with various tasks. Here are some things I can do:
- Set reminders
- Moderate group chats
- Provide automated responses

Type /help to see a list of available commands.`;
    this.bot.sendMessage(msg.chat.id, welcomeMessage);
  }

  handleHelp(msg) {
    const helpMessage = `Available commands:
/start - Start the bot
/help - Show this help message
/setreminder <time> <message> - Set a reminder
/mute <username> <duration> - Mute a user
/unmute <username> - Unmute a user
/ban <username> - Ban a user
/unban <username> - Unban a user`;
    this.bot.sendMessage(msg.chat.id, helpMessage);
  }

  handleSetReminder(msg) {
    const parts = msg.text.split(' ');
    if (parts.length < 3) {
      this.bot.sendMessage(msg.chat.id, 'Usage: /setreminder <time> <message>');
      return;
    }
    const time = parts[1];
    const message = parts.slice(2).join(' ');
    this.db.addReminder(msg.chat.id, time, message);
    this.bot.sendMessage(msg.chat.id, `Reminder set for ${time}: ${message}`);
  }

  handleMute(msg) {
  }

  handleUnmute(msg) {
  }

  handleBan(msg) {
  }

  handleUnban(msg) {
  }
}

module.exports = CommandHandler;

