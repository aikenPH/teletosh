const { createCanvas, loadImage } = require('canvas');
const path = require('path');

class ContactCardGenerator {
  constructor() {
    this.cardData = {
      name: '',
      phone: '',
      email: '',
      profileUrl: '',
      theme: 'default'
    };

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

  async setField(field, value) {
    this.cardData[field] = value;
  }

  async generateCard() {
    const width = 1000;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw background
    const theme = this.themes[this.cardData.theme] || this.themes.default;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, theme.gradient[0]);
    gradient.addColorStop(1, theme.gradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add decorative pattern
    this.drawPattern(ctx, width, height, theme);

    try {
      // Draw profile picture if URL is provided
      if (this.cardData.profileUrl) {
        const profileImage = await loadImage(this.cardData.profileUrl);
        const size = 150;
        const x = 50;
        const y = height / 2 - size / 2;

        // Draw circular profile picture
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(profileImage, x, y, size, size);
        ctx.restore();

        // Add glow effect
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw contact information
      const textX = this.cardData.profileUrl ? 250 : 50;
      let textY = 150;

      // Draw name
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = theme.text;
      ctx.fillText(this.cardData.name || 'Name Not Set', textX, textY);

      // Draw contact details with icons
      textY += 80;
      await this.drawContactInfo(ctx, textX, textY, theme);

      // Draw social media icons
      textY += 100;
      await this.drawSocialIcons(ctx, textX, textY, theme);

    } catch (error) {
      console.error('Error generating card:', error);
      throw error;
    }

    return canvas.toBuffer();
  }

  async drawContactInfo(ctx, x, y, theme) {
    const iconSize = 24;
    const spacing = 40;

    // Phone number
    if (this.cardData.phone) {
      const phoneIcon = await loadImage(path.join(__dirname, 'assets/phone-icon.png'));
      ctx.drawImage(phoneIcon, x, y - iconSize, iconSize, iconSize);
      ctx.font = '24px Arial';
      ctx.fillStyle = theme.secondary;
      ctx.fillText(this.cardData.phone, x + iconSize + 10, y);
    }

    // Email
    if (this.cardData.email) {
      const emailIcon = await loadImage(path.join(__dirname, 'assets/email-icon.png'));
      ctx.drawImage(emailIcon, x, y + spacing - iconSize, iconSize, iconSize);
      ctx.font = '24px Arial';
      ctx.fillStyle = theme.secondary;
      ctx.fillText(this.cardData.email, x + iconSize + 10, y + spacing);
    }
  }

  async drawSocialIcons(ctx, x, y, theme) {
    const iconSize = 40;
    const spacing = 60;

    // Facebook
    const fbIcon = await loadImage(path.join(__dirname, 'assets/facebook-icon.png'));
    ctx.drawImage(fbIcon, x, y, iconSize, iconSize);

    // Instagram
    const igIcon = await loadImage(path.join(__dirname, 'assets/instagram-icon.png'));
    ctx.drawImage(igIcon, x + spacing, y, iconSize, iconSize);

    // Messenger
    const msgrIcon = await loadImage(path.join(__dirname, 'assets/messenger-icon.png'));
    ctx.drawImage(msgrIcon, x + spacing * 2, y, iconSize, iconSize);
  }

  drawPattern(ctx, width, height, theme) {
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
  }
}

module.exports = {
  name: 'card',
  description: 'Generate a contact card',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const cardGenerator = new ContactCardGenerator();
    
    try {
      // Check if this is a reply to set a specific field
      if (msg.reply_to_message) {
        const originalCommand = msg.reply_to_message.text;
        const value = msg.text;

        if (originalCommand.startsWith('/card name')) {
          await cardGenerator.setField('name', value);
          await bot.sendMessage(chatId, '✅ Name set! Now use /card number to set your phone number.');
        } else if (originalCommand.startsWith('/card number')) {
          await cardGenerator.setField('phone', value);
          await bot.sendMessage(chatId, '✅ Phone number set! Now use /card email to set your email.');
        } else if (originalCommand.startsWith('/card email')) {
          await cardGenerator.setField('email', value);
          await bot.sendMessage(chatId, '✅ Email set! Now use /card generate to create your card!');
        }
        return;
      }

      // Handle direct commands
      const command = args[0]?.toLowerCase();
      
      switch (command) {
        case 'name':
          await bot.sendMessage(chatId, 'Please reply to this message with your name.');
          break;
          
        case 'number':
          await bot.sendMessage(chatId, 'Please reply to this message with your phone number.');
          break;
          
        case 'email':
          await bot.sendMessage(chatId, 'Please reply to this message with your email.');
          break;
          
        case 'theme':
          const theme = args[1]?.toLowerCase();
          if (theme && cardGenerator.themes[theme]) {
            await cardGenerator.setField('theme', theme);
            await bot.sendMessage(chatId, `✅ Theme set to ${theme}!`);
          } else {
            const availableThemes = Object.keys(cardGenerator.themes).join(', ');
            await bot.sendMessage(chatId, `Available themes: ${availableThemes}`);
          }
          break;
          
        case 'picture':
          const url = args[1];
          if (url) {
            await cardGenerator.setField('profileUrl', url);
            await bot.sendMessage(chatId, '✅ Profile picture set!');
          } else {
            await bot.sendMessage(chatId, 'Please provide a valid image URL.');
          }
          break;
          
        case 'generate':
          await bot.sendMessage(chatId, '🎨 Generating your contact card...');
          const cardImage = await cardGenerator.generateCard();
          
          // Create a Buffer with filename
          const imageBuffer = Buffer.from(cardImage);
          imageBuffer.filename = 'contact_card.png';
          
          await bot.sendPhoto(chatId, imageBuffer, {
            caption: '✨ Here\'s your personalized contact card!'
          });
          break;
          
        default:
          await bot.sendMessage(chatId, `
📇 <b>Contact Card Generator</b>

Commands:
/card name - Set your name
/card number - Set your phone number
/card email - Set your email
/card picture [URL] - Set profile picture
/card theme [theme] - Set card theme
/card generate - Generate your card

Available themes: default, blue, purple

<i>Reply to each command with the appropriate information.</i>
`, {
            parse_mode: 'HTML'
          });
      }
    } catch (error) {
      console.error('Card Generation Error:', error);
      await bot.sendMessage(chatId, '❌ Error generating card. Please try again.');
    }
  }
};
