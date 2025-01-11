const axios = require('axios');

module.exports = {
  name: 'joke',
  description: 'Sends a hilarious random joke with a GIF',
  async execute(bot, msg) {
    try {
      const [jokeResponse, gifResponse] = await Promise.all([
        axios.get('https://official-joke-api.appspot.com/random_joke'),
        axios.get('https://api.giphy.com/v1/gifs/random', {
          params: {
            api_key: process.env.GIPHY_API_KEY,
            tag: 'laughing,funny,comedy',
            rating: 'pg'
          }
        })
      ]);

      const joke = jokeResponse.data;
      const gifUrl = gifResponse.data.data.images.downsized_medium.url;

      const jokeMessage = `
😂 <b>Get Ready to Laugh! 🤣</b>

${joke.setup}

<i>${joke.punchline}</i>

<b>Joke of the Moment!</b>
      `;

      bot.sendAnimation(msg.chat.id, gifUrl, {
        caption: jokeMessage,
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Joke Fetch Error:', error);

      const backupJokes = [
        {
          setup: "Why don't scientists trust atoms?",
          punchline: "Because they make up everything!"
        },
        {
          setup: "I told my wife she was drawing her eyebrows too high",
          punchline: "She looked surprised!"
        },
        {
          setup: "Why did the scarecrow win an award?",
          punchline: "Because he was outstanding in his field!"
        }
      ];

      const randomBackupJoke = backupJokes[Math.floor(Math.random() * backupJokes.length)];

      const errorMessage = `
❌ <b>Oops! Joke Retrieval Failed</b>

Here's a backup joke:
${randomBackupJoke.setup}

<i>${randomBackupJoke.punchline}</i>

<b>Humor is unpredictable! 😄</b>
      `;

      bot.sendMessage(msg.chat.id, errorMessage, { 
        parse_mode: 'HTML' 
      });
    }
  }
};