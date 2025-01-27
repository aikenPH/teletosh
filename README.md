# Lumina Bot

![Lumina Bot Logo](https://i.ibb.co/3YN5ggW/lumina.jpg)
![Lumina](https://i.ibb.co/DCxTK2q/IMG-20250126-111106.jpg)

Lumina is a Telegram bot assistant designed to provide intelligent interactions, automated responses, and versatile communication tools.

- Join here: https://t.me/+K3SoAlqE9_RjMzE1

## 🤖 Key Features

### Communication
- **AI-Powered Responses**: Intelligent and context-aware conversations
- **Automated Greetings**: Smart, personalized welcome messages
- **Voice Generation**: AI-generated voice responses with `/Lumina` command
- **ChatGPT Integration**: Direct access to advanced AI conversations with `/ChatGPT` command

## 🔐 Administrative Requirements

### Group Integration
- **Admin Privileges Required**: 
  - Lumina requires admin privileges to function fully in group chats
  - Without admin rights, bot functionality will be limited

### Owner Management
- **Exclusive Owner Commands**
  - Specific commands are restricted to bot owner
  - Owner identified by `OWNER_ID` in environment configuration
  - Example of owner-only command structure:
    ```javascript
    module.exports = {
      name: 'sampleName',
      description: 'sampleDescription',
      owner: true,
      execute: async (bot, msg, args, db) => {
      }
    }
    ```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (Node Package Manager)
- Telegram account

### Configuration

1. **Environment Variables**:
   Create a `.env` file with the following configurations:

   ```plaintext
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   OWNER_ID=your_telegram_user_id
   URL=https://your_deployment_url
   UPTIME_URL=your_uptime_monitoring_url
   ```

   **- Obtaining Bot Token**:
   
   ![botFather](https://i.ibb.co/pJjrhBy/IMG-20250126-103529.jpg)
   
   1. Visit BotFather on Telegram
   2. Use the /newbot command to create a new bot
   3. Choose a name and username for your bot
   4. BotFather will provide you with a bot token
  
   **- Obtaining ID**:
   
   ![id](https://i.ibb.co/fvZ8Cxw/IMG-20250126-102430.jpg)
   
   1. **Search for a User ID Bot**: You can search for a bot like @userinfobot on Telegram.
   2. **Start the Bot**: Click on the bot and press the "Start" button.
   3. **Get Your User ID in .env**: The bot will respond with your user ID and other information.
   4. **Setting up your Owner ID**:
   `OWNER_ID=your_telegram_user_id`
  
    **- Webhook Configuration**
   
   1. The bot uses a webhook for receiving updates
   2. Set the URL and PORT in the .env file
   3. Ensure your hosting platform supports webhooks
   

3. **Installation**:
   ```bash
   npm install
   ```

4. **Run the Bot**:
   ```bash
   node index.js
   ```

## Deploying Lumina (Render)
- [Read more here](DEPLOYMENT.md)

## 📜 Command Structure

Lumina's commands follow a standardized structure:

```javascript
module.exports = {
  name: 'commandName', // Unique command identifier
  description: 'Command purpose', // Brief description of the command
  owner: false, // Optional: Restrict to bot owner
  execute: async (bot, msg, args) => {
    // Command implementation
  }
};
```

### Command Properties
- `name`: The trigger for the command (e.g., 'fact')
- `description`: Explains what the command does
- `owner`: (Optional) Boolean to restrict command to bot owner
- `execute`: Async function containing the command's logic
  - `bot`: Telegram bot instance
  - `msg`: Message object
  - `args`: Optional command arguments

## 🛠 Core Handlers

- **autoReactHandler**
- **automatedResponses**
- **commandHandler** 
- **eventReminder**
- **groupManager** 
- **moderationTools**
- **ownerHandler**

## 🛡️ Database

1. Uses a simple JSON-based database system
2. Stores user data, group information, and game states
3. Located in the utils/database.js file

##  Customization

1. Easily add new commands by creating files in the commands directory
2. Modify existing command behavior in their respective files
3. Customize welcome/goodbye messages and images in the groupManager.js file

## 🔧 Customization

Lumina's behavior can be customized through:
- Handler configurations
- Environment variable settings
- Custom command implementations

## 📜 Commands

### Standard Commands
- `/start`: Initialize bot interaction
- `/help`: Display available commands
- `/Lumina`: Trigger AI-powered response with voice generation
- `/ChatGPT`: Direct access to ChatGPT conversation

### Owner Commands
- `/clearcache`: Clear bot's internal cache
- `/clear`: Clear all messages except confirmation
- `managegroups`: Manage groups: list, leave, or set auto-leave

## 🤝 Contributing

Contributions are welcome! Please submit pull requests or open issues for feature suggestions and improvements.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 💬 Support

Encounter issues? Open a GitHub issue or contact support through Telegram.

---

Lumina: Your Intelligent Telegram Companion 🌟
