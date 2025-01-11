class AutoReactHandler {
  constructor(bot) {
    this.bot = bot;
    this.reactionRules = {
      positive: [
        'good', 'great', 'awesome', 'excellent', 'amazing', 
        'wonderful', 'fantastic', 'cool', 'nice', 'love', 'best',
        'happy', 'awesome', 'brilliant', 'superb', 'outstanding',
        'incredible', 'impressive', 'epic', 'perfect', 'awesome'
      ],
      negative: [
        'bad', 'terrible', 'awful', 'horrible', 'worst', 
        'sad', 'unhappy', 'angry', 'frustrated', 'disappointed',
        'stupid', 'rubbish', 'garbage', 'pathetic', 'poor',
        'horrible', 'disgusting', 'terrible', 'useless', 'fail'
      ],
      tech: [
        'code', 'programming', 'developer', 'software', 
        'algorithm', 'technology', 'AI', 'machine learning',
        'coding', 'computer', 'tech', 'robot', 'automation',
        'database', 'network', 'system', 'hardware', 'software'
      ],
      greetings: [
        'hello', 'hi', 'hey', 'welcome', 'greetings', 'sup',
        'morning', 'afternoon', 'evening', 'yo', 'howdy',
        'greet', 'hi there', 'what\'s up', 'hola', 'bonjour'
      ],
      humor: [
        'joke', 'funny', 'lol', 'haha', 'humor', 'comedy',
        'laugh', 'hilarious', 'rofl', 'lmao', 'amusing',
        'witty', 'comic', 'gag', 'pun', 'silly'
      ],
      learning: [
        'learn', 'study', 'knowledge', 'education', 'research',
        'science', 'book', 'reading', 'wisdom', 'intelligent',
        'smart', 'clever', 'academic', 'scholar', 'lesson'
      ]
    };

    this.reactions = {
      positive: ['👍', '🌟', '🎉', '💯', '😄', '🥳', '🌈', '💖'],
      negative: ['👎', '😞', '🙁', '😕', '💥', '🤦', '😰', '💔'],
      tech: ['💻', '🤖', '📱', '🧠', '⚙️', '🖥️', '📡', '🔬'],
      greetings: ['👋', '🤝', '🌈', '😊', '🎈', '✨', '🌞', '🤗'],
      humor: ['😂', '🤣', '😆', '🤪', '😜', '🤡', '😹', '🎭'],
      learning: ['📚', '🧠', '🤓', '📖', '🎓', '💡', '🔍', '📝']
    };
  }

  determineReaction(message) {
    const lowercaseMessage = message.toLowerCase();

    for (const [category, keywords] of Object.entries(this.reactionRules)) {
      const matchedKeyword = keywords.find(keyword => {
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        return wordBoundaryRegex.test(lowercaseMessage);
      });

      if (matchedKeyword) {
        const categoryReactions = this.reactions[category];
        return categoryReactions[Math.floor(Math.random() * categoryReactions.length)];
      }
    }

    return null;
  }

  async handleMessageReaction(msg) {
    try {
      const chatId = msg.chat.id;
      const messageId = msg.message_id;
      const messageText = msg.text || msg.caption || '';

      if (messageText.startsWith('/')) return;

      const reaction = this.determineReaction(messageText);

      if (reaction) {
        await this.bot.sendMessage(chatId, reaction, {
          reply_to_message_id: messageId
        });
      }
    } catch (error) {
      console.error('Auto-React Handler Error:', error);
    }
  }

  async analyzeSentiment(message) {
    const lowercaseMessage = message.toLowerCase();

    const positiveWords = this.reactionRules.positive;
    const negativeWords = this.reactionRules.negative;

    const positiveCount = positiveWords.filter(word => 
      lowercaseMessage.includes(word)
    ).length;

    const negativeCount = negativeWords.filter(word => 
      lowercaseMessage.includes(word)
    ).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  addCustomReactionRule(category, keywords) {
    if (!this.reactionRules[category]) {
      this.reactionRules[category] = [];
      this.reactions[category] = [];
    }

    this.reactionRules[category].push(...keywords);
  }

  addCustomReactions(category, emojis) {
    if (!this.reactions[category]) {
      this.reactions[category] = [];
    }

    this.reactions[category].push(...emojis);
  }
}

module.exports = AutoReactHandler;