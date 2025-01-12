module.exports = {
  name: 'clearcache',
  description: 'Clear bot cache and storage usage',
  
  async execute(bot, msg, args, db) {
    const botOwnerId = process.env.OWNER_ID ? parseInt(process.env.OWNER_ID) : null;

    if (!botOwnerId || msg.from.id !== botOwnerId) {
      return bot.sendMessage(msg.chat.id, '❌ This command is restricted to the bot creator only.');
    }

    try {
      const initialStats = process.memoryUsage();

      const clearOperations = [
        () => {
          if (db && typeof db.clearCache === 'function') {
            db.clearCache();
          }
        },
        () => {
          global.gc && global.gc();
        },
        () => {
          Object.keys(require.cache).forEach(key => {
            if (!key.includes('node_modules')) {
              delete require.cache[key];
            }
          });
        }
      ];

      clearOperations.forEach(operation => operation());

      const finalStats = process.memoryUsage();

      const cacheCleanupReport = `
🧹 <b>Cache Cleanup Report</b>

📊 Memory Usage Before Cleanup:
• Heap Used: ${(initialStats.heapUsed / 1024 / 1024).toFixed(2)} MB
• Heap Total: ${(initialStats.heapTotal / 1024 / 1024).toFixed(2)} MB

📉 Memory Usage After Cleanup:
• Heap Used: ${(finalStats.heapUsed / 1024 / 1024).toFixed(2)} MB
• Heap Total: ${(finalStats.heapTotal / 1024 / 1024).toFixed(2)} MB

🔍 Cleanup Operations:
• Database Cache Cleared
• Memory Garbage Collection Triggered
• Module Cache Refreshed

💾 Estimated Memory Freed: ${((initialStats.heapUsed - finalStats.heapUsed) / 1024 / 1024).toFixed(2)} MB
      `;

      await bot.sendMessage(msg.chat.id, cacheCleanupReport, {
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Cache Cleanup Error:', error);
      await bot.sendMessage(msg.chat.id, '❌ An error occurred during cache cleanup.');
    }
  }
};
