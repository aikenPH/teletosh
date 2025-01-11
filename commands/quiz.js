const axios = require('axios');

class QuizGame {
  constructor(bot, chatId, userId, userName) {
    this.bot = bot;
    this.chatId = chatId;
    this.userId = userId;
    this.userName = userName;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.totalQuestions = 5;
    this.questions = [];
    this.currentQuestion = null;
    this.messageId = null;
  }

  async initializeQuiz() {
    try {
      const response = await axios.get('https://opentdb.com/api.php', {
        params: {
          amount: this.totalQuestions,
          type: 'multiple',
          difficulty: 'medium'
        }
      });

      this.questions = response.data.results;
      return this.questions.length > 0;
    } catch (error) {
      console.error('Quiz Initialization Error:', error);
      return false;
    }
  }

  async sendQuestion() {
    if (this.currentQuestionIndex >= this.totalQuestions) {
      await this.endQuiz();
      return false;
    }

    this.currentQuestion = this.questions[this.currentQuestionIndex];
    const allAnswers = [
      ...this.currentQuestion.incorrect_answers, 
      this.currentQuestion.correct_answer
    ].sort(() => Math.random() - 0.5);

    const questionText = `
📝 Question ${this.currentQuestionIndex + 1}/${this.totalQuestions}
Quiz for: @${this.userName}

${this.decodeHtml(this.currentQuestion.question)}

Answers:
${allAnswers.map((answer, index) => `${String.fromCharCode(65 + index)}. ${this.decodeHtml(answer)}`).join('\n')}

⚠️ Only @${this.userName} can answer this question!`;

    const sentMessage = await this.bot.sendMessage(this.chatId, questionText, {
      reply_markup: {
        force_reply: true,
        selective: true
      }
    });

    this.messageId = sentMessage.message_id;
    this.correctAnswer = this.decodeHtml(this.currentQuestion.correct_answer);
    this.allAnswers = allAnswers;

    return true;
  }

  async handleAnswer(msg) {
    if (msg.from.id !== this.userId) {
      await this.bot.sendMessage(this.chatId, `❌ This quiz is for @${this.userName} only. Start your own quiz!`);
      return false;
    }

    const userAnswer = msg.text.toUpperCase().trim();
    const correctIndex = this.allAnswers.findIndex(ans => this.decodeHtml(ans) === this.correctAnswer);
    const correctLetter = String.fromCharCode(65 + correctIndex);

    if (userAnswer === correctLetter) {
      this.score++;
      await this.bot.sendMessage(this.chatId, '✅ Correct Answer!');
    } else {
      await this.bot.sendMessage(this.chatId, `❌ Wrong Answer. Correct was ${correctLetter}. The correct answer is: ${this.correctAnswer}`);
    }

    this.currentQuestionIndex++;
    
    if (this.currentQuestionIndex >= this.totalQuestions) {
      await this.endQuiz();
      return false;
    }
    
    return true;
  }

  async endQuiz() {
    const percentage = (this.score / this.totalQuestions) * 100;
    
    let resultData = {
      imageUrl: '',
      title: '',
      description: ''
    };

    if (percentage === 100) {
      resultData = {
        imageUrl: 'https://i.ibb.co/6Wp139Q/gold-medal.png',
        title: '🏆 PERFECT SCORE! GOLD MEDAL',
        description: 'Congratulations! You achieved a perfect score!'
      };
    } else if (percentage >= 70) {
      resultData = {
        imageUrl: 'https://i.ibb.co/K5B0m5z/star.png',
        title: '🥈 EXCELLENT! SILVER MEDAL',
        description: 'Great job! You showed impressive knowledge!'
      };
    } else if (percentage >= 50) {
      resultData = {
        imageUrl: 'https://i.ibb.co/D89nFpH/bronze-medal.png',
        title: '🥉 GOOD EFFORT! BRONZE MEDAL',
        description: 'Nice work! Keep practicing to improve!'
      };
    } else {
      resultData = {
        imageUrl: 'https://i.ibb.co/JFyJm3Q/coin.png',
        title: '🎖️ PARTICIPATION AWARD',
        description: 'Thanks for participating! Try again!'
      };
    }

    const resultMessage = `
🎯 Quiz Results for @${this.userName}

${resultData.title}

${resultData.description}

📊 Score Breakdown:
• Correct Answers: ${this.score}/${this.totalQuestions}
• Accuracy: ${percentage.toFixed(1)}%

🌟 Keep challenging yourself!`;

    try {
      await this.bot.sendPhoto(this.chatId, resultData.imageUrl, {
        caption: resultMessage
      });
    } catch (error) {
      console.error('Failed to send result with image:', error);
      try {
        await this.bot.sendMessage(this.chatId, resultMessage);
      } catch (fallbackError) {
        console.error('Failed to send result message:', fallbackError);
        await this.bot.sendMessage(
          this.chatId, 
          `Quiz completed! Final score: ${this.score}/${this.totalQuestions} (${percentage.toFixed(1)}%)`
        );
      }
    }
  }

  decodeHtml(html) {
    return html
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }
}

module.exports = {
  name: 'quiz',
  description: 'Start a 5-question quiz game',
  
  quizSessions: new Map(),

  async execute(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;

    const existingQuiz = Array.from(module.exports.quizSessions.values())
      .find(quiz => quiz.chatId === chatId);

    if (existingQuiz) {
      return bot.sendMessage(chatId, `❌ A quiz is already in progress for @${existingQuiz.userName}. Wait for it to finish.`);
    }

    const quizGame = new QuizGame(bot, chatId, userId, userName);
    const initialized = await quizGame.initializeQuiz();

    if (!initialized) {
      return bot.sendMessage(chatId, '❌ Failed to load quiz. Please try again.');
    }

    module.exports.quizSessions.set(`${chatId}_${userId}`, quizGame);
    
    const messageHandler = async (replyMsg) => {
      if (replyMsg.reply_to_message && 
          replyMsg.reply_to_message.message_id === quizGame.messageId) {
        
        const activeQuiz = module.exports.quizSessions.get(`${chatId}_${userId}`);
        
        if (activeQuiz) {
          const answerResult = await activeQuiz.handleAnswer(replyMsg);
          
          if (answerResult) {
            await activeQuiz.sendQuestion();
          } else {
            module.exports.quizSessions.delete(`${chatId}_${userId}`);
            bot.removeListener('message', messageHandler);
          }
        }
      }
    };

    bot.on('message', messageHandler);
    
    await quizGame.sendQuestion();
  }
};
