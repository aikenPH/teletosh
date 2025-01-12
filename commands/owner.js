require('dotenv').config();
const os = require('os');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

module.exports = {
  name: 'owner',
  description: 'Owner-only control commands',
  async execute(bot, msg, args) {
    // Check if the user is the owner
    if (msg.from.id.toString() !== process.env.OWNER_ID) {
      return bot.sendMessage(msg.chat.id, '⛔ Access denied: Owner-only command.');
    }

    try {
      if (!args.length) {
        return bot.sendMessage(msg.chat.id, `
📊 <b>Owner Control Panel</b>

<b>System Commands:</b>
• /owner status - Show bot & system status
• /owner broadcast [message] - Send message to all users
• /owner maintenance [on/off] - Toggle maintenance mode
• /owner blacklist [add/remove] [userID] - Manage blacklist
• /owner eval [code] - Execute JavaScript code
• /owner shell [command] - Execute shell command
• /owner restart - Restart the bot
• /owner update - Pull latest changes and restart
• /owner logs [lines] - Show recent logs
• /owner stats - Show detailed statistics

<b>User Management:</b>
• /owner users list - List all users
• /owner users ban [userID] - Ban a user
• /owner users unban [userID] - Unban a user
• /owner users info [userID] - Get user info

<b>Settings:</b>
• /owner config list - Show current configuration
• /owner config set [key] [value] - Update config
• /owner config reset - Reset to defaults

<b>Database:</b>
• /owner db backup - Create database backup
• /owner db stats - Show database statistics
• /owner db clean - Clean unused data
`, { parse_mode: 'HTML' });
      }

      const command = args[0].toLowerCase();
      const subArgs = args.slice(1);

      switch (command) {
        case 'status': {
          const uptime = process.uptime();
          const memory = process.memoryUsage();
          const system = {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            cpuUsage: process.cpuUsage(),
            memTotal: os.totalmem(),
            memFree: os.freemem(),
            loadAvg: os.loadavg(),
          };

          return bot.sendMessage(msg.chat.id, `
🤖 <b>Bot Status Report</b>

<b>System Info:</b>
• Platform: ${system.platform} (${system.arch})
• Node.js: ${system.nodeVersion}
• CPU Load: ${system.loadAvg.map(load => `${(load * 100).toFixed(1)}%`).join(', ')}
• Memory: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(system.memTotal / 1024 / 1024 / 1024).toFixed(2)}GB
• Free Memory: ${(system.memFree / 1024 / 1024 / 1024).toFixed(2)}GB

<b>Bot Info:</b>
• Uptime: ${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m
• Memory RSS: ${(memory.rss / 1024 / 1024).toFixed(2)}MB
• External Memory: ${(memory.external / 1024 / 1024).toFixed(2)}MB
• Array Buffers: ${(memory.arrayBuffers / 1024 / 1024).toFixed(2)}MB
`, { parse_mode: 'HTML' });
        }

        case 'broadcast': {
          if (!subArgs.length) {
            return bot.sendMessage(msg.chat.id, '❌ Please provide a message to broadcast.');
          }

          const message = subArgs.join(' ');
          // You need to implement getUsersList() to get all users from your database
          const users = await getUsersList();
          let successful = 0;
          let failed = 0;

          const progress = await bot.sendMessage(msg.chat.id, '📤 Broadcasting message...');

          for (const user of users) {
            try {
              await bot.sendMessage(user.id, `
📢 <b>Broadcast Message</b>

${message}
`, { parse_mode: 'HTML' });
              successful++;
            } catch (err) {
              failed++;
            }

            // Update progress every 10 users
            if ((successful + failed) % 10 === 0) {
              await bot.editMessageText(`
📤 Broadcasting message...
• Sent: ${successful}
• Failed: ${failed}
• Remaining: ${users.length - (successful + failed)}
`, {
                chat_id: msg.chat.id,
                message_id: progress.message_id,
                parse_mode: 'HTML'
              });
            }
          }

          return bot.editMessageText(`
✅ <b>Broadcast Completed</b>
• Total Users: ${users.length}
• Successful: ${successful}
• Failed: ${failed}
`, {
            chat_id: msg.chat.id,
            message_id: progress.message_id,
            parse_mode: 'HTML'
          });
        }

        case 'eval': {
          if (!subArgs.length) {
            return bot.sendMessage(msg.chat.id, '❌ Please provide code to evaluate.');
          }

          const code = subArgs.join(' ');
          let result;

          try {
            result = await eval(`(async () => { ${code} })()`);
          } catch (err) {
            result = err;
          }

          return bot.sendMessage(msg.chat.id, `
📝 <b>Code Evaluation</b>

<b>Input:</b>
<code>${code}</code>

<b>Output:</b>
<code>${JSON.stringify(result, null, 2)}</code>
`, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
          });
        }

        case 'shell': {
          if (!subArgs.length) {
            return bot.sendMessage(msg.chat.id, '❌ Please provide a shell command.');
          }

          const command = subArgs.join(' ');
          let result;

          try {
            result = await exec(command);
          } catch (err) {
            result = { stdout: '', stderr: err.message };
          }

          return bot.sendMessage(msg.chat.id, `
🖥️ <b>Shell Command Execution</b>

<b>Command:</b>
<code>${command}</code>

<b>Output:</b>
<code>${result.stdout || 'No output'}</code>

${result.stderr ? `<b>Error:</b>\n<code>${result.stderr}</code>` : ''}
`, {
            parse_mode: 'HTML'
          });
        }

        case 'restart': {
          await bot.sendMessage(msg.chat.id, '🔄 Restarting bot...');
          process.exit(0); // PM2 or similar should restart the process
        }

        case 'update': {
          const progress = await bot.sendMessage(msg.chat.id, '🔄 Updating bot...');

          try {
            // Pull latest changes
            const { stdout: pullResult } = await exec('git pull');

            // Install dependencies
            const { stdout: npmResult } = await exec('npm install');

            await bot.editMessageText(`
✅ <b>Update Completed</b>

<b>Git Pull:</b>
<code>${pullResult}</code>

<b>NPM Install:</b>
<code>${npmResult}</code>

🔄 Restarting bot...
`, {
              chat_id: msg.chat.id,
              message_id: progress.message_id,
              parse_mode: 'HTML'
            });

            // Restart the bot
            process.exit(0);
          } catch (err) {
            await bot.editMessageText(`
❌ <b>Update Failed</b>

<b>Error:</b>
<code>${err.message}</code>
`, {
              chat_id: msg.chat.id,
              message_id: progress.message_id,
              parse_mode: 'HTML'
            });
          }
          break;
        }

        case 'maintenance': {
          const mode = subArgs[0]?.toLowerCase();
          if (!['on', 'off'].includes(mode)) {
            return bot.sendMessage(msg.chat.id, '❌ Please specify mode: on or off');
          }

          // You need to implement setMaintenanceMode() to store the state
          await setMaintenanceMode(mode === 'on');

          return bot.sendMessage(msg.chat.id, `
✅ Maintenance mode ${mode === 'on' ? 'enabled' : 'disabled'}

${mode === 'on' ? '⚠️ Bot will only respond to owner commands' : '✅ Bot is now accessible to all users'}
`);
        }

        default:
          return bot.sendMessage(msg.chat.id, '❌ Unknown owner command. Use /owner for help.');
      }
    } catch (error) {
      console.error('Owner Command Error:', error);
      
      return bot.sendMessage(msg.chat.id, `
❌ <b>Error Executing Command</b>
• Type: ${error.name}
• Message: ${error.message}
`, { parse_mode: 'HTML' });
    }
  }
};
