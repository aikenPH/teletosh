const axios = require("axios")

module.exports = {
  name: "trivia",
  description: "Play a trivia game",
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id

    try {
      const response = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple")
      const question = response.data.results[0]

      const answers = [...question.incorrect_answers, question.correct_answer]
      const shuffledAnswers = answers.sort(() => Math.random() - 0.5)

      const keyboard = shuffledAnswers.map((answer) => [
        {
          text: answer,
          callback_data: answer === question.correct_answer ? "correct" : "incorrect",
        },
      ])

      const gameMessage = await bot.sendMessage(
        chatId,
        `Category: ${question.category}\nDifficulty: ${question.difficulty}\n\nQuestion: ${question.question}`,
        {
          reply_markup: {
            inline_keyboard: keyboard,
          },
        },
      )

      bot.on("callback_query", async (query) => {
        if (query.message.message_id !== gameMessage.message_id) return

        const isCorrect = query.data === "correct"
        const resultMessage = isCorrect ? "Correct! 🎉" : `Wrong! The correct answer was: ${question.correct_answer}`

        await bot.editMessageText(`${question.question}\n\n${resultMessage}`, {
          chat_id: chatId,
          message_id: gameMessage.message_id,
          reply_markup: { inline_keyboard: [] },
        })

        await bot.answerCallbackQuery(query.id, { text: resultMessage })
        bot.removeListener("callback_query", this)
      })
    } catch (error) {
      console.error("Error fetching trivia question:", error)
      await bot.sendMessage(chatId, "Sorry, there was an error fetching the trivia question. Please try again later.")
    }
  },
}

