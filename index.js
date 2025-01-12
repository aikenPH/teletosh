require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const express = require('express');
const net = require('net');

const CommandHandler = require('./handlers/commandHandler');
const ModerationTools = require('./handlers/moderationTools');
const EventReminder = require('./handlers/eventReminder');
const AutomatedResponses = require('./handlers/automatedResponses');
const GroupManager = require('./handlers/groupManager');
const AutoReactHandler = require('./handlers/autoReactHandler');
const Database = require('./utils/database');
const config = require('./config');

const DEFAULT_PORT = 10000;
const MAX_PORT_ATTEMPTS = 10;
const URL = process.env.URL || `https://lumina-wyp1.onrender.com`;

const botBanner = `
░█─── ░█─░█ ░█▀▄▀█ ▀█▀ ░█▄─░█ ─█▀▀█ 
░█─── ░█─░█ ░█░█░█ ░█─ ░█░█░█ ░█▄▄█ 
░█▄▄█ ─▀▄▄▀ ░█──░█ ▄█▄ ░█──▀█ ░█─░█

Bot Name: Lumina
Description: Intelligent Telegram Bot
Author: JohnDev19
Version: 1.1.0
`;

Promise.config({
  cancellation: true
});

class LuminaBot {
  constructor() {
    this.botInfo = {
      name: 'Lumina',
      author: 'JohnDev19',
      version: '1.1.0',
      description: 'An intelligent and user-friendly Telegram bot'
    };

    this.initialize();
  }

  async initialize() {
    try {
      this.PORT = await this.findAvailablePort();
      await this.initializeBotAndServer();
    } catch (error) {
      console.error('Initialization Error:', error);
      process.exit(1);
    }
  }

  async findAvailablePort(currentAttempt = 1) {
    const tryPort = DEFAULT_PORT + currentAttempt - 1;

    return new Promise((resolve, reject) => {
      const server = net.createServer();

      server.once('error', async (err) => {
        server.close();

        if (err.code === 'EADDRINUSE') {
          if (currentAttempt < MAX_PORT_ATTEMPTS) {
            try {
              const port = await this.findAvailablePort(currentAttempt + 1);
              resolve(port);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error(`Could not find an available port after ${MAX_PORT_ATTEMPTS} attempts`));
          }
        } else {
          reject(err);
        }
      });

      server.once('listening', () => {
        const port = server.address().port;
        server.close(() => {
          resolve(port);
        });
      });

      server.listen(tryPort, '0.0.0.0');
    });
  }

  async initializeBotAndServer() {
    if (!config.BOT_TOKEN) {
      throw new Error('Telegram Bot Token not provided. Please check your .env file.');
    }

    // Initialize Express app first
    const app = express();
    app.use(express.json());

    // Create server instance
    const server = app.listen(this.PORT, '0.0.0.0');

    // Handle server errors
    server.on('error', async (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${this.PORT} is in use, attempting to find new port...`);
        server.close();
        this.PORT = await this.findAvailablePort();
        server.listen(this.PORT, '0.0.0.0');
      } else {
        console.error('Server Error:', error);
        process.exit(1);
      }
    });

    // Initialize Telegram Bot after server is successfully running
    server.on('listening', () => {
      console.log(`Server is running on port ${this.PORT}`);
      
      this.bot = new TelegramBot(config.BOT_TOKEN, {
        webHook: {
          port: this.PORT
        }
      });

      // Set webhook
      this.bot.setWebHook(`${URL}/bot${config.BOT_TOKEN}`);

      // Webhook route
      app.post(`/bot${config.BOT_TOKEN}`, (req, res) => {
        this.bot.processUpdate(req.body);
        res.sendStatus(200);
      });

      // Health check route
      app.get('/health', (req, res) => {
        res.status(200).json({
          status: 'healthy',
          port: this.PORT,
          timestamp: new Date().toISOString()
        });
      });

      // Get bot info
      this.bot.getMe().then(botInfo => {
        this.bot.botInfo = botInfo;
        console.log(`Bot initialized: @${botInfo.username}`);
        this.initializeComponents();
      }).catch(error => {
        console.error('Error getting bot information:', error);
      });
    });
  }

  initializeComponents() {
    this.db = new Database();
    this.commandHandler = new CommandHandler(this.bot, this.db);
    this.moderationTools = new ModerationTools(this.bot, this.db);
    this.eventReminder = new EventReminder(this.bot, this.db);
    this.automatedResponses = new AutomatedResponses(this.bot, this.db);
    this.groupManager = new GroupManager(this.bot, this.db);
    this.autoReactHandler = new AutoReactHandler(this.bot, this.db);

    this.setupEventListeners();
    this.loadCommands();
    this.setupErrorHandling();

    this.eventReminder.startEventChecking();
  }

  setupEventListeners() {
    this.bot.on('message', async (msg) => {
      try {
        const text = msg.text || msg.caption;

        if (text) {
          await this.autoReactHandler.handleMessageReaction(msg);

          if (text.startsWith('/setreminder')) {
            const reminderModule = require('./commands/setreminder');
            const args = text.split(' ').slice(1);
            await reminderModule.execute(
              this.bot, 
              msg, 
              args, 
              this.db
            );
          } else if (text.startsWith('/')) {
            await this.commandHandler.handleCommand(msg);
          } else {
            await this.automatedResponses.handleMessage(msg);
          }
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    this.bot.on('new_chat_members', async (msg) => {
      try {
        await this.groupManager.handleNewMember(msg);
      } catch (error) {
        console.error('Error handling new member:', error);
      }
    });

    this.bot.on('left_chat_member', async (msg) => {
      try {
        await this.groupManager.handleLeftMember(msg);
      } catch (error) {
        console.error('Error handling left member:', error);
      }
    });
  }

  loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      if (command.name !== 'setreminder') {
        this.commandHandler.addCommand(command.name, command.execute);
      }
    }
  }

  setupErrorHandling() {
    this.bot.on('error', (error) => {
      console.error('Bot Error:', error);
    });
  }
}

// Global error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${error.port} is already in use. The application will attempt to find an alternative port.`);
  }
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

console.log(botBanner);
const luminaBot = new LuminaBot();
console.log('Lumina Bot is running...');

module.exports = LuminaBot;
