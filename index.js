const axios = require('axios');
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const net = require('net');
const cors = require('cors');

const CommandHandler = require('./handlers/commandHandler');
const ModerationTools = require('./handlers/moderationTools');
const EventReminder = require('./handlers/eventReminder');
const AutomatedResponses = require('./handlers/automatedResponses');
const GroupManager = require('./handlers/groupManager');
const AutoReactHandler = require('./handlers/autoReactHandler');
const Database = require('./utils/database');
const config = require('./config');
const OwnerHandler = require('./handlers/ownerHandler');

// Dynamic port configuration
const DEFAULT_PORT = parseInt(process.env.PORT || 3000);
const URL = process.env.URL || `https://lumina-wyp1.onrender.com`;
const UPTIME_URL = process.env.UPTIME_URL;

class LuminaBot {
  constructor() {
    this.botInfo = {
      name: 'Lumina',
      author: 'JohnDev19',
      version: '1.1.0',
      description: 'An intelligent and user-friendly Telegram bot'
    };

    this.app = express();
    this.server = null;
    this.initialize();
  }

  async findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      
      server.listen(startPort, '0.0.0.0', () => {
        const port = server.address().port;
        server.close(() => {
          resolve(port);
        });
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          // Try next port if current is in use
          this.findAvailablePort(startPort + 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(err);
        }
      });
    });
  }

  async initialize() {
    try {
      if (!config.BOT_TOKEN) {
        throw new Error('Telegram Bot Token not provided. Please check your .env file.');
      }

      // Find an available port
      const PORT = await this.findAvailablePort(DEFAULT_PORT);
      console.log(`Selected available port: ${PORT}`);

      // Middleware setup
      this.app.use(cors());
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: true }));
      this.app.use(express.static(path.join(__dirname, 'public')));

      // Create HTTP server
      this.server = http.createServer(this.app);

      // Create Telegram bot instance
      this.bot = new TelegramBot(config.BOT_TOKEN, {
        webHook: {
          port: PORT,
          host: '0.0.0.0'
        }
      });

      // Set webhook
      await this.bot.setWebHook(`${URL}/bot${config.BOT_TOKEN}`);

      // Webhook endpoint
      this.app.post(`/bot${config.BOT_TOKEN}`, (req, res) => {
        this.bot.processUpdate(req.body);
        res.sendStatus(200);
      });

      // Health check endpoint
      this.app.get('/health', (req, res) => {
        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          port: PORT,
          botInfo: this.botInfo
        });
      });

      // Root endpoint to serve index.html
      this.app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
      });

      // Keepalive endpoint
      this.app.get('/keep-alive', (req, res) => {
        res.status(200).json({ 
          status: 'Bot is alive', 
          timestamp: new Date().toISOString(),
          port: PORT,
          version: this.botInfo.version
        });
      });

      // Start server
      this.server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
      });

      // Initialize bot components
      await this.initializeComponents();

      // Start periodic checks
      this.startPeriodicTasks();

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
  }

  startPeriodicTasks() {
    this.eventReminder.startEventChecking();
    
    // Uptime pinger
    if (UPTIME_URL) {
      setInterval(() => this.pingUptimeUrl(), 5 * 60 * 1000);
      console.log('Uptime pinger initialized');
    }

    // Auto-leave check
    setInterval(() => this.groupManager.checkAutoLeave(), 60 * 60 * 1000);
  }

  setupEventListeners() {
    // Event listener implementations remain the same as in previous version
    // (Copying the entire previous setupEventListeners method here would make the response too long)
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

    // Add more robust error handling
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // Optionally restart or log more details
    });

    process.on('unhandledRejection', (error) => {
      console.error('Unhandled Rejection:', error);
    });
  }

  async pingUptimeUrl() {
    if (UPTIME_URL) {
      try {
        await axios.get(UPTIME_URL);
        console.log('Pinged uptime URL successfully');
      } catch (error) {
        console.error('Error pinging uptime URL:', error.message);
      }
    }
  }
}

// Initialize the bot
const luminaBot = new LuminaBot();

module.exports = LuminaBot;
