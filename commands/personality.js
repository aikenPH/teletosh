const axios = require('axios');

// MBTI Questions Database
const questions = [
  {
    id: 1,
    text: "How do you prefer to spend your free time?",
    options: [
      { text: "Going out with friends and meeting new people", type: "E" },
      { text: "Staying in and enjoying quiet activities alone", type: "I" }
    ]
  },
  {
    id: 2,
    text: "When making decisions, do you typically:",
    options: [
      { text: "Trust your feelings and consider others' feelings", type: "F" },
      { text: "Rely on logic and objective analysis", type: "T" }
    ]
  },
  {
    id: 3,
    text: "How do you prefer to plan your day?",
    options: [
      { text: "Have a structured schedule and clear plans", type: "J" },
      { text: "Keep things flexible and spontaneous", type: "P" }
    ]
  },
  {
    id: 4,
    text: "When learning new information, do you prefer:",
    options: [
      { text: "Focus on concrete facts and details", type: "S" },
      { text: "Look for patterns and possibilities", type: "N" }
    ]
  },
  {
    id: 5,
    text: "In group situations, you usually:",
    options: [
      { text: "Speak up and engage with others easily", type: "E" },
      { text: "Observe and listen more than speak", type: "I" }
    ]
  },
  {
    id: 6,
    text: "When solving problems, you prefer to:",
    options: [
      { text: "Consider how it affects people involved", type: "F" },
      { text: "Analyze the facts and find logical solutions", type: "T" }
    ]
  },
  {
    id: 7,
    text: "How do you handle deadlines?",
    options: [
      { text: "Complete tasks well ahead of time", type: "J" },
      { text: "Work under pressure close to deadline", type: "P" }
    ]
  },
  {
    id: 8,
    text: "When reading, do you prefer:",
    options: [
      { text: "Books that describe real events and experiences", type: "S" },
      { text: "Books that explore abstract ideas and theories", type: "N" }
    ]
  },
  {
    id: 9,
    text: "At parties, you tend to:",
    options: [
      { text: "Stay late and gain energy from socializing", type: "E" },
      { text: "Leave early, feeling drained from socializing", type: "I" }
    ]
  },
  {
    id: 10,
    text: "When giving feedback, you usually:",
    options: [
      { text: "Consider how to phrase it diplomatically", type: "F" },
      { text: "Focus on being direct and honest", type: "T" }
    ]
  },
  {
    id: 11,
    text: "How do you prefer your workspace?",
    options: [
      { text: "Organized and structured", type: "J" },
      { text: "Flexible and adaptable", type: "P" }
    ]
  },
  {
    id: 12,
    text: "When solving problems, do you prefer to:",
    options: [
      { text: "Use proven methods that work", type: "S" },
      { text: "Try new, innovative approaches", type: "N" }
    ]
  },
  {
    id: 13,
    text: "In conversations, you tend to:",
    options: [
      { text: "Share thoughts and experiences readily", type: "E" },
      { text: "Listen more and speak when necessary", type: "I" }
    ]
  },
  {
    id: 14,
    text: "When making decisions, you primarily consider:",
    options: [
      { text: "How it will affect people involved", type: "F" },
      { text: "What makes the most logical sense", type: "T" }
    ]
  },
  {
    id: 15,
    text: "When planning a trip, you prefer to:",
    options: [
      { text: "Have detailed itineraries planned", type: "J" },
      { text: "Go with the flow and be spontaneous", type: "P" }
    ]
  },
  {
    id: 16,
    text: "You are more interested in:",
    options: [
      { text: "What is actual and present", type: "S" },
      { text: "What is possible and potential", type: "N" }
    ]
  },
  {
    id: 17,
    text: "In group projects, you typically:",
    options: [
      { text: "Take the lead and coordinate others", type: "E" },
      { text: "Contribute individually and support the team", type: "I" }
    ]
  },
  {
    id: 18,
    text: "When conflicts arise, you tend to:",
    options: [
      { text: "Focus on maintaining harmony", type: "F" },
      { text: "Focus on finding the truth", type: "T" }
    ]
  },
  {
    id: 19,
    text: "You prefer environments that are:",
    options: [
      { text: "Structured and predictable", type: "J" },
      { text: "Flexible and changeable", type: "P" }
    ]
  },
  {
    id: 20,
    text: "When learning, you prefer to focus on:",
    options: [
      { text: "Details and specific facts", type: "S" },
      { text: "Big picture and possibilities", type: "N" }
    ]
  }
];

