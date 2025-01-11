class EventReminder {
  constructor(bot, db) {
    this.bot = bot;
    this.db = db;
  }

  startEventChecking() {
    setInterval(() => {
      this.checkReminders();
    }, 5000);
  }

  async checkReminders() {
    try {
      const now = new Date();
      const reminders = await this.db.getReminders();

      for (const reminder of reminders) {
        const reminderTime = new Date(reminder.time);

        if (reminderTime <= now) {
          await this.sendReminder(reminder);
          await this.db.removeReminder(reminder.id);
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  async sendReminder(reminder) {
    try {
      const userDisplay = reminder.username 
        ? `@${reminder.username}` 
        : `${reminder.firstName} ${reminder.lastName || ''}`.trim();

      await this.bot.sendMessage(reminder.chatId, `
🔔 Reminder for ${userDisplay}!

⏰ Reminder: ${reminder.message}

Duration: ${reminder.originalAmount}${reminder.originalUnit}
      `);
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  }
}

module.exports = EventReminder;