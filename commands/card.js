const { createCanvas, loadImage } = require('canvas');
const path = require('path');

class ContactCardGenerator {
  constructor() {
    this.userStates = new Map();
    this.themes = {
      default: {
        background: '#1a1a1a',
        gradient: ['#2193b0', '#6dd5ed'],
        text: '#ffffff',
        secondary: '#cccccc',
        accent: '#4a90e2'
      },
      blue: {
        background: '#1e3c72',
        gradient: ['#1e3c72', '#2a5298'],
        text: '#ffffff',
        secondary: '#e6e6e6',
        accent: '#5b9bd5'
      },
      purple: {
        background: '#4a148c',
        gradient: ['#4a148c', '#7c43bd'],
        text: '#ffffff',
        secondary: '#e6e6e6',
        accent: '#b39ddb'
      }
    };
  }

  getUserState(chatId) {
    if (!this.userStates.has(chatId)) {
      this.userStates.set(chatId, {
        step: 'start',
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
    const width = 1000;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const theme = this.themes[data.theme];

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, theme.gradient[0]);
    gradient.addColorStop(1, theme.gradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw pattern
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = theme.text;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    ctx.restore();

    // Draw profile picture if provided
    const textX = 50;
    let textY = 150;

    if (data.profileUrl) {
      try {
        const profileImage = await loadImage(data.profileUrl);
        const size = 150;
        const x = 50;
        const y = height / 2 - size / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(profileImage, x, y, size, size);
        ctx.restore();

        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    }

    // Draw contact information
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = theme.text;
    ctx.fillText(data.name, textX, textY);

    // Draw contact details
    textY += 80;
    ctx.font = '24px Arial';
    ctx.fillStyle = theme.secondary;
    if (data.phone) ctx.fillText(data.phone, textX, textY);
    if (data.email) ctx.fillText(data.email, textX + 350, textY);

    return canvas.toBuffer();
  }
}

module.exports = {
  name: 'card',
  description: 'Generate a contact card',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const cardGenerator = new ContactCardGenerator();
    const state = cardGenerator.getUserState(chatId);
    
    try {
      if (msg.text === 'start') {
        state.step = 'name';
        await bot.sendMessage(chatId, 'Let\'s create your contact card! What\'s your name?');
        return;
      }

      switch (state.step) {
        case 'name':
          state.data.name = msg.text;
          state.step = 'phone';
          await bot.sendMessage(chatId, 'Great! Now enter your phone number:');
          break;

        case 'phone':
          state.data.phone = msg.text;
          state.step = 'email';
          await bot.sendMessage(chatId, 'Perfect! What\'s your email address?');
          break;

        case 'email':
          state.data.email = msg.text;
          state.step = 'picture';
          await bot.sendMessage(chatId, 'Would you like to add a profile picture? Send a photo URL or type "skip":');
          break;

        case 'picture':
          if (msg.text.toLowerCase() !== 'skip') {
            state.data.profileUrl = msg.text;
          }
          state.step = 'theme';
          await bot.sendMessage(chatId, 'Choose your card theme (default, blue, or purple):');
          break;

        case 'theme':
          if (cardGenerator.themes[msg.text.toLowerCase()]) {
            state.data.theme = msg.text.toLowerCase();
          }
          await bot.sendMessage(chatId, '🎨 Generating your contact card...');
          
          const cardImage = await cardGenerator.generateCard(state.data);
          const imageBuffer = Buffer.from(cardImage);
          imageBuffer.filename = 'contact_card.png';
          
          await bot.sendPhoto(chatId, imageBuffer, {
            caption: '✨ Here\'s your personalized contact card! Use /card start to create a new one.'
          });
          
          // Reset state
          cardGenerator.userStates.delete(chatId);
          break;
      }
    } catch (error) {
      console.error('Card Generation Error:', error);
      await bot.sendMessage(chatId, '❌ Error generating card. Please use /card start to try again.');
      cardGenerator.userStates.delete(chatId);
    }
  }
};
