const OwnerControlHandler = require('../handlers/ownerControlHandler');

module.exports = {
  name: 'control',
  description: 'Owner control panel (Owner only)',
  async execute(bot, msg, args) {
    const ownerControlHandler = new OwnerControlHandler(bot, bot.db);
    const command = args[0] || 'help';
    await ownerControlHandler.handleOwnerControl(msg, command);
  }
};

