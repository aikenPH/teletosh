const { createCanvas, loadImage } = require('canvas');

class ContactCardGenerator {
  constructor() {
    this.userStates = new Map();
    this.themes = {
      default: {
        gradient: ['#2193b0', '#6dd5ed'],
        text: '#ffffff',
        secondary: '#cccccc'
      },
      blue: {
        gradient: ['#1e3c72', '#2a5298'],
        text: '#ffffff',
        secondary: '#e6e6e6'
      },
      purple: {
        gradient: ['#4a148c', '#7c43bd'],
        text: '#ffffff',
        secondary: '#e6e6e6'
      }
    };
  }

  clearState(chatId) {
    this.userStates.delete(chatId);
  }

  getState(chatId) {
    if (!this.userStates.has(chatId)) {
      this.userStates.set(chatId, {
        step: 'name',
        data: {
          name: '',
          phone: '',
          email: '',
          profileUrl: '',
          theme: 'default'
        }
      });
    }
    return this.userStates.get(chatId);
  }

  async generateCard(data) {
    const canvas = createCanvas(1000, 500);
    const ctx = canvas.getContext('2d');
    const theme = this.themes[data.theme];

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1000, 500);
    gradient.addColorStop(0, theme.gradient[0]);
    gradient.addColorStop(1, theme.gradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 500);

    // Grid pattern
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = theme.text;
    for (let i = 0; i < 1000; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 500);
      ctx.stroke();
    }
    for (let i = 0; i < 500; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1000, i);
      ctx.stroke();
    }
    ctx.restore();

    // Profile picture
    let textX = 50;
    if (data.profileUrl) {
      try {
        const img = await loadImage(data.profileUrl);
        const size = 150;
        const x = 50;
        const y = 175;

        // Circular mask
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();

        // White border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        ctx.stroke();

        textX = 250;
      } catch (error) {
        console.error('Profile image load failed:', error);
      }
    }

    // Text content
    ctx.fillStyle = theme.text;
    ctx.font = 'bold 48px Arial';
    ctx.fillText(data.name, textX, 150);

    ctx.fillStyle = theme.secondary;
    ctx.font = '24px Arial';
    ctx.fillText(data.phone, textX, 230);
    ctx.fillText(data.email, textX, 270);

    return canvas.toBuffer();
  }
}

module.exports = {
  name: 'card',
  description: 'Generate a contact card',
  
  async execute(bot, msg) {
    const chatId = msg.chat.id;
    const generator = new ContactCardGenerator();
    
    // Handle /card command without args
    if (msg.text === '/card') {
      generator.clearState(chatId);
      await bot.sendMessage(chatId, 'Let\'s create your contact card! What\'s your name?');
      return;
    }

    const state = generator.getState(chatId);
    const text = msg.text;

    try {
      switch(state.step) {
        case 'name':
          state.data.name = text;
          state.step = 'phone';
          await bot.sendMessage(chatId, 'Great! Now enter your phone number:');
          break;

        case 'phone':
          if (!/^\+?[\d\s-]{10,}$/.test(text)) {
            await bot.sendMessage(chatId, 'Please enter a valid phone number:');
            return;
          }
          state.data.phone = text;
          state.step = 'email';
          await bot.sendMessage(chatId, 'Perfect! What\'s your email address?');
          break;

        case 'email':
          if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[\w-]{2,}$/.test(text)) {
            await bot.sendMessage(chatId, 'Please enter a valid email address:');
            return;
          }
          state.data.email = text;
          state.step = 'picture';
          await bot.sendMessage(chatId, 'Would you like to add a profile picture? Send a URL or type "skip":');
          break;

        case 'picture':
          if (text.toLowerCase() !== 'skip') {
            if (!/^https?:\/\/.*\.(jpg|jpeg|png|gif)$/i.test(text)) {
              await bot.sendMessage(chatId, 'Please enter a valid image URL or type "skip":');
              return;
            }
            state.data.profileUrl = text;
          }
          state.step = 'theme';
          await bot.sendMessage(chatId, 'Choose your card theme (default, blue, or purple):');
          break;

        case 'theme':
          const theme = text.toLowerCase();
          if (!generator.themes[theme]) {
            await bot.sendMessage(chatId, 'Please choose: default, blue, or purple');
            return;
          }
          state.data.theme = theme;
          
          await bot.sendMessage(chatId, '🎨 Generating your card...');
          const cardBuffer = await generator.generateCard(state.data);
          
          await bot.sendPhoto(chatId, cardBuffer, {
            caption: '✨ Here\'s your card! Use /card to create a new one.'
          });
          
          generator.clearState(chatId);
          break;
      }
    } catch (error) {
      console.error('Card generation error:', error);
      await bot.sendMessage(chatId, '❌ Error occurred. Use /card to start over.');
      generator.clearState(chatId);
    }
  }
};
