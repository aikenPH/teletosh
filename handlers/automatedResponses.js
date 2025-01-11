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
      'Greetings! Ready to chat?'
    ];
    this.bot.sendMessage(chatId, greetings[Math.floor(Math.random() * greetings.length)]);
  }

  sendThanks(chatId) {
    const thankResponses = [
      "You're welcome! Always happy to help.",
      "No problem at all! That's what I'm here for.",
      "Glad I could assist you today!"
    ];
    this.bot.sendMessage(chatId, thankResponses[Math.floor(Math.random() * thankResponses.length)]);
  }

  async getWeather(chatId, text) {
    const cityMatch = text.match(/weather in (\w+)/i);
    if (cityMatch) {
      const city = cityMatch[1];
      try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            q: city,
            appid: process.env.OPENWEATHER_API_KEY,
            units: 'metric'
          }
        });

        const weatherData = response.data;
        const weatherMessage = `
🌦️ Current Weather in ${city.toUpperCase()}:
🌡️ Temperature: ${weatherData.main.temp}°C
☁️ Condition: ${weatherData.weather[0].description}
💨 Wind Speed: ${weatherData.wind.speed} m/s
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
      const [jokeResponse, gifResponse] = await Promise.all([
        axios.get('https://official-joke-api.appspot.com/random_joke'),
        axios.get('https://api.giphy.com/v1/gifs/random', {
          params: {
            api_key: process.env.GIPHY_API_KEY,
            tag: 'laughing,funny',
            rating: 'pg'
          }
        })
      ]);

      const joke = jokeResponse.data;
      const gifUrl = gifResponse.data.data.images.downsized_medium.url;

      const jokeMessage = `
😂 Joke Time! 

${joke.setup}

${joke.punchline}
      `;

      this.bot.sendAnimation(chatId, gifUrl, {
        caption: jokeMessage
      });
    } catch (error) {
      console.error('Joke Fetch Error:', error);
      this.bot.sendMessage(chatId, "Why don't scientists trust atoms? Because they make up everything!");
    }
  }

  async tellFact(chatId) {
    try {
      const [factResponse, gifResponse] = await Promise.all([
        axios.get('https://uselessfacts.jsph.pl/random.json?language=en'),
        axios.get('https://api.giphy.com/v1/gifs/random', {
          params: {
            api_key: process.env.GIPHY_API_KEY,
            tag: 'surprised,mind blown',
            rating: 'pg'
          }
        })
      ]);

      const fact = factResponse.data.text;
      const gifUrl = gifResponse.data.data.images.downsized_medium.url;

      const factMessage = `
🧠 Interesting Fact! 

${fact}
      `;

      this.bot.sendAnimation(chatId, gifUrl, {
        caption: factMessage
      });
    } catch (error) {
      console.error('Fact Fetch Error:', error);
      this.bot.sendMessage(chatId, "Did you know that the shortest war in history lasted only 38 minutes?");
    }
  }
}

module.exports = AutomatedResponses;