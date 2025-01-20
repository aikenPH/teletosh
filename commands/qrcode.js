const QRCode = require('qrcode');
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AdvancedQRCodeGenerator {
  constructor() {
    this.defaultOptions = {
      width: 512,
      height: 512,
      margin: 2,
      colorDark: '#000000',
      colorLight: '#ffffff',
      errorCorrectionLevel: 'H'
    };
  }

  // Generate basic QR code
  async generateBasicQRCode(data, options = {}) {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      return await QRCode.toBuffer({
        data,
        width: mergedOptions.width,
        margin: mergedOptions.margin,
        color: {
          dark: mergedOptions.colorDark,
          light: mergedOptions.colorLight
        },
        errorCorrectionLevel: mergedOptions.errorCorrectionLevel
      });
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw error;
    }
  }

  // Create advanced styled QR code
  async createStyledQRCode(data, options = {}) {
    try {
      // Generate base QR code
      const qrBuffer = await this.generateBasicQRCode(data, options);

      // Create a stylish background
      const background = await sharp({
        create: {
          width: this.defaultOptions.width,
          height: this.defaultOptions.height,
          channels: 4,
          background: { r: 240, g: 240, b: 240, alpha: 1 }
        }
      })
      .png()
      .toBuffer();

      // Overlay QR code on background with shadow and rounded corners
      const styledQR = await sharp(background)
        .composite([
          {
            input: qrBuffer,
            top: 64,
            left: 64,
            blend: 'over'
          }
        ])
        .shadow({
          blur: 10,
          top: 5,
          left: 5,
          color: 'rgba(0,0,0,0.2)'
        })
        .roundCorners({
          radius: 20
        })
        .png()
        .toBuffer();

      return styledQR;
    } catch (error) {
      console.error('Styled QR Code generation error:', error);
      throw error;
    }
  }

  // Generate QR code with logo
  async generateQRCodeWithLogo(data, logoPath, options = {}) {
    try {
      // Generate base QR code
      const qrBuffer = await this.generateBasicQRCode(data, options);

      // Resize and process logo
      const logo = await sharp(logoPath)
        .resize(100, 100, {
          fit: sharp.fit.inside,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toBuffer();

      // Overlay logo on QR code
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
      console.error('QR Code with logo generation error:', error);
      throw error;
    }
  }

  // Validate URL or text
  validateInput(input) {
    // URL validation
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    // Check if input is a valid URL or non-empty text
    if (urlRegex.test(input) || (input && input.trim().length > 0)) {
      return true;
    }
    
    return false;
  }
}

module.exports = {
  name: 'qrcode',
  description: 'Generate advanced QR codes with multiple styling options',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const qrGenerator = new AdvancedQRCodeGenerator();

    // Check if input is provided
    if (args.length === 0) {
      return bot.sendMessage(chatId, '❌ Please provide a URL or text to generate QR code.');
    }

    const input = args.join(' ');

    // Validate input
    if (!qrGenerator.validateInput(input)) {
      return bot.sendMessage(chatId, '❌ Invalid input. Please provide a valid URL or non-empty text.');
    }

    try {
      // Generate styled QR code
      const qrCodeBuffer = await qrGenerator.createStyledQRCode(input);

      // Send QR code as photo
      await bot.sendPhoto(chatId, qrCodeBuffer, {
        caption: `QR Code for: ${input}`
      });
    } catch (error) {
      console.error('QR Code generation error:', error);
      await bot.sendMessage(chatId, '❌ Failed to generate QR code. Please try again.');
    }
  },

  // Additional methods for advanced usage
  generators: {
    withLogo: async (bot, msg, args, logoPath) => {
      const chatId = msg.chat.id;
      const qrGenerator = new AdvancedQRCodeGenerator();

      if (args.length === 0) {
        return bot.sendMessage(chatId, '❌ Please provide a URL or text to generate QR code.');
      }

      const input = args.join(' ');

      if (!qrGenerator.validateInput(input)) {
        return bot.sendMessage(chatId, '❌ Invalid input. Please provide a valid URL or non-empty text.');
      }

      try {
        // Generate QR code with logo
        const qrCodeBuffer = await qrGenerator.generateQRCodeWithLogo(input, logoPath);

        // Send QR code as photo
        await bot.sendPhoto(chatId, qrCodeBuffer, {
          caption: `QR Code with logo for: ${input}`
        });
      } catch (error) {
        console.error('QR Code with logo generation error:', error);
        await bot.sendMessage(chatId, '❌ Failed to generate QR code with logo. Please try again.');
      }
    }
  }
};
