const axios = require('axios');
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
const OwnerHandler = require('./handlers/ownerHandler');

const PORT = process.env.PORT || 3000;
const URL = process.env.URL || `url_here`;
const UPTIME_URL = process.env.UPTIME_URL;

const botBanner = `

───────────────────────────────────────────────────────────────────────────────────────
─██████████████─██████████████─██████████████─██████──██████─██████████─██████████████─
─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░██──██░░██─██░░░░░░██─██░░░░░░░░░░██─
─██████░░██████─██░░██████░░██─██░░██████████─██░░██──██░░██─████░░████─██░░██████░░██─
─────██░░██─────██░░██──██░░██─██░░██─────────██░░██──██░░██───██░░██───██░░██──██░░██─
─────██░░██─────██░░██──██░░██─██░░██████████─██░░██████░░██───██░░██───██░░██████░░██─
─────██░░██─────██░░██──██░░██─██░░░░░░░░░░██─██░░░░░░░░░░██───██░░██───██░░░░░░░░░░██─
─────██░░██─────██░░██──██░░██─██████████░░██─██░░██████░░██───██░░██───██░░██████░░██─
─────██░░██─────██░░██──██░░██─────────██░░██─██░░██──██░░██───██░░██───██░░██──██░░██─
─────██░░██─────██░░██████░░██─██████████░░██─██░░██──██░░██─████░░████─██░░██──██░░██─
─────██░░██─────██░░░░░░░░░░██─██░░░░░░░░░░██─██░░██──██░░██─██░░░░░░██─██░░██──██░░██─
─────██████─────██████████████─██████████████─██████──██████─██████████─██████──██████─
───────────────────────────────────────────────────────────────────────────────────────

Bot Name: TOSHIA 
Description: Intelligent Telegram Bot
Author: TOSHI
Version: 1.1.0
`;

Promise.config({
  cancellation: true
});

class LuminaBot {
  constructor() {
    this.botInfo = {
      name: 'TOSHIA CHATBOT',
      author: 'TOSHI',
      version: '1.1.0',
      description: 'An intelligent and user-friendly Telegram bot'
    };

    this.initialize();
  }

  async initialize() {
    try {
      if (!config.BOT_TOKEN) {
        throw new Error('Telegram Bot Token not provided. Please check your .env file.');
      }

      const app = express();
      app.use(express.json());

      this.bot = new TelegramBot(config.BOT_TOKEN, {
        webHook: {
          port: PORT,
          host: '0.0.0.0'
        }
      });

      await this.bot.setWebHook(`${URL}/bot${config.BOT_TOKEN}`);

      app.post(`/bot${config.BOT_TOKEN}`, (req, res) => {
        this.bot.processUpdate(req.body);
        res.sendStatus(200);
      });

      app.get('/health', (req, res) => {
        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString()
        });
      });

      app.get('/keep-alive', (req, res) => {
        res.status(200).json({ status: 'Bot is alive', timestamp: new Date().toISOString() });
      });

      const botInfo = await this.bot.getMe();
      this.bot.botInfo = botInfo;
      console.log(`Bot initialized: @${botInfo.username}`);
      console.log(`Webhook server running on port ${PORT}`);

      await this.initializeComponents();

      this.startAutoLeaveCheck();

      if (UPTIME_URL) {
        setInterval(() => this.pingUptimeUrl(), 5 * 60 * 1000); // Ping every 5 minutes
        console.log('Uptime pinger initialized');
      }

      console.log('All components initialized successfully');
    } catch (error) {
      console.error('Initialization Error:', error);
      process.exit(1);
    }
  }

  async initializeComponents() {
    this.db = new Database();
    this.commandHandler = new CommandHandler(this.bot, this.db);
    this.moderationTools = new ModerationTools(this.bot, this.db);
    this.eventReminder = new EventReminder(this.bot, this.db);
    this.automatedResponses = new AutomatedResponses(this.bot, this.db);
    this.groupManager = new GroupManager(this.bot, this.db);
    this.autoReactHandler = new AutoReactHandler(this.bot, this.db);
    this.ownerHandler = new OwnerHandler(this.bot, this.db);

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

    this.bot.on('my_chat_member', async (chatMemberUpdated) => {
      if (chatMemberUpdated.new_chat_member.status === 'member' && 
          chatMemberUpdated.old_chat_member.status === 'left') {
        await this.groupManager.joinGroup(chatMemberUpdated.chat.id);
      } else if (chatMemberUpdated.new_chat_member.status === 'left' && 
                 chatMemberUpdated.old_chat_member.status === 'member') {
        await this.groupManager.leaveGroup(chatMemberUpdated.chat.id);
      }
    });
  }

  loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      if (command.name !== 'setreminder') {
        this.commandHandler.addCommand(command.name, command.execute, command.owner === true);
      }
    }
  }

  setupErrorHandling() {
    this.bot.on('error', (error) => {
      console.error('Bot Error:', error);
    });
  }

  async pingUptimeUrl() {
  if (UPTIME_URL) {
    try {
      await axios.get(UPTIME_URL);
    } catch (error) {
    }
  }
  }

  startAutoLeaveCheck() {
    setInterval(() => this.groupManager.checkAutoLeave(), 60 * 60 * 1000); // Check every hour
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
console.log('TOSHIA is running...');

module.exports = LuminaBot;
