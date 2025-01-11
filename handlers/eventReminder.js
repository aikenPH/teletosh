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
        if (this.isTimeToRemind(reminder.time, now)) {
          await this.sendReminder(reminder);
          await this.db.removeReminder(reminder.id);
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  isTimeToRemind(reminderTime, currentTime) {
    const reminderDate = new Date(reminderTime);
    return currentTime >= reminderDate;
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

  async addReminder(chatId, time, message, additionalData = {}) {
    const reminder = {
      id: Date.now(),
      chatId,
      time,
      message,
      ...additionalData
    };

    try {
      await this.db.addReminder(reminder);
      return reminder;
    } catch (error) {
      console.error('Error adding reminder:', error);
      throw error;
    }
  }
}

module.exports = EventReminder;