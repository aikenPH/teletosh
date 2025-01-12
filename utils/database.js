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
      return { reminders: [], users: {} };
    }
  }

  saveData() {
    fs.writeFileSync(this.filename, JSON.stringify(this.data, null, 2));
  }

  addReminder(reminder) {
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

  getUser(userId) {
    return this.data.users[userId] || { points: 0 };
  }

  updateUser(userId, userData) {
    this.data.users[userId] = { ...this.getUser(userId), ...userData };
    this.saveData();
  }

  addPoints(userId, points) {
    const user = this.getUser(userId);
    user.points += points;
    this.updateUser(userId, user);
  }

  clearCache() {
    try {
      this.data = {
        reminders: [],
        users: {},
        chats: {}
      };
      this.saveData();
      console.log('Database cache cleared successfully');
    } catch (error) {
      console.error('Error clearing database cache:', error);
    }
  }
}

module.exports = Database;

