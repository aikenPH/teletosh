const words = [
  "apple", "beach", "chair", "dance", "eagle", "flame", "grape", "house", "ivory", "jelly",
  "knife", "lemon", "mango", "novel", "ocean", "pizza", "queen", "river", "sugar", "tiger",
  "uncle", "voice", "water", "xray", "yacht", "zebra", "brick", "cloud", "drain", "earth",
  "forest", "glass", "horse", "index", "joker", "koala", "light", "mouse", "noise", "orbit",
  "paper", "quick", "smile", "table", "unity", "vivid", "whale", "yield", "arrow", "brave",
  "coral", "diary", "elite", "frost", "gamer", "heart", "layer", "magic", "noble", "omega",
  "pearl", "quest", "steam", "train", "urban", "valve", "width", "alpha", "blaze", "delta",
  "focus", "glide", "hunch", "icing", "karma", "lunar", "maple", "nerve", "pulse", "ridge",
  "surge", "trend", "ultra", "wave", "zappy", "agile", "brisk", "cargo", "enter", "grasp",
  "hoist", "imply", "jumbo", "knack", "lever", "midst", "notch", "olive", "prime", "relay"
].map(word => word.toLowerCase()); // Ensure all words are lowercase

module.exports = {
  name: "wordle",
  description: "Play Wordle-like game",
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const gameState = {
      word: words[Math.floor(Math.random() * words.length)],
      attempts: 0,
      maxAttempts: 6,
      guessedWords: new Set(),
      gameOver: false
    };

    await bot.sendMessage(chatId, `🎮 Wordle Challenge! Guess the 5-letter word in ${gameState.maxAttempts} attempts. Good luck! 🚀`);

    const gameHandler = async (msg) => {
      // Ignore messages from other chats or users
      if (msg.chat.id !== chatId || msg.from.id !== userId) return;

      const guess = msg.text.toLowerCase().trim();

      // Comprehensive input validation
      if (guess.length !== 5) {
        await bot.sendMessage(chatId, `❌ Your guess must be exactly 5 letters. You entered ${guess.length} letters.`);
        return;
      }

      if (!/^[a-z]+$/.test(guess)) {
        await bot.sendMessage(chatId, "❌ Use only letters (A-Z) in your guess.");
        return;
      }

      // Prevent duplicate guesses
      if (gameState.guessedWords.has(guess)) {
        await bot.sendMessage(chatId, "❌ You've already guessed this word!");
        return;
      }

      gameState.attempts++;
      gameState.guessedWords.add(guess);

      try {
        const result = evaluateGuess(guess, gameState.word);
        
        const resultMessage = `Attempt ${gameState.attempts}/${gameState.maxAttempts}: ${guess.toUpperCase()}\n${result.emoji}`;
        await bot.sendMessage(chatId, resultMessage);

        if (result.isCorrect) {
          await bot.sendMessage(chatId, `🎉 Congratulations! You guessed the word in ${gameState.attempts} attempts! The word was ${gameState.word.toUpperCase()}.`);
          endGame();
          return;
        }

        if (gameState.attempts >= gameState.maxAttempts) {
          await bot.sendMessage(chatId, `😔 Game over! The word was ${gameState.word.toUpperCase()}. Better luck next time!`);
          endGame();
        }
      } catch (error) {
        console.error("Game processing error:", error);
        await bot.sendMessage(chatId, "🤖 Game error occurred.");
        endGame();
      }
    };

    const listenerId = bot.onText(/^[a-z]{5}$/i, gameHandler);

    function endGame() {
      bot.removeListener('text', listenerId);
      gameState.gameOver = true;
    }

    // 10-minute timeout
    const gameTimeout = setTimeout(async () => {
      if (!gameState.gameOver) {
        await bot.sendMessage(chatId, `⏰ Game timed out! The word was ${gameState.word.toUpperCase()}.`);
        endGame();
      }
    }, 10 * 60 * 1000);
  }
};

function evaluateGuess(guess, word) {
  const result = new Array(5).fill('⬜');
  const wordLetters = word.split('');
  const guessLetters = guess.split('');

  // First pass: mark correct positions
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === word[i]) {
      result[i] = '🟩';
      wordLetters[i] = null;
    }
  }

  // Second pass: mark correct letters in wrong positions
  for (let i = 0; i < 5; i++) {
    if (result[i] === '⬜') {
      const letterIndex = wordLetters.indexOf(guessLetters[i]);
      if (letterIndex !== -1) {
        result[i] = '🟨';
        wordLetters[letterIndex] = null;
      }
    }
  }

  const emoji = result.join('');
  const isCorrect = emoji === '🟩🟩🟩🟩🟩';

  return { emoji, isCorrect };
}
