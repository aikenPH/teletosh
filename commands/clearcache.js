const os = require('os');
const { promisify } = require('util');

module.exports = {
  name: 'clearcache',
  description: 'Clear bot cache and storage usage',
  owner: true,
  
  async execute(bot, msg, args, db) {
    try {
      const statusMessage = await bot.sendMessage(msg.chat.id, '🔄 Initiating cache cleanup...');

      const initialStats = {
        memory: process.memoryUsage(),
        systemFreeMem: os.freemem(),
        uptime: process.uptime()
      };

      let cleanupStatus = {
        dbCacheCleared: false,
        gcTriggered: false,
        modulesCleaned: 0
      };

      try {
        if (db && typeof db.clearCache === 'function') {
          await db.clearCache();
          cleanupStatus.dbCacheCleared = true;
        }
      } catch (dbError) {
        console.error('Database cache cleanup error:', dbError);
      }

      try {
        if (global.gc) {
          await new Promise(resolve => {
            global.gc();
            setTimeout(resolve, 100);
          });
          cleanupStatus.gcTriggered = true;
        }
      } catch (gcError) {
        console.error('Garbage collection error:', gcError);
      }

      try {
        const moduleKeys = Object.keys(require.cache);
        moduleKeys.forEach(key => {
          if (!key.includes('node_modules') && !key.includes('clearcache.js')) {
            delete require.cache[key];
            cleanupStatus.modulesCleaned++;
          }
        });
      } catch (moduleError) {
        console.error('Module cache cleanup error:', moduleError);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      const finalStats = {
        memory: process.memoryUsage(),
        systemFreeMem: os.freemem()
      };

      const memoryDiff = {
        heapUsed: initialStats.memory.heapUsed - finalStats.memory.heapUsed,
        heapTotal: initialStats.memory.heapTotal - finalStats.memory.heapTotal,
        external: initialStats.memory.external - finalStats.memory.external,
        systemMem: finalStats.systemFreeMem - initialStats.systemFreeMem
      };

      const formatMemory = (bytes) => {
        return (bytes / 1024 / 1024).toFixed(2);
      };

      const cacheCleanupReport = `
🧹 <b>Cache Cleanup Report</b>

📊 <b>Initial Memory State:</b>
• Heap Used: ${formatMemory(initialStats.memory.heapUsed)} MB
• Heap Total: ${formatMemory(initialStats.memory.heapTotal)} MB
• External: ${formatMemory(initialStats.memory.external)} MB

📉 <b>Final Memory State:</b>
• Heap Used: ${formatMemory(finalStats.memory.heapUsed)} MB
• Heap Total: ${formatMemory(finalStats.memory.heapTotal)} MB
• External: ${formatMemory(finalStats.memory.external)} MB

🔄 <b>Cleanup Operations:</b>
• Database Cache: ${cleanupStatus.dbCacheCleared ? '✅' : '❌'}
• Garbage Collection: ${cleanupStatus.gcTriggered ? '✅' : '❌'}
• Modules Refreshed: ${cleanupStatus.modulesCleaned} files

💾 <b>Memory Changes:</b>
• Heap Usage: ${formatMemory(memoryDiff.heapUsed)} MB
• Total Heap: ${formatMemory(memoryDiff.heapTotal)} MB
• External Memory: ${formatMemory(memoryDiff.external)} MB
• System Memory: ${formatMemory(memoryDiff.systemMem)} MB

⏰ <b>System Info:</b>
• Uptime: ${Math.floor(initialStats.uptime / 3600)} hours ${Math.floor((initialStats.uptime % 3600) / 60)} minutes
• Platform: ${os.platform()} ${os.release()}
      `;

      await bot.editMessageText(cacheCleanupReport, {
        chat_id: msg.chat.id,
        message_id: statusMessage.message_id,
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Cache Cleanup Error:', error);
      await bot.sendMessage(msg.chat.id, `❌ Cache cleanup error: ${error.message}`);
    }
  }
};

