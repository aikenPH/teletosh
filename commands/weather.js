const axios = require('axios');

module.exports = {
  name: 'weather',
  description: 'Get 5-day weather forecast for a location',
  async execute(bot, msg, args) {
    if (args.length < 1) {
      return bot.sendMessage(msg.chat.id, '❌ Please provide a location name. Usage: /weather <location>');
    }

    const location = args.join(' ');

    try {
      const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: {
          q: location,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric'
        }
      });

      const forecastData = forecastResponse.data;
      let forecastMessage = `<b>🌍 5-Day Weather Forecast for ${location.toUpperCase()}</b>\n\n`;

      const dailyForecasts = {};
      forecastData.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });

        if (!dailyForecasts[day]) {
          dailyForecasts[day] = {
            temps: [],
            descriptions: [],
            humidity: [],
            windSpeed: []
          };
        }

        dailyForecasts[day].temps.push(forecast.main.temp);
        dailyForecasts[day].descriptions.push(forecast.weather[0].description);
        dailyForecasts[day].humidity.push(forecast.main.humidity);
        dailyForecasts[day].windSpeed.push(forecast.wind.speed);
      });

      Object.entries(dailyForecasts).forEach(([day, data]) => {
        const avgTemp = (data.temps.reduce((a, b) => a + b, 0) / data.temps.length).toFixed(1);
        const commonDescription = getMostFrequent(data.descriptions);
        const avgHumidity = Math.round(data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length);
        const avgWindSpeed = (data.windSpeed.reduce((a, b) => a + b, 0) / data.windSpeed.length).toFixed(1);

        forecastMessage += `
<b>📅 ${day}:</b>
🌡️ <i>Avg Temp:</i> ${avgTemp}°C
☁️ <i>Condition:</i> ${commonDescription}
💧 <i>Humidity:</i> ${avgHumidity}%
💨 <i>Wind Speed:</i> ${avgWindSpeed} m/s
        `;
      });

      forecastMessage += `\n<i>Forecast for ${forecastData.city.name}, ${forecastData.city.country}</i>`;

      bot.sendMessage(msg.chat.id, forecastMessage, { parse_mode: 'HTML' });

    } catch (error) {
      let errorMessage = '❌ Unable to fetch forecast information.';

      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = `🏙️ Location "${location}" not found. Please check the name.`;
            break;
          case 401:
            errorMessage = '🔒 Invalid API key. Please contact support.';
            break;
          case 429:
            errorMessage = '⏳ Too many requests. Please try again later.';
            break;
          case 500:
            errorMessage = '🖥️ Server error. Please try again later.';
            break;
          default:
            errorMessage = `❌ Error: ${error.response.data.message || 'Unknown error occurred'}`;
        }
      } else if (error.request) {
        errorMessage = '🌐 No response from weather service. Check your internet connection.';
      } else {
        errorMessage = '❌ An unexpected error occurred. Please try again.';
      }

      console.error('Weather Forecast API Error:', error.message);
      bot.sendMessage(msg.chat.id, errorMessage);
    }
  }
};

function getMostFrequent(arr) {
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
}