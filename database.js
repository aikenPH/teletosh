const fs = require('fs');

class Database {
  constructor() {
    this.filename = 'database.json';
    this.data = this.loadData();
  }

  loadData() {
    try {
      const rawData = fs.readFileSync(this.filename);
      return JSON.parse(rawData);
    } catch (error) {
      console.log('No existing database found. Creating a new one.');
      return { reminders: [] };
    }
  }

  saveData() {
    fs.writeFileSync(this.filename, JSON.stringify(this.data, null, 2));
  }

  addReminder(chatId, time, message) {
    const reminder = {
      id: Date.now(),
      chatId,
      time,
      message
    };
    this.data.reminders.push(reminder);
    this.saveData();
  }

  getReminders() {
    return this.data.reminders;
  }

  removeReminder(id) {
    this.data.reminders = this.data.reminders.filter(reminder => reminder.id !== id);
    this.saveData();
  }
}

module.exports = Database;

