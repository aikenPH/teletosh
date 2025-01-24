const words = [
  "apple", "beach", "chair", "dance", "eagle", "flame", "grape", "house", "ivory", "jelly",
  "knife", "lemon", "mango", "novel", "ocean", "pizza", "queen", "river", "sugar", "tiger",
  "uncle", "voice", "water", "xray", "yacht", "zebra", "brick", "cloud", "drain", "earth",
  "forest", "glass", "horse", "index", "joker", "koala", "light", "mouse", "noise", "orbit",
  "paper", "quick", "smile", "table", "unity", "vivid", "whale", "yield", "arrow", "brave",
  "coral", "diary", "elite", "frost", "gamer", "heart", "layer", "magic", "noble", "omega",
  "pearl", "quest", "steam", "train", "urban", "valve", "width", "alpha", "blaze", "delta",
  "focus", "glide", "hunch", "icing", "karma", "lunar", "maple", "nerve", "pulse", "ridge"
].map(word => word.toLowerCase());

const activeGames = new Map();

module.exports = {
  name: "wordle",
  description: "Play Wordle game",
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if game already exists
    if (activeGames.has(chatId)) {
      await bot.sendMessage(chatId, "❌ A game is already in progress. End the current game first.");
      return;
    }

    // Handle game start command
    if (args[0] && args[0].toLowerCase() === 'start') {
      const gameState = {
        word: words[Math.floor(Math.random() * words.length)],
        attempts: 0,
        maxAttempts: 6,
        guessedWords: new Set(),
        gameOver: false
      };

      activeGames.set(chatId, gameState);

      await bot.sendMessage(chatId, `🎮 Wordle Challenge! Guess the 5-letter word in ${gameState.maxAttempts} attempts. Good luck! 🚀`);

      const gameHandler = async (msg) => {
        if (msg.chat.id !== chatId) return;

        const gameState = activeGames.get(chatId);
        if (!gameState || gameState.gameOver) return;

        const guess = msg.text.toLowerCase().trim();

        if (guess.toLowerCase() === 'end') {
          await endGame(bot, chatId);
          return;
        }

        if (guess.length !== 5) {
          await bot.sendMessage(chatId, `❌ Your guess must be exactly 5 letters. You entered ${guess.length} letters.`);
          return;
        }

        if (!/^[a-z]+$/.test(guess)) {
          await bot.sendMessage(chatId, "❌ Use only letters (A-Z) in your guess.");
          return;
        }

        gameState.attempts++;

        try {
          const result = evaluateGuess(guess, gameState.word);
          
          const resultMessage = `Attempt ${gameState.attempts}/${gameState.maxAttempts}: ${guess.toUpperCase()}\n${result.emoji}`;
          await bot.sendMessage(chatId, resultMessage);

          if (result.isCorrect) {
            await bot.sendMessage(chatId, `🎉 Congratulations! You guessed the word in ${gameState.attempts} attempts! The word was ${gameState.word.toUpperCase()}.`);
            await endGame(bot, chatId);
            return;
          }

          if (gameState.attempts >= gameState.maxAttempts) {
            await bot.sendMessage(chatId, `😔 Game over! The word was ${gameState.word.toUpperCase()}. Better luck next time!`);
            await endGame(bot, chatId);
          }
        } catch (error) {
          console.error("Game processing error:", error);
          await bot.sendMessage(chatId, "🤖 Game error occurred.");
          await endGame(bot, chatId);
        }
      };

      bot.on('text', gameHandler);
    } else {
      await bot.sendMessage(chatId, "🎮 How to play Wordle:\n" +
        "1. Type '/wordle start' to begin\n" +
        "2. Guess a 5-letter word\n" +
        "3. 🟩 Green: Correct letter, correct position\n" +
        "4. 🟨 Yellow: Correct letter, wrong position\n" +
        "5. ⬜ White: Letter not in the word\n" +
        "6. Type 'end' to stop the game\n" +
        "You have 6 attempts to guess the word!");
    }
  }
};

async function endGame(bot, chatId) {
  const gameState = activeGames.get(chatId);
  if (gameState) {
    gameState.gameOver = true;
    activeGames.delete(chatId);
  }
  bot.removeAllListeners('text');
}

function evaluateGuess(guess, word) {
  const result = new Array(5).fill('⬜');
  const wordLetters = word.split('');
  const guessLetters = guess.split('');

  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === word[i]) {
      result[i] = '🟩';
      wordLetters[i] = null;
    }
  }

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
