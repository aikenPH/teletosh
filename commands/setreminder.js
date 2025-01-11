module.exports = {
  name: 'setreminder',
  description: 'Set a reminder with flexible time options',
  async execute(bot, msg, args, db) {
    if (!db || typeof db.addReminder !== 'function') {
      console.error('Database object is invalid', db);
      return bot.sendMessage(msg.chat.id, '❌ Database connection error. Please contact support.');
    }

    if (args.length < 2) {
      return bot.sendMessage(msg.chat.id, `
❌ Invalid Usage! 

Reminder Format Options:
• /setreminder 5m Buy groceries (5 minutes)
• /setreminder 2h Team meeting (2 hours)
• /setreminder 1d Project deadline (1 day)
• /setreminder 3w Vacation planning (3 weeks)
• /setreminder 30s Quick task (30 seconds)

Time Units:
• s = Seconds
• m = Minutes
• h = Hours
• d = Days
• w = Weeks
      `);
    }

    const timeArg = args[0];
    const message = args.slice(1).join(' ');

    const timeUnits = {
      's': 1000,            // seconds
      'm': 60 * 1000,       // minutes
      'h': 60 * 60 * 1000,  // hours
      'd': 24 * 60 * 60 * 1000,  // days
      'w': 7 * 24 * 60 * 60 * 1000  // weeks
    };

    const match = timeArg.match(/^(\d+)([smhdw])$/);
    if (!match) {
      return bot.sendMessage(msg.chat.id, '❌ Invalid time format. Use number followed by s/m/h/d/w');
    }

    const [, amount, unit] = match;

    const currentTime = new Date();
    const reminderTime = new Date(currentTime.getTime() + parseInt(amount) * timeUnits[unit]);

    try {
      const reminder = {
        id: Date.now().toString(),
        chatId: msg.chat.id,
        time: reminderTime.toISOString(),
        message: message,
        userId: msg.from.id,
        username: msg.from.username || '',
        firstName: msg.from.first_name,
        lastName: msg.from.last_name || '',
        originalAmount: parseInt(amount),
        originalUnit: unit
      };

      console.log('Attempting to add reminder:', reminder);
      await db.addReminder(reminder);

      const formattedTime = reminderTime.toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });

      return bot.sendMessage(msg.chat.id, `
✅ Reminder Set Successfully!

⏰ Reminder in: ${amount}${unit}
📅 Time: ${formattedTime}
📝 Message: ${message}

I'll remind you when the time comes! 🕒
      `);

    } catch (error) {
      console.error('Set Reminder Error:', error);

      bot.sendMessage(msg.chat.id, `
❌ Failed to set reminder.
Error: ${error.message}

Please try again later.
      `);
    }
  }
};