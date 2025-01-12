const fs = require('fs');
const path = require('path');
const os = require('os');

class OwnerControlHandler {
  constructor(bot, db) {
    this.bot = bot;
    this.db = db;
    this.maintenanceMode = false;
    this.startTime = Date.now();
  }

  async handleOwnerControl(msg, command) {
    const userId = msg.from.id.toString();
    if (userId !== process.env.OWNER_ID) {
      return this.bot.sendMessage(msg.chat.id, '⚠️ This command is only available for the bot owner.');
    }

    switch (command.toLowerCase()) {
      case 'maintenance':
        await this.toggleMaintenance(msg);
        break;
      case 'stats':
        await this.showSystemStats(msg);
        break;
      case 'clearcache':
        await this.clearCache(msg);
        break;
      case 'groups':
        await this.listGroups(msg);
        break;
      case 'broadcast':
        await this.broadcastMessage(msg);
        break;
      case 'leave':
        await this.leaveGroup(msg);
        break;
      case 'leaveall':
        await this.leaveAllGroups(msg);
        break;
      default:
        await this.showOwnerHelp(msg);
    }
  }

  async toggleMaintenance(msg) {
    this.maintenanceMode = !this.maintenanceMode;
    const status = this.maintenanceMode ? 'enabled' : 'disabled';
    const message = `🛠️ Maintenance mode ${status}
    
Current Status: ${this.maintenanceMode ? '🔒 Active' : '🔓 Inactive'}

${this.maintenanceMode ? 'Bot will only respond to owner commands.' : 'Bot has resumed normal operation.'}`;

    await this.bot.sendMessage(msg.chat.id, message);
  }

  async showSystemStats(msg) {
    const uptime = this.getUptime();
    const memoryUsage = process.memoryUsage();
    const stats = `📊 *System Statistics*

🕒 Uptime: ${uptime}
💾 Memory Usage:
  - RSS: ${this.formatBytes(memoryUsage.rss)}
  - Heap Total: ${this.formatBytes(memoryUsage.heapTotal)}
  - Heap Used: ${this.formatBytes(memoryUsage.heapUsed)}
💻 System Info:
  - Platform: ${process.platform}
  - Node Version: ${process.version}
  - CPU Usage: ${os.loadavg()[0].toFixed(2)}%
  - Total Memory: ${this.formatBytes(os.totalmem())}
  - Free Memory: ${this.formatBytes(os.freemem())}
📝 Database Stats:
  - Reminders: ${this.db.getReminders().length}
  - Users: ${Object.keys(this.db.data.users || {}).length}`;

    await this.bot.sendMessage(msg.chat.id, stats, { parse_mode: 'Markdown' });
  }

  async clearCache(msg) {
    try {
      // Clear database cache
      this.db.data = { reminders: [], users: {} };
      this.db.saveData();

      // Clear temp files
      const tempDir = path.join(__dirname, '../temp');
      if (fs.existsSync(tempDir)) {
        fs.readdirSync(tempDir).forEach(file => {
          fs.unlinkSync(path.join(tempDir, file));
        });
      }

      // Reset memory
      global.gc && global.gc();

      await this.bot.sendMessage(msg.chat.id, '🧹 Cache cleared successfully!\n\nCleared:\n- Database cache\n- Temporary files\n- Memory cache');
    } catch (error) {
      console.error('Error clearing cache:', error);
      await this.bot.sendMessage(msg.chat.id, '❌ Error clearing cache: ' + error.message);
    }
  }

  async listGroups(msg) {
    try {
      const groups = await this.getAllGroups();
      let message = '📋 *Bot Group List*\n\n';
      
      for (const group of groups) {
        message += `*Title:* ${group.title}\n`;
        message += `*ID:* \`${group.id}\`\n`;
        message += `*Members:* ${group.members_count}\n`;
        message += `*Admin:* ${group.is_admin ? '✅' : '❌'}\n\n`;
      }

      await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error listing groups:', error);
      await this.bot.sendMessage(msg.chat.id, '❌ Error fetching group list: ' + error.message);
    }
  }

  async broadcastMessage(msg) {
    if (!msg.reply_to_message) {
      await this.bot.sendMessage(msg.chat.id, '📝 Please reply to the message you want to broadcast.');
      return;
    }

    try {
      const groups = await this.getAllGroups();
      let successCount = 0;
      let failCount = 0;

      const progress = await this.bot.sendMessage(msg.chat.id, '📤 Broadcasting message...');

      for (const group of groups) {
        try {
          await this.bot.copyMessage(group.id, msg.chat.id, msg.reply_to_message.message_id);
          successCount++;
          if (successCount % 5 === 0) {
            await this.bot.editMessageText(
              `📤 Broadcasting message...\nProgress: ${successCount}/${groups.length}`,
              { chat_id: msg.chat.id, message_id: progress.message_id }
            );
          }
        } catch (error) {
          console.error(`Error broadcasting to ${group.id}:`, error);
          failCount++;
        }
      }

      await this.bot.editMessageText(
        `📤 Broadcast completed!\n\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`,
        { chat_id: msg.chat.id, message_id: progress.message_id }
      );
    } catch (error) {
      console.error('Error broadcasting:', error);
      await this.bot.sendMessage(msg.chat.id, '❌ Error broadcasting message: ' + error.message);
    }
  }

  async leaveGroup(msg) {
    if (msg.chat.type === 'private') {
      const usage = 'Usage: /control leave <group_id>';
      await this.bot.sendMessage(msg.chat.id, usage);
      return;
    }

    try {
      // Send farewell message
      await this.bot.sendMessage(msg.chat.id, '👋 As per owner\'s request, I\'ll be leaving this group. Goodbye!');
      
      // Leave the group
      await this.bot.leaveChat(msg.chat.id);
      
      // Notify owner
      if (msg.chat.id.toString() !== process.env.OWNER_ID) {
        await this.bot.sendMessage(process.env.OWNER_ID, `✅ Successfully left group: ${msg.chat.title} (${msg.chat.id})`);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      await this.bot.sendMessage(msg.chat.id, '❌ Error leaving group: ' + error.message);
    }
  }

  async leaveAllGroups(msg) {
    try {
      const groups = await this.getAllGroups();
      let successCount = 0;
      let failCount = 0;

      const progress = await this.bot.sendMessage(msg.chat.id, '🚪 Leaving all groups...');

      for (const group of groups) {
        try {
          // Don't leave if it's a private chat with the owner
          if (group.id.toString() === process.env.OWNER_ID) continue;

          // Send farewell message
          await this.bot.sendMessage(group.id, '👋 As per owner\'s request, I\'ll be leaving this group. Goodbye!');
          
          // Leave the group
          await this.bot.leaveChat(group.id);
          successCount++;

          await this.bot.editMessageText(
            `🚪 Leaving groups...\nProgress: ${successCount}/${groups.length - 1}`,
            { chat_id: msg.chat.id, message_id: progress.message_id }
          );
        } catch (error) {
          console.error(`Error leaving group ${group.id}:`, error);
          failCount++;
        }
      }

      await this.bot.editMessageText(
        `🚪 Leave operation completed!\n\n✅ Successfully left: ${successCount}\n❌ Failed: ${failCount}`,
        { chat_id: msg.chat.id, message_id: progress.message_id }
      );
    } catch (error) {
      console.error('Error leaving groups:', error);
      await this.bot.sendMessage(msg.chat.id, '❌ Error leaving groups: ' + error.message);
    }
  }

  async showOwnerHelp(msg) {
    const helpMessage = `🔐 *Owner Control Panel*

Available commands:
/control maintenance - Toggle maintenance mode
/control stats - Show system statistics
/control clearcache - Clear bot cache
/control groups - List all groups
/control broadcast - Broadcast message (reply to a message)
/control leave - Leave current group
/control leaveall - Leave all groups

Usage examples:
\`\`\`
/control maintenance
/control broadcast (reply to message)
/control leave
\`\`\``;

    await this.bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
  }

  // Utility methods
  getUptime() {
    const uptime = Date.now() - this.startTime;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  async getAllGroups() {
    // This is a placeholder. In a real bot, you would maintain a list of groups
    // in your database. For now, we'll return an example structure.
    return this.db.data.groups || [];
  }
}

module.exports = OwnerControlHandler;

