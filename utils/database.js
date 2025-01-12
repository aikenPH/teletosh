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
      return { 
        reminders: [], 
        users: {},
        chats: {}
      };
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

  removeChat(chatId) {
    try {
      if (this.data.chats && this.data.chats[chatId]) {
        delete this.data.chats[chatId];
        this.saveData();
        console.log(`Chat ${chatId} removed from database`);
      }
    } catch (error) {
      console.error('Error removing chat from database:', error);
    }
  }

  addChat(chatId, chatData = {}) {
    if (!this.data.chats) {
      this.data.chats = {};
    }

    this.data.chats[chatId] = {
      id: chatId,
      title: chatData.title || 'Unknown Chat',
      type: chatData.type || 'unknown',
      addedAt: new Date().toISOString(),
      ...chatData
    };
    this.saveData();
  }

  updateChat(chatId, updateData) {
    if (!this.data.chats) {
      this.data.chats = {};
    }
    
    this.data.chats[chatId] = {
      ...this.data.chats[chatId],
      ...updateData
    };
    
    this.saveData();
  }

  getAllChats() {
    return this.data.chats ? Object.values(this.data.chats) : [];
  }
  
  getAllGroups() {
    return this.data.groups;
  }

  addGroup(groupId, groupTitle) {
    const existingGroup = this.data.groups.find(group => group.id === groupId);
    if (!existingGroup) {
      this.data.groups.push({ id: groupId, title: groupTitle });
      this.saveData();
    }
  }

  removeGroup(groupId) {
    this.data.groups = this.data.groups.filter(group => group.id !== groupId);
    this.saveData();
  }
}

module.exports = Database;
