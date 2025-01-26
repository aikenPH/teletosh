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
          keywords: ['weather'], 
          response: () => this.getWeather(chatId, text) 
        },
        { 
          keywords: ['joke'], 
          response: () => this.tellJoke(chatId) 
        },
        { 
          keywords: ['fact'], 
          response: () => this.tellFact(chatId) 
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
          keywords: ['trivia'], 
          response: () => this.getTriviaQuestion(chatId) 
        },
        { 
          keywords: ['cat', 'cats'], 
          response: () => this.getCatFact(chatId) 
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

  async getWeather(chatId, text) {
    const cityMatch = text.match(/weather in (\w+)/i);
    if (cityMatch) {
      const city = cityMatch[1];
      try {
        const response = await axios.get('https://weatherapi-com.p.rapidapi.com/current.json', {
          params: { q: city },
          headers: {
            'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
            'X-RapidAPI-Key': 'your_free_rapidapi_key_here'
          }
        });

        const weatherData = response.data.current;
        const weatherMessage = `
🌦️ Current Weather in ${city.toUpperCase()}:
🌡️ Temperature: ${weatherData.temp_c}°C
☁️ Condition: ${weatherData.condition.text}
💨 Wind Speed: ${weatherData.wind_kph} km/h
        `;

        this.bot.sendMessage(chatId, weatherMessage);
      } catch (error) {
        console.error('Weather Fetch Error:', error);
        this.bot.sendMessage(chatId, `Sorry, I couldn't find weather information for ${city}. Please check the city name.`);
      }
    } else {
      this.bot.sendMessage(chatId, "Please specify a city. For example, 'weather in London'.");
    }
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
      const movieResponse = await axios.get('https://movies-api14.p.rapidapi.com/random', {
        headers: {
          'X-RapidAPI-Host': 'movies-api14.p.rapidapi.com',
          'X-RapidAPI-Key': 'your_free_rapidapi_key_here'
        }
      });

      const movie = movieResponse.data;
      const movieMessage = `
🎬 Movie Recommendation:

Title: ${movie.title}
Year: ${movie.year}
Genre: ${movie.genres.join(', ')}
Rating: ${movie.rating}

Quick Synopsis: ${movie.overview.slice(0, 200)}...
      `;

      this.bot.sendMessage(chatId, movieMessage);
    } catch (error) {
      console.error('Movie Recommendation Error:', error);
      this.bot.sendMessage(chatId, "The Shawshank Redemption - A classic movie about hope and friendship!");
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

  async getCatFact(chatId) {
    try {
      const catFactResponse = await axios.get('https://catfact.ninja/fact');
      const catFact = catFactResponse.data.fact;

      const catFactMessage = `
🐱 Cat Fact:

${catFact}
      `;

      this.bot.sendMessage(chatId, catFactMessage);
    } catch (error) {
      console.error('Cat Fact Fetch Error:', error);
      this.bot.sendMessage(chatId, "Cats have over 20 different vocalizations!");
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

  async tellFact(chatId) {
    try {
      const factResponse = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
      const fact = factResponse.data.text;

      const factMessage = `
🧠 Interesting Fact! 

${fact}
      `;

      this.bot.sendMessage(chatId, factMessage);
    } catch (error) {
      console.error('Fact Fetch Error:', error);
      this.bot.sendMessage(chatId, "Did you know that the shortest war in history lasted only 38 minutes?");
    }
  }
}

module.exports = AutomatedResponses;
