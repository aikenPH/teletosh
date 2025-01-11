module.exports = {
  name: 'start',
  description: 'Initializes the bot and begins interaction with the user.',
  execute(bot, msg) {
    const welcomeMessage = `Welcome to Lumina Bot! 🌟
I'm here to assist you with various tasks.

Type /help to see a list of available commands.`;
    bot.sendMessage(msg.chat.id, welcomeMessage);
  }
};

