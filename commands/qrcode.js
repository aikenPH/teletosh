const QRCode = require('qrcode');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class AdvancedQRCodeGenerator {
  constructor() {
    this.defaultOptions = {
      width: 512,
      height: 512,
      margin: 4,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };
  }

  // Validate input (URL or text)
  validateInput(input) {
    if (!input) return false;
    
    // Comprehensive URL and text validation
    const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    const textRegex = /^.{1,500}$/;

    return urlRegex.test(input) || textRegex.test(input);
  }

  // Generate QR Code Buffer
  async generateQRCodeBuffer(data, options = {}) {
    try {
      const mergedOptions = { 
        ...this.defaultOptions, 
        ...options,
        data: data
      };

      // Generate QR Code
      const qrBuffer = await QRCode.toBuffer(mergedOptions);

      // Enhanced Styling
      const styledQRBuffer = await this.enhanceQRCodeStyle(qrBuffer);

      return styledQRBuffer;
    } catch (error) {
      console.error('QR Code Generation Error:', error);
      throw new Error('Failed to generate QR Code');
    }
  }

  // Enhance QR Code Style
  async enhanceQRCodeStyle(qrBuffer) {
    try {
      const styledQR = await sharp(qrBuffer)
        .extend({
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
          background: { r: 240, g: 240, b: 240, alpha: 1 }
        })
        .composite([
          {
            input: qrBuffer,
            top: 50,
            left: 50
          }
        ])
        .shadow({
          blur: 10,
          top: 5,
          left: 5,
          color: 'rgba(0,0,0,0.2)'
        })
        .png()
        .toBuffer();

      return styledQR;
    } catch (error) {
      console.error('QR Code Styling Error:', error);
      return qrBuffer; // Fallback to original if styling fails
    }
  }

  // Generate QR Code with Logo
  async generateQRCodeWithLogo(data, logoPath, options = {}) {
    try {
      // Validate logo
      await fs.access(logoPath);

      const qrBuffer = await this.generateQRCodeBuffer(data, options);

      // Process logo
      const logo = await sharp(logoPath)
        .resize(100, 100, {
          fit: sharp.fit.inside,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toBuffer();

      // Overlay logo
      const qrWithLogo = await sharp(qrBuffer)
        .composite([
          {
            input: logo,
            top: (this.defaultOptions.height - 100) / 2,
            left: (this.defaultOptions.width - 100) / 2
          }
        ])
        .png()
        .toBuffer();

      return qrWithLogo;
    } catch (error) {
      console.error('QR Code with Logo Error:', error);
      throw new Error('Failed to generate QR Code with Logo');
    }
  }
}

module.exports = {
  name: 'qrcode',
  description: 'Generate advanced QR codes with multiple styling options',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const qrGenerator = new AdvancedQRCodeGenerator();

    // Input validation
    if (args.length === 0) {
      return bot.sendMessage(chatId, '❌ Please provide a URL or text to generate QR code.');
    }

    const input = args.join(' ');

    // Validate input
    if (!qrGenerator.validateInput(input)) {
      return bot.sendMessage(chatId, '❌ Invalid input. Please provide a valid URL or text (1-500 characters).');
    }

    try {
      // Generate QR code
      const qrCodeBuffer = await qrGenerator.generateQRCodeBuffer(input);

      // Send QR code
      await bot.sendPhoto(chatId, qrCodeBuffer, {
        caption: `QR Code for: ${input.length > 50 ? input.substring(0, 50) + '...' : input}`
      });
    } catch (error) {
      console.error('QR Code Generation Error:', error);
      await bot.sendMessage(chatId, '❌ Failed to generate QR code. Please try again.');
    }
  },

  // Advanced QR Code Generation with Logo
  async generateWithLogo(bot, msg, args) {
    const chatId = msg.chat.id;
    const qrGenerator = new AdvancedQRCodeGenerator();

    // Check for input and logo
    if (args.length < 2) {
      return bot.sendMessage(chatId, '❌ Please provide text and logo path.');
    }

    const logoPath = args.pop(); // Last argument is logo path
    const input = args.join(' ');

    // Validate input and logo
    if (!qrGenerator.validateInput(input)) {
      return bot.sendMessage(chatId, '❌ Invalid input. Please provide a valid URL or text.');
    }

    try {
      // Generate QR code with logo
      const qrCodeBuffer = await qrGenerator.generateQRCodeWithLogo(input, logoPath);

      // Send QR code
      await bot.sendPhoto(chatId, qrCodeBuffer, {
        caption: `QR Code with Logo for: ${input.length > 50 ? input.substring(0, 50) + '...' : input}`
      });
    } catch (error) {
      console.error('QR Code with Logo Error:', error);
      await bot.sendMessage(chatId, '❌ Failed to generate QR code with logo. Check logo path.');
    }
  }
};
