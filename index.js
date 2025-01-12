require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const express = require('express');
const CommandHandler = require('./handlers/commandHandler');
const ModerationTools = require('./handlers/moderationTools');
const EventReminder = require('./handlers/eventReminder');
const AutomatedResponses = require('./handlers/automatedResponses');
const GroupManager = require('./handlers/groupManager');
const AutoReactHandler = require('./handlers/autoReactHandler');
const Database = require('./utils/database');
const config = require('./config');

const PORT = process.env.PORT || 3000;
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

    if (!config.BOT_TOKEN) {
      throw new Error('Telegram Bot Token not provided. Please check your .env file.');
    }

    // Initialize bot with proper options
    this.bot = new TelegramBot(config.BOT_TOKEN, {
      polling: true,
      filepath: false
    });

    // Set bot information
    this.bot.getMe().then(botInfo => {
      this.bot.botInfo = botInfo;
    }).catch(error => {
      console.error('Error getting bot information:', error);
    });

    this.bot.setWebHook(`${URL}/bot${config.BOT_TOKEN}`);

    const app = express();
    app.use(express.json());
    app.post(`/bot${config.BOT_TOKEN}`, (req, res) => {
      this.bot.processUpdate(req.body);
      res.sendStatus(200);
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

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
        }

        if (text && text.startsWith('/setreminder')) {
          const reminderModule = require('./commands/setreminder');
          const args = text.split(' ').slice(1);
          await reminderModule.execute(
            this.bot, 
            msg, 
            args, 
            this.db
          );
        } else if (text && text.startsWith('/')) {
          await this.commandHandler.handleCommand(msg);
        } else {
          await this.automatedResponses.handleMessage(msg);
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

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

console.log(botBanner);
const luminaBot = new LuminaBot();
console.log('Lumina Bot is running...');

module.exports = LuminaBot;

