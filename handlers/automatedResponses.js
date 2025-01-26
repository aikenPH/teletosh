const axios = require('axios');

class AutomatedResponses {
  constructor(bot, db) {
    this.bot = bot;
    this.db = db;
  }

  async handleMessage(msg) {
    if (!msg || !msg.text) return;

    try {
      const text = (msg.text || '').toLowerCase();
      const chatId = msg.chat.id;

      const responses = [
        { 
          keywords: ['hello', 'hi', 'hey'], 
          response: () => this.sendGreeting(chatId) 
        },
        { 
          keywords: ['thank', 'thanks'], 
          response: () => this.sendThanks(chatId) 
        },
        { 
          keywords: ['joke'], 
          response: () => this.tellJoke(chatId) 
        },
        { 
          keywords: ['quote', 'inspire', 'motivation'], 
          response: () => this.getInspirationalQuote(chatId) 
        },
        { 
          keywords: ['movie', 'film', 'recommend'], 
          response: () => this.recommendMovie(chatId) 
        },
        { 
          keywords: ['love', 'romantic'], 
          response: () => this.sendLoveQuote(chatId) 
        }
      ];

      for (const item of responses) {
        if (item.keywords.some(keyword => text.includes(keyword))) {
          await item.response();
          break;
        }
      }
    } catch (error) {
      console.error('Message Handling Error:', error);
    }
  }

  sendGreeting(chatId) {
    const greetings = [
      'Hello! How can I assist you today?',
      'Hi there! What can I help you with?',
      'Greetings! Ready to chat?',
      'Welcome! I\'m here to brighten your day!',
      'Hey! Excited to chat with you!'
    ];
    this.bot.sendMessage(chatId, greetings[Math.floor(Math.random() * greetings.length)]);
  }

  sendThanks(chatId) {
    const thankResponses = [
      "You're welcome! Always happy to help.",
      "No problem at all! That's what I'm here for.",
      "Glad I could assist you today!",
      "Happy to help! Anything else I can do for you?",
      "My pleasure! Spreading joy is my mission."
    ];
    this.bot.sendMessage(chatId, thankResponses[Math.floor(Math.random() * thankResponses.length)]);
  }

  async tellJoke(chatId) {
    try {
      const jokeResponse = await axios.get('https://v2.jokeapi.dev/joke/Any?type=twopart');
      const joke = jokeResponse.data;

      const jokeMessage = `
😂 Joke Time! 

${joke.setup}

${joke.delivery}
      `;

      this.bot.sendMessage(chatId, jokeMessage);
    } catch (error) {
      console.error('Joke Fetch Error:', error);
      this.bot.sendMessage(chatId, "Why don't scientists trust atoms? Because they make up everything!");
    }
  }

  async getInspirationalQuote(chatId) {
    try {
      const quoteResponse = await axios.get('https://zenquotes.io/api/random');
      const quote = quoteResponse.data[0];

      const quoteMessage = `
💡 Inspirational Quote:

"${quote.q}"
- ${quote.a}
      `;

      this.bot.sendMessage(chatId, quoteMessage);
    } catch (error) {
      console.error('Quote Fetch Error:', error);
      this.bot.sendMessage(chatId, "Believe you can and you're halfway there!");
    }
  }

  async recommendMovie(chatId) {
    try {
      const movieResponse = await axios.get('https://raw.githubusercontent.com/prust/wikipedia-movie-data/master/movies.json');
      const movies = movieResponse.data;
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];

      const movieMessage = `
🎬 Movie Recommendation:

Title: ${randomMovie.title}
Year: ${randomMovie.year}
Genres: ${randomMovie.genres ? randomMovie.genres.join(', ') : 'Not specified'}

Sounds like an interesting watch!
      `;

      this.bot.sendMessage(chatId, movieMessage);
    } catch (error) {
      console.error('Movie Recommendation Error:', error);
      this.bot.sendMessage(chatId, "The Shawshank Redemption - A classic movie about hope and friendship!");
    }
  }

  async sendLoveQuote(chatId) {
    try {
      const quoteResponse = await axios.get('https://zenquotes.io/api/quotes');
      const quotes = quoteResponse.data;
      const loveQuotes = quotes.filter(quote => 
        quote.q.toLowerCase().includes('love') || 
        quote.a.toLowerCase().includes('love')
      );

      const selectedQuote = loveQuotes.length > 0 
        ? loveQuotes[Math.floor(Math.random() * loveQuotes.length)]
        : { q: "Love is a journey, not a destination.", a: "Unknown" };

      const quoteMessage = `
❤️ Love Quote:

"${selectedQuote.q}"
- ${selectedQuote.a}
      `;

      this.bot.sendMessage(chatId, quoteMessage);
    } catch (error) {
      console.error('Love Quote Fetch Error:', error);
      this.bot.sendMessage(chatId, "Love is the greatest adventure of all!");
    }
  }
}

module.exports = AutomatedResponses;
