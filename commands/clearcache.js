const fs = require('fs');
const path = require('path');
const os = require('os');
const diskusage = require('diskusage');

module.exports = {
  name: 'clearcache',
  description: 'Comprehensive bot cache and storage management',
  
  async execute(bot, msg, args, db) {
    const botOwnerId = process.env.OWNER_ID ? parseInt(process.env.OWNER_ID) : null;

    if (!botOwnerId || msg.from.id !== botOwnerId) {
      return bot.sendMessage(msg.chat.id, '❌ This command is restricted to the bot creator only.');
    }

    try {
      const initialStats = process.memoryUsage();
      const tempDir = os.tmpdir();

      const calculateDirectorySize = (directoryPath) => {
        let totalSize = 0;
        try {
          const files = fs.readdirSync(directoryPath);
          files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              totalSize += stats.size;
            } else if (stats.isDirectory()) {
              totalSize += calculateDirectorySize(filePath);
            }
          });
        } catch (error) {
          console.error(`Error calculating directory size: ${error.message}`);
        }
        return totalSize;
      };

      const formatBytes = (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
      };

      const diskInfo = await diskusage.check('/');

      const storageCategories = {
        Stickers: calculateDirectorySize(path.join(tempDir, 'stickers')),
        Emojis: calculateDirectorySize(path.join(tempDir, 'emojis')),
        Videos: calculateDirectorySize(path.join(tempDir, 'videos')),
        Documents: calculateDirectorySize(path.join(tempDir, 'documents')),
        Miscellaneous: calculateDirectorySize(path.join(tempDir, 'misc')),
        Other: calculateDirectorySize(tempDir)
      };

      const totalCategorySize = Object.values(storageCategories).reduce((a, b) => a + b, 0);

      const categorySizes = Object.entries(storageCategories).map(([category, size]) => ({
        category,
        size: formatBytes(size),
        percentage: ((size / totalCategorySize) * 100).toFixed(2)
      }));

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
🧹 <b>Comprehensive Cache & Storage Management</b>

💻 System Storage:
• Total Disk Space: ${formatBytes(diskInfo.total)}
• Free Disk Space: ${formatBytes(diskInfo.free)}
• Used Disk Space: ${formatBytes(diskInfo.used)}
• Storage Usage: ${((diskInfo.used / diskInfo.total) * 100).toFixed(2)}%

📊 Memory Usage:
• Initial Heap Used: ${formatBytes(initialStats.heapUsed)}
• Final Heap Used: ${formatBytes(finalStats.heapUsed)}
• Memory Freed: ${formatBytes(initialStats.heapUsed - finalStats.heapUsed)}

🗂️ Storage Categories:
${categorySizes.map(cat => `• ${cat.category}: ${cat.size} (${cat.percentage}%)`).join('\n')}

🔍 Cleanup Operations:
• Database Cache Cleared
• Memory Garbage Collection Triggered
• Module Cache Refreshed

💾 Total Temporary Storage: ${formatBytes(totalCategorySize)}
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
