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
          keywords: ['quote', 'inspire', 'motivation'], 
          response: () => this.getInspirationalQuote(chatId) 
        },
        { 
          keywords: ['movie', 'film', 'recommend'], 
          response: () => this.recommendMovie(chatId) 
        },
        { 
          keywords: ['poem', 'poetry'], 
          response: () => this.getRandomPoem(chatId) 
        },
        { 
          keywords: ['trivia'], 
          response: () => this.getTriviaQuestion(chatId) 
        },
        { 
          keywords: ['advice'], 
          response: () => this.getLifeAdvice(chatId) 
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

  async getInspirationalQuote(chatId) {
    try {
      const quoteResponse = await axios.get('https://api.quotable.io/random');
      const quote = quoteResponse.data;

      const quoteMessage = `
💡 Inspirational Quote:

"${quote.content}"
- ${quote.author}
      `;

      this.bot.sendMessage(chatId, quoteMessage);
    } catch (error) {
      console.error('Quote Fetch Error:', error);
      this.bot.sendMessage(chatId, "Believe you can and you're halfway there!");
    }
  }

  async recommendMovie(chatId) {
    try {
      const movieResponse = await axios.get('https://api.themoviedb.org/3/movie/popular?api_key=4a1e2f274d0dfa4de6de64319d53a74c&language=en-US&page=1');
      const movies = movieResponse.data.results;
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];

      const movieMessage = `
🎬 Movie Recommendation:

Title: ${randomMovie.title}
Year: ${randomMovie.release_date.split('-')[0]}
Rating: ${randomMovie.vote_average}/10

Quick Synopsis: ${randomMovie.overview.slice(0, 200)}...
      `;

      this.bot.sendMessage(chatId, movieMessage);
    } catch (error) {
      console.error('Movie Recommendation Error:', error);
      this.bot.sendMessage(chatId, "The Shawshank Redemption - A classic movie about hope and friendship!");
    }
  }

  async getRandomPoem(chatId) {
    try {
      const poemResponse = await axios.get('https://www.poemist.com/api/v1/poems');
      const poems = poemResponse.data;
      const randomPoem = poems[Math.floor(Math.random() * poems.length)];

      const poemMessage = `
📜 Random Poem:

Title: ${randomPoem.title}
Poet: ${randomPoem.poet.name}

${randomPoem.lines.join('\n')}
      `;

      this.bot.sendMessage(chatId, poemMessage);
    } catch (error) {
      console.error('Poem Fetch Error:', error);
      this.bot.sendMessage(chatId, "Roses are red, violets are blue, poetry is magic, and so are you!");
    }
  }

  async getTriviaQuestion(chatId) {
    try {
      const triviaResponse = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
      const trivia = triviaResponse.data.results[0];

      const triviaMessage = `
🧠 Trivia Challenge:

Question: ${trivia.question}

A) ${trivia.incorrect_answers[0]}
B) ${trivia.incorrect_answers[1]}
C) ${trivia.incorrect_answers[2]}
D) ${trivia.correct_answer}

Can you guess the right answer?
      `;

      this.bot.sendMessage(chatId, triviaMessage);
    } catch (error) {
      console.error('Trivia Fetch Error:', error);
      this.bot.sendMessage(chatId, "What's the capital of France? Paris!");
    }
  }

  async getLifeAdvice(chatId) {
    try {
      const adviceResponse = await axios.get('https://api.adviceslip.com/advice');
      const advice = adviceResponse.data.slip.advice;

      const adviceMessage = `
💡 Life Advice:

${advice}
      `;

      this.bot.sendMessage(chatId, adviceMessage);
    } catch (error) {
      console.error('Advice Fetch Error:', error);
      this.bot.sendMessage(chatId, "Take a deep breath and remember, this too shall pass.");
    }
  }
}

module.exports = AutomatedResponses;
