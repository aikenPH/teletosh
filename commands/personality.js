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

  async start() {
    try {
      await this.sendNextQuestion();
    } catch (error) {
      console.error('Error starting test:', error);
    }
  }

  async sendNextQuestion() {
    if (this.currentQuestionIndex >= questions.length) {
      await this.sendResults();
      return;
    }

    const question = questions[this.currentQuestionIndex];
    
    const questionText = `
📝 Question ${this.currentQuestionIndex + 1}/20
Personality Test for: @${this.userName}

${question.text}

Options:
A. ${question.options[0].text}
B. ${question.options[1].text}
C. ${question.options[2].text}
D. ${question.options[3].text}

⚠️ Simply reply to this message with A, B, C, or D`;

    try {
      const sentMessage = await this.bot.sendMessage(this.chatId, questionText, {
        reply_markup: {
          force_reply: true,
          selective: true
        }
      });
      this.messageId = sentMessage.message_id;
    } catch (error) {
      console.error('Error sending question:', error);
    }
  }

  processAnswer(answer) {
    try {
      const answerIndex = answer.toUpperCase().charCodeAt(0) - 65;
      
      if (answerIndex < 0 || answerIndex >= 4) {
        return false;
      }

      const question = questions[this.currentQuestionIndex];
      const selectedOption = question.options[answerIndex];
      
      // Increment the corresponding personality trait
      this.answers[selectedOption.type]++;
      
      // Move to next question
      this.currentQuestionIndex++;

      return this.currentQuestionIndex < questions.length;
    } catch (error) {
      console.error('Error processing answer:', error);
      return false;
    }
  }

  determinePersonalityType() {
    return [
      this.answers.E > this.answers.I ? 'E' : 'I',
      this.answers.S > this.answers.N ? 'S' : 'N',
      this.answers.T > this.answers.F ? 'T' : 'F',
      this.answers.J > this.answers.P ? 'J' : 'P'
    ].join('');
  }

  async sendResults() {
    try {
      const type = this.determinePersonalityType();
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

Want to learn more? Visit: www.16personalities.com/${type.toLowerCase()}-personality`;

      try {
        await this.bot.sendPhoto(this.chatId, typeInfo.imageUrl, {
          caption: resultMessage
        });
      } catch (imageError) {
        console.error('Error sending image:', imageError);
        await this.bot.sendMessage(this.chatId, resultMessage);
      }
    } catch (error) {
      console.error('Error sending results:', error);
    }
  }
}

// Explicitly create a map outside of the module.exports
const activeSessions = new Map();

module.exports = {
  name: 'personality',
  description: 'MBTI Personality Test',

  async execute(bot, msg) {
    try {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const userName = msg.from.username || msg.from.first_name;

      // Check for existing session
      const existingSession = activeSessions.get(chatId);
      if (existingSession) {
        await bot.sendMessage(chatId, 'A personality test is already in progress. Please wait or cancel the current test.');
        return;
      }

      // Create and start the test
      const test = new PersonalityTest(bot, chatId, userId, userName);
      activeSessions.set(chatId, test);
      
      await bot.sendMessage(chatId, `Welcome, @${userName}! The personality test will begin shortly...`);
      await test.start();
    } catch (error) {
      console.error('Error in personality test execution:', error);
    }
  },

  async handleReply(bot, msg) {
    try {
      const chatId = msg.chat.id;
      const test = activeSessions.get(chatId);

      if (!test) return;

      // Validate the answer
      const validAnswers = ['A', 'B', 'C', 'D'];
      const answer = msg.text.toUpperCase().trim();

      if (!validAnswers.includes(answer)) {
        await bot.sendMessage(chatId, 'Please reply with A, B, C, or D');
        return;
      }

      // Process the answer
      const continueTest = test.processAnswer(answer);

      if (continueTest) {
        await test.sendNextQuestion();
      } else {
        await test.sendResults();
        activeSessions.delete(chatId);
      }
    } catch (error) {
      console.error('Error handling reply:', error);
    }
  }
};
