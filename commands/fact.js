const axios = require('axios');

module.exports = {
  name: 'fact',
  description: 'Sends a captivating random fact with a fun GIF',
  async execute(bot, msg) {
    try {
      const [factResponse, gifResponse] = await Promise.all([
        axios.get('https://uselessfacts.jsph.pl/random.json?language=en'),
        axios.get('https://api.giphy.com/v1/gifs/random', {
          params: {
            api_key: process.env.GIPHY_API_KEY,
            tag: 'mind blown,wow,surprising',
            rating: 'pg'
          }
        })
      ]);

      const fact = factResponse.data.text;
      const gifUrl = gifResponse.data.data.images.downsized_medium.url;

      const factMessage = `
<b>🌟 Fact Alert! 🧠</b>

${fact}

<i>Did you know something so unexpected today? 😮</i>
      `;

      bot.sendAnimation(msg.chat.id, gifUrl, {
        caption: factMessage,
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Fact Fetch Error:', error);

      const factCategories = {
        science: [
          "Honeybees can recognize human faces!",
          "A day on Venus is longer than its year!",
          "The human brain can read jumbled words if first and last letters are correct!"
        ],
        history: [
          "Cleopatra lived closer to the moon landing than to the construction of the Great Pyramid!",
          "The shortest war in history was 38 minutes long!",
          "Shakespeare invented over 1,700 words we use today!"
        ],
        nature: [
          "Octopuses have three hearts and blue blood!",
          "Bananas are berries, but strawberries aren't!",
          "Polar bears' fur is actually transparent, not white!"
        ]
      };

      const categories = Object.keys(factCategories);
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomFact = factCategories[randomCategory][Math.floor(Math.random() * factCategories[randomCategory].length)];

      const errorMessage = `
❌ <b>Oops! Fact Retrieval Failed</b>

🔍 Bonus ${randomCategory.toUpperCase()} Fact:
${randomFact}

<i>Technology can be unpredictable, just like facts! 🤷‍♂️</i>
      `;

      bot.sendMessage(msg.chat.id, errorMessage, { 
        parse_mode: 'HTML' 
      });
    }
  }
};