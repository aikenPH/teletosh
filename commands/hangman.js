module.exports = {
  name: "hangman",
  description: "Play Hangman",
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id
    const words = ["javascript", "python", "telegram", "bot", "programming", "computer", "algorithm", "database"]
    const word = words[Math.floor(Math.random() * words.length)]
    const guessedLetters = new Set()
    let remainingAttempts = 6

    function getWordDisplay() {
      return word
        .split("")
        .map((letter) => (guessedLetters.has(letter) ? letter : "_"))
        .join(" ")
    }

    function getHangmanDisplay() {
      const hangmanStages = [
        "  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========",
        "  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========",
        "  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========",
        "  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========",
        "  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========",
        "  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========",
        "  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========",
      ]
      return hangmanStages[6 - remainingAttempts]
    }

    async function updateGameMessage() {
      await bot.editMessageText(
        `Hangman\n\n${getHangmanDisplay()}\n\n${getWordDisplay()}\n\nGuessed letters: ${Array.from(guessedLetters).join(", ")}\nRemaining attempts: ${remainingAttempts}`,
        {
          chat_id: chatId,
          message_id: gameMessage.message_id,
          reply_markup: {
            inline_keyboard: [
              Array.from("abcdefghijklm").map((letter) => ({
                text: guessedLetters.has(letter) ? "✓" : letter,
                callback_data: letter,
              })),
              Array.from("nopqrstuvwxyz").map((letter) => ({
                text: guessedLetters.has(letter) ? "✓" : letter,
                callback_data: letter,
              })),
            ],
          },
        },
      )
    }

    const gameMessage = await bot.sendMessage(chatId, "Starting Hangman game...")
    await updateGameMessage()

    bot.on("callback_query", async (query) => {
      if (query.message.message_id !== gameMessage.message_id) return

      const letter = query.data

      if (!guessedLetters.has(letter)) {
        guessedLetters.add(letter)

        if (!word.includes(letter)) {
          remainingAttempts--
        }

        await updateGameMessage()

        if (remainingAttempts === 0) {
          await bot.sendMessage(chatId, `Game over! The word was: ${word}`)
          bot.removeListener("callback_query", this)
        } else if (!getWordDisplay().includes("_")) {
          await bot.sendMessage(chatId, "Congratulations! You guessed the word!")
          bot.removeListener("callback_query", this)
        }
      }

      await bot.answerCallbackQuery(query.id)
    })
  },
}