// MBTI Type Descriptions and Images
const personalityTypes = {
  'ISTJ': {
    title: 'The Logistician',
    description: 'ISTJ (Logistician) is a personality type with the Introverted, Observant, Thinking, and Judging traits. These people tend to be reserved yet willful, with a rational outlook on life. They compose their actions carefully and carry them out with methodical purpose.',
    imageUrl: 'https://i.ibb.co/3MdNhmJ/IMG-20250111-235613.jpg',
    traits: [
      'Organized and methodical',
      'Reliable and responsible',
      'Practical and fact-minded',
      'Value tradition and stability'
    ]
  },
  'ISFJ': {
    title: 'The Defender',
    description: 'ISFJ (Defender) is a personality type with the Introverted, Observant, Feeling, and Judging traits. These people tend to be warm and unassuming in their own steady way. They’re efficient and responsible, giving careful attention to practical details in their daily lives.',
    imageUrl: 'https://i.ibb.co/10S2JgG/IMG-20250112-000041.jpg',
    traits: [
      'Caring and nurturing',
      'Detail-oriented',
      'Traditional and loyal',
      'Patient and devoted'
    ]
  },
  'INFJ': {
    title: 'The Advocate',
    description: 'INFJ (Advocate) is a personality type with the Introverted, Intuitive, Feeling, and Judging traits. They tend to approach life with deep thoughtfulness and imagination. Their inner vision, personal values, and a quiet, principled version of humanism guide them in all things.',
    imageUrl: 'https://i.ibb.co/Wxn5L8y/IMG-20250112-000219.jpg',
    traits: [
      'Insightful and intuitive',
      'Idealistic and principled',
      'Complex and deep',
      'Creative and inspiring'
    ]
  },
  // Add all 16 types here...
  'ENTP': {
    title: 'The Debater',
    description: 'ENTP (Debater) is a personality type with the Extraverted, Intuitive, Thinking, and Prospecting traits. They tend to be bold and creative, deconstructing and rebuilding ideas with great mental agility. They pursue their goals vigorously despite any resistance they might encounter.',
    imageUrl: 'https://i.ibb.co/VNRNzhb/IMG-20250112-000402.jpg',
    traits: [
      'Innovative and creative',
      'Enthusiastic and energetic',
      'Analytical and logical',
      'Adaptable and resourceful'
    ]
  }
};

