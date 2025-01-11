const axios = require('axios');

class QuizGame {
  constructor(bot, chatId, userId, userName) {
    this.bot = bot;
    this.chatId = chatId;
    this.userId = userId;
    this.userName = userName;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.totalQuestions = 20;
    this.questions = [];
    this.currentQuestion = null;
    this.messageId = null;
    this.replyListener = null;
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

⚠️ Only @${this.userName} can answer this question!
    `;

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
    // Check if the answer is from the correct user
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
    return true;
  }

  async endQuiz() {
    let medalUrl = '';
    let medalDescription = '';

    // Determine medal based on score
    if (this.score === this.totalQuestions) {
      medalUrl = 'https://i.ibb.co/6Wp139Q/gold-medal.png';
      medalDescription = 'Perfect Score! 🏆 Gold Medal';
    } else if (this.score >= Math.floor(this.totalQuestions * 0.7)) {
      medalUrl = 'https://i.ibb.co/K5B0m5z/star.png';
      medalDescription = 'Great Job! 🥈 Silver Medal';
    } else if (this.score >= Math.floor(this.totalQuestions * 0.5)) {
      medalUrl = 'https://i.ibb.co/D89nFpH/bronze-medal.png';
      medalDescription = '👍 Bronze Medal';
    } else {
      medalUrl = 'https://i.ibb.co/JFyJm3Q/coin.png';
      medalDescription = '🎖️ Participation Award';
    }

    const resultMessage = `
🏅 Quiz Completed for @${this.userName}!

Total Questions: ${this.totalQuestions}
Your Score: ${this.score}/${this.totalQuestions}
Accuracy: ${((this.score / this.totalQuestions) * 100).toFixed(2)}%

${medalDescription}
    `;

    try {
      // Attempt to send photo with caption
      await this.bot.sendPhoto(this.chatId, medalUrl, {
        caption: resultMessage,
        parse_mode: 'Markdown'
      });
    } catch (error) {
      console.error('Failed to send result photo:', error);
      
      // Fallback to sending message if photo fails
      try {
        await this.bot.sendMessage(this.chatId, `${resultMessage}\n\n🖼️ Medal Image: ${medalUrl}`);
      } catch (fallbackError) {
        console.error('Failed to send result message:', fallbackError);
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
  description: 'Start a 20-question quiz game',
  
  quizSessions: new Map(),

  async execute(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;

    // Check if a quiz is already running for this chat
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

    // Store the quiz session
    module.exports.quizSessions.set(`${chatId}_${userId}`, quizGame);
    
    // Start the first question
    await quizGame.sendQuestion();

    // Set up reply listener
    quizGame.replyListener = bot.on('message', async (replyMsg) => {
      // Check if this is a reply to our quiz message
      if (replyMsg.reply_to_message && 
          replyMsg.reply_to_message.message_id === quizGame.messageId) {
        
        const activeQuiz = module.exports.quizSessions.get(`${chatId}_${userId}`);
        
        if (activeQuiz) {
          const answerResult = await activeQuiz.handleAnswer(replyMsg);
          
          // Continue with next question or end quiz
          if (answerResult && activeQuiz.currentQuestionIndex < activeQuiz.totalQuestions) {
            const nextQuestionResult = await activeQuiz.sendQuestion();
            
            if (!nextQuestionResult) {
                            // Quiz is finished
              module.exports.quizSessions.delete(`${chatId}_${userId}`);
              
              // Remove the reply listener
              if (activeQuiz.replyListener) {
                activeQuiz.replyListener.off('message');
              }
            }
          } else {
            // Quiz is finished
            module.exports.quizSessions.delete(`${chatId}_${userId}`);
            
            // Remove the reply listener
            if (activeQuiz.replyListener) {
              activeQuiz.replyListener.off('message');
            }
          }
        }
      }
    });
  }
};
