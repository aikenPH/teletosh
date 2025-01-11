const axios = require('axios');

class QuizGame {
  constructor(bot, chatId) {
    this.bot = bot;
    this.chatId = chatId;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.totalQuestions = 20;
    this.questions = [];
    this.currentQuestion = null;
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
      return;
    }

    this.currentQuestion = this.questions[this.currentQuestionIndex];
    const allAnswers = [
      ...this.currentQuestion.incorrect_answers, 
      this.currentQuestion.correct_answer
    ].sort(() => Math.random() - 0.5);

    const questionText = `
📝 Question ${this.currentQuestionIndex + 1}/${this.totalQuestions}

${this.decodeHtml(this.currentQuestion.question)}

Answers:
${allAnswers.map((answer, index) => `${String.fromCharCode(65 + index)}. ${this.decodeHtml(answer)}`).join('\n')}
    `;

    await this.bot.sendMessage(this.chatId, questionText);
  }

  async handleAnswer(msg) {
    const userAnswer = msg.text.toUpperCase().trim();
    const correctAnswer = this.decodeHtml(this.currentQuestion.correct_answer);
    const allAnswers = [
      ...this.currentQuestion.incorrect_answers, 
      this.currentQuestion.correct_answer
    ].sort(() => Math.random() - 0.5);

    const correctIndex = allAnswers.findIndex(ans => this.decodeHtml(ans) === correctAnswer);
    const correctLetter = String.fromCharCode(65 + correctIndex);

    if (userAnswer === correctLetter) {
      this.score++;
      await this.bot.sendMessage(this.chatId, '✅ Correct Answer!');
    } else {
      await this.bot.sendMessage(this.chatId, `❌ Wrong Answer. Correct was ${correctLetter}. ${this.decodeHtml(correctAnswer)}`);
    }

    this.currentQuestionIndex++;
    await this.sendQuestion();
  }

  async endQuiz() {
    let medalUrl = '';
    let medalDescription = '';

    if (this.score === this.totalQuestions) {
      medalUrl = 'https://i.ibb.co/6Wp139Q/gold-medal.png';
      medalDescription = 'Perfect Score! 🏆 Gold Medal';
    } else if (this.score >= Math.floor(this.totalQuestions * 0.7)) {
      medalUrl = 'https://i.ibb.co/K5B0m5z/star.png';
      medalDescription = 'Great Job! 🥈 Silver Medal';
    } else {
      medalUrl = 'https://i.ibb.co/D89nFpH/bronze-medal.png';
      medalDescription = '👍 Participation Medal';
    }

    const resultMessage = `
🏅 Quiz Completed!

Total Questions: ${this.totalQuestions}
Your Score: ${this.score}/${this.totalQuestions}
Accuracy: ${((this.score / this.totalQuestions) * 100).toFixed(2)}%

${medalDescription}
    `;

    try {
      await this.bot.sendPhoto(this.chatId, medalUrl, {
        caption: resultMessage
      });
    } catch (error) {
      await this.bot.sendMessage(this.chatId, resultMessage);
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
  description: 'Start a 20-question quiz game',
  
  quizSessions: new Map(),

  async execute(bot, msg) {
    const chatId = msg.chat.id;

    // Use the method directly on the module, not 'this'
    if (module.exports.quizSessions.has(chatId)) {
      return bot.sendMessage(chatId, '❌ A quiz is already in progress. Complete the current quiz first.');
    }

    const quizGame = new QuizGame(bot, chatId);
    const initialized = await quizGame.initializeQuiz();

    if (!initialized) {
      return bot.sendMessage(chatId, '❌ Failed to load quiz. Please try again.');
    }

    // Use module.exports to set the quiz session
    module.exports.quizSessions.set(chatId, quizGame);
    await quizGame.sendQuestion();

    bot.onReplyToMessage(chatId, msg.message_id, async (replyMsg) => {
      // Use module.exports to get the active quiz
      const activeQuiz = module.exports.quizSessions.get(chatId);
      if (activeQuiz) {
        await activeQuiz.handleAnswer(replyMsg);

        // Remove quiz session when completed
        if (activeQuiz.currentQuestionIndex >= activeQuiz.totalQuestions) {
          module.exports.quizSessions.delete(chatId);
        }
      }
    });
  }
};
