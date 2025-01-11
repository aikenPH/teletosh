class AutomatedResponses {
  constructor(bot, db) {
    this.bot = bot;
    this.db = db;
  }

  handleMessage(msg) {
    const text = msg.text.toLowerCase();
    const chatId = msg.chat.id;

    if (text.includes('hello') || text.includes('hi')) {
      this.bot.sendMessage(chatId, 'Hello! How can I assist you today?');
    } else if (text.includes('thank')) {
      this.bot.sendMessage(chatId, "You're welcome! I'm glad I could help.");
    } else if (text.includes('weather')) {
      this.bot.sendMessage(chatId, "I'm sorry, I don't have access to weather information. You can check a weather app or website for the most up-to-date forecast.");
    } else if (text.includes('joke')) {
      this.tellJoke(chatId);
    }
  }

  tellJoke(chatId) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "Why did the scarecrow win an award? He was outstanding in his field!",
      "Why don't eggs tell jokes? They'd crack each other up!",
      "What do you call a fake noodle? An impasta!",
      "Why did the math book look so sad? Because it had too many problems!"
    ];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    this.bot.sendMessage(chatId, randomJoke);
  }
}

module.exports = AutomatedResponses;

