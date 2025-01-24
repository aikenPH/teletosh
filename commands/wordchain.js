module.exports = {
  name: "wordchain",
  description: "Start a word chain game",
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id
    let lastWord = args[0] || "start"
    const players = []
    let currentPlayerIndex = 0

    const gameMessage = await bot.sendMessage(
      chatId,
      `Word Chain Game started! The first word is "${lastWord}". Reply with a word that starts with the last letter of the previous word.`,
    )

    const listener = bot.onText(/^[a-zA-Z]+$/, async (msg) => {
      if (msg.chat.id !== chatId) return

      const word = msg.text.toLowerCase()
      if (word[0] !== lastWord[lastWord.length - 1]) {
        await bot.sendMessage(chatId, `Invalid word! It must start with the letter "${lastWord[lastWord.length - 1]}".`)
        return
      }

      lastWord = word
      if (!players.includes(msg.from.id)) {
        players.push(msg.from.id)
      }
      currentPlayerIndex = (players.indexOf(msg.from.id) + 1) % players.length

      await bot.editMessageText(`Word Chain: ${lastWord}\nNext player: ${players[currentPlayerIndex]}`, {
        chat_id: chatId,
        message_id: gameMessage.message_id,
      })
    })

    // End the game after 5 minutes
    setTimeout(
      () => {
        bot.removeListener("text", listener)
        bot.sendMessage(chatId, "Word Chain Game ended! Thanks for playing!")
      },
      5 * 60 * 1000,
    )
  },
}