class PersonalityTest {
  constructor(bot, chatId, userId, userName) {
    this.bot = bot;
    this.chatId = chatId;
    this.userId = userId;
    this.userName = userName;
    this.currentQuestionIndex = 0;
    this.answers = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    };
    this.messageId = null;
  }

  async startTest() {
    await this.sendQuestion();
  }

  createKeyboard(question) {
    return {
      reply_markup: {
        inline_keyboard: question.options.map((option, index) => [{
          text: option.text,
          callback_data: `mbti_${this.currentQuestionIndex}_${option.type}`
        }])
      }
    };
  }

  async sendQuestion() {
    const question = questions[this.currentQuestionIndex];
    const messageText = `
Question ${this.currentQuestionIndex + 1}/20:
${question.text}

Progress: ${this.currentQuestionIndex + 1}/20 [${this.getProgressBar()}]
`;

    const keyboard = this.createKeyboard(question);

    if (this.messageId) {
      try {
        await this.bot.editMessageText(messageText, {
          chat_id: this.chatId,
          message_id: this.messageId,
          reply_markup: keyboard.reply_markup
        });
      } catch (error) {
        console.error('Error editing message:', error);
      }
    } else {
      const sentMessage = await this.bot.sendMessage(this.chatId, messageText, keyboard);
      this.messageId = sentMessage.message_id;
    }
  }

  getProgressBar() {
    const completed = this.currentQuestionIndex;
    const total = 20;
    const filledCount = Math.floor((completed / total) * 10);
    const emptyCount = 10 - filledCount;
    return '▰'.repeat(filledCount) + '▱'.repeat(emptyCount);
  }

  async handleAnswer(type) {
    this.answers[type]++;
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex < questions.length) {
      await this.sendQuestion();
      return true;
    } else {
      await this.calculateAndSendResults();
      return false;
    }
  }

  determineType() {
    const type = [
      this.answers.E > this.answers.I ? 'E' : 'I',
      this.answers.S > this.answers.N ? 'S' : 'N',
      this.answers.T > this.answers.F ? 'T' : 'F',
      this.answers.J > this.answers.P ? 'J' : 'P'
    ].join('');
    
    return type;
  }

  async calculateAndSendResults() {
    const type = this.determineType();
    const typeInfo = personalityTypes[type];

    const resultMessage = `
🎯 Personality Test Results for @${this.userName}

Your Type: ${type} - ${typeInfo.title}

📊 Type Breakdown:
• Extraversion (E) vs Introversion (I): ${this.answers.E}-${this.answers.I}
• Sensing (S) vs Intuition (N): ${this.answers.S}-${this.answers.N}
• Thinking (T) vs Feeling (F): ${this.answers.T}-${this.answers.F}
• Judging (J) vs Perceiving (P): ${this.answers.J}-${this.answers.P}

✨ Key Traits:
${typeInfo.traits.map(trait => `• ${trait}`).join('\n')}

📝 Description:
${typeInfo.description}

Want to learn more about your type? Visit: www.16personalities.com/${type.toLowerCase()}-personality
`;

    try {
      // Delete the question message
      await this.bot.deleteMessage(this.chatId, this.messageId);

      // Send results with image
      await this.bot.sendPhoto(this.chatId, typeInfo.imageUrl, {
        caption: resultMessage
      });
    } catch (error) {
      console.error('Error sending results:', error);
      // Fallback to text-only results
      await this.bot.sendMessage(this.chatId, resultMessage);
    }
  }
}

module.exports = {
  name: 'personality',
  description: 'Take a Myers-Briggs Type Indicator (MBTI) personality test',
  
  activeSessions: new Map(),

  async execute(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;

    // Check for existing session
    const existingSession = Array.from(module.exports.activeSessions.values())
      .find(session => session.chatId === chatId);

    if (existingSession) {
      return bot.sendMessage(chatId, 
        `❌ A personality test is already in progress for @${existingSession.userName}. Please wait for it to finish.`
      );
    }

    // Create welcome message
    const welcomeMessage = `
Welcome to the MBTI Personality Test, @${userName}!

This test will help determine your personality type based on the Myers-Briggs Type Indicator system.

• The test consists of 20 questions
• Each question has two options
• Choose the option that best describes you
• Be honest - there are no right or wrong answers
• The test takes about 5-10 minutes to complete

Ready to discover your personality type? The test will begin automatically in 3 seconds...
`;

    await bot.sendMessage(chatId, welcomeMessage);

    // Start test after delay
    setTimeout(async () => {
      const test = new PersonalityTest(bot, chatId, userId, userName);
      module.exports.activeSessions.set(`${chatId}_${userId}`, test);
      await test.startTest();
    }, 3000);
  },

  // Handle button callbacks
  async handleCallback(bot, query) {
    const [prefix, questionIndex, answerType] = query.data.split('_');
    
    if (prefix !== 'mbti') return;

    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const session = module.exports.activeSessions.get(`${chatId}_${userId}`);

    if (!session) {
      await bot.answerCallbackQuery(query.id, {
        text: "This test session has expired. Please start a new test.",
        show_alert: true
      });
      return;
    }

    if (session.userId !== userId) {
      await bot.answerCallbackQuery(query.id, {
        text: "This is not your test! Please start your own test.",
        show_alert: true
      });
      return;
    }

    await bot.answerCallbackQuery(query.id);
    
    const shouldContinue = await session.handleAnswer(answerType);
    
    if (!shouldContinue) {
      module.exports.activeSessions.delete(`${chatId}_${userId}`);
    }
  }
};
