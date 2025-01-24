module.exports = {
  name: "codebreaker",
  description: "Start a codebreaker game",
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id
    const codeLength = 4
    const code = Array.from({ length: codeLength }, () => Math.floor(Math.random() * 6) + 1)
    let attempts = 0
    const maxAttempts = 10

    await bot.sendMessage(
      chatId,
      `Codebreaker game started! Guess the ${codeLength}-digit code (1-6). You have ${maxAttempts} attempts.`,
    )

    const listener = bot.onText(/^[1-6]{4}$/, async (msg) => {
      if (msg.chat.id !== chatId) return

      attempts++
      const guess = msg.text.split("").map(Number)
      let correct = 0
      let misplaced = 0

      for (let i = 0; i < codeLength; i++) {
        if (guess[i] === code[i]) {
          correct++
        } else if (code.includes(guess[i])) {
          misplaced++
        }
      }

      if (correct === codeLength) {
        bot.removeListener("text", listener)
        await bot.sendMessage(chatId, `Congratulations! You broke the code in ${attempts} attempts!`)
      } else if (attempts >= maxAttempts) {
        bot.removeListener("text", listener)
        await bot.sendMessage(chatId, `Game over! The code was ${code.join("")}.`)
      } else {
        await bot.sendMessage(chatId, `Attempt ${attempts}/${maxAttempts}: ${correct} correct, ${misplaced} misplaced.`)
      }
    })
  },
}

