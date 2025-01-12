require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Promise = require('bluebird');
const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const http = require('http');

const CommandHandler = require('./handlers/commandHandler');
const ModerationTools = require('./handlers/moderationTools');
const EventReminder = require('./handlers/eventReminder');
const AutomatedResponses = require('./handlers/automatedResponses');
const GroupManager = require('./handlers/groupManager');
const AutoReactHandler = require('./handlers/autoReactHandler');
const Database = require('./utils/database');
const config = require('./config');

class LuminaBot {
  constructor() {
    this.botInfo = {
      name: 'Lumina',
      author: 'JohnDev19',
      version: '1.1.0',
      description: 'An intelligent and user-friendly Telegram bot'
    };

    if (!config.BOT_TOKEN) {
      throw new Error('Telegram Bot Token not provided. Please check your .env or config file.');
    }

    const botOptions = {
      polling: process.env.NODE_ENV !== 'production',
      webHook: process.env.NODE_ENV === 'production' ? {
        port: this.getPort()
      } : false
    };

    this.bot = new TelegramBot(config.BOT_TOKEN, botOptions);

    if (process.env.NODE_ENV === 'production') {
      this.setupWebhook();
    }

    this.initializeComponents();

    this.setupEventListeners();
    this.setupErrorHandling();
  }

  getPort() {
    return process.env.PORT || 3000;
  }

  setupWebhook() {
    const url = process.env.URL || `https://lumina-wyp1.onrender.com`;
    this.bot.setWebHook(`${url}/bot${config.BOT_TOKEN}`);

    const app = express();
    const server = http.createServer(app);

    app.use(express.json());
    app.post(`/bot${config.BOT_TOKEN}`, (req, res) => {
      this.bot.processUpdate(req.body);
      res.sendStatus(200);
    });

    server.listen(this.getPort(), () => {
      console.log(`Webhook server running on port ${this.getPort()}`);
    });
  }

  initializeComponents() {
    try {
      this.db = new Database();
      this.commandHandler = new CommandHandler(this.bot, this.db);
      this.moderationTools = new ModerationTools(this.bot, this.db);
      this.eventReminder = new EventReminder(this.bot, this.db);
      this.automatedResponses = new AutomatedResponses(this.bot, this.db);
      this.groupManager = new GroupManager(this.bot, this.db);
      this.autoReactHandler = new AutoReactHandler(this.bot, this.db);

      this.loadCommands();
      this.eventReminder.startEventChecking();
    } catch (error) {
      console.error('Error initializing bot components:', error);
      process.exit(1);
    }
  }

  async loadCommands() {
    try {
      const commandsPath = path.join(__dirname, 'commands');
      const commandFiles = await fs.readdir(commandsPath);
      
      for (const file of commandFiles.filter(f => f.endsWith('.js'))) {
        try {
          const command = require(path.join(commandsPath, file));
          if (command.name && command.execute && command.name !== 'setreminder') {
            this.commandHandler.addCommand(command.name, command.execute);
          }
        } catch (cmdError) {
          console.error(`Error loading command ${file}:`, cmdError);
        }
      }
    } catch (error) {
      console.error('Error reading commands directory:', error);
    }
  }

  setupEventListeners() {
    this.bot.on('message', this.handleMessage.bind(this));
    this.bot.on('new_chat_members', this.handleNewMembers.bind(this));
    this.bot.on('left_chat_member', this.handleLeftMember.bind(this));
  }

  async handleMessage(msg) {
    try {
      const text = msg.text || msg.caption;

      if (text) {
        await this.autoReactHandler.handleMessageReaction(msg);

        if (text.startsWith('/setreminder')) {
          const reminderModule = require('./commands/setreminder');
          const args = text.split(' ').slice(1);
          await reminderModule.execute(this.bot, msg, args, this.db);
        } else if (text.startsWith('/')) {
          await this.commandHandler.handleCommand(msg);
        } else {
          await this.automatedResponses.handleMessage(msg);
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async handleNewMembers(msg) {
    try {
      await this.groupManager.handleNewMember(msg);
    } catch (error) {
      console.error('Error handling new member:', error);
    }
  }

  async handleLeftMember(msg) {
    try {
      await this.groupManager.handleLeftMember(msg);
    } catch (error) {
      console.error('Error handling left member:', error);
    }
  }

  setupErrorHandling() {
    this.bot.on('error', (error) => {
      console.error('Bot Error:', error);
    });
  }
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

const botBanner = `
░█─── ░█─░█ ░█▀▄▀█ ▀█▀ ░█▄─░█ ─█▀▀█ 
░█─── ░█─░█ ░█░█░█ ░█─ ░█░█░█ ░█▄▄█ 
░█▄▄█ ─▀▄▄▀ ░█──░█ ▄█▄ ░█──▀█ ░█─░█

Bot Name: Lumina
Description: Intelligent Telegram Bot
Author: JohnDev19
Version: 1.1.0
`;

console.log(botBanner);
const luminaBot = new LuminaBot();
console.log('Lumina Bot is running...');

module.exports = LuminaBot;
