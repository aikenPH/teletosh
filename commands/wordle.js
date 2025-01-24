module.exports = {
  name: "wordle",
  description: "Play a Wordle-like game",
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id
    const words = ["apple", "beach", "chair", "dance", "eagle", "flame", "grape", "house", "ivory", "jelly"]
    const word = words[Math.floor(Math.random() * words.length)]
    let attempts = 0
    const maxAttempts = 6

    await bot.sendMessage(chatId, `Let's play Wordle! Guess the 5-letter word. You have ${maxAttempts} attempts.`)

    const listener = bot.onText(/^[a-zA-Z]{5}$/, async (msg) => {
      if (msg.chat.id !== chatId) return

      attempts++
      const guess = msg.text.toLowerCase()
      let result = ""

      for (let i = 0; i < 5; i++) {
        if (guess[i] === word[i]) {
          result += "🟩" // Correct letter, correct position
        } else if (word.includes(guess[i])) {
          result += "🟨" // Correct letter, wrong position
        } else {
          result += "⬜" // Wrong letter
        }
      }

      await bot.sendMessage(chatId, `Attempt ${attempts}/${maxAttempts}: ${guess}\n${result}`)

      if (guess === word) {
        bot.removeListener("text", listener)
        await bot.sendMessage(chatId, `Congratulations! You guessed the word in ${attempts} attempts!`)
      } else if (attempts >= maxAttempts) {
        bot.removeListener("text", listener)
        await bot.sendMessage(chatId, `Game over! The word was ${word}.`)
      }
    })
  },
}

