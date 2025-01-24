const words = [
  "apple", "beach", "chair", "dance", "eagle", "flame", "grape", "house", "ivory", "jelly",
  "knife", "lemon", "mango", "novel", "ocean", "pizza", "queen", "river", "sugar", "tiger",
  "uncle", "voice", "water", "xray", "yacht", "zebra", "brick", "cloud", "drain", "earth",
  "forest", "glass", "horse", "index", "joker", "koala", "light", "mouse", "noise", "orbit",
  "paper", "quick", "radish", "smile", "table", "unity", "vivid", "whale", "xenia", "yield",
  "zonal", "arrow", "brave", "coral", "diary", "elite", "frost", "gamer", "heart", "ink",
  "joust", "karma", "layer", "magic", "noble", "omega", "pearl", "quest", "root", "steam",
  "train", "urban", "valve", "width", "xenon", "yacht", "zest", "alpha", "blaze", "crew",
  "diary", "eclipse", "flare", "glide", "hunch", "icing", "joist", "karma", "lunar", "maple",
  "nerve", "orbit", "pulse", "quake", "ridge", "surge", "trend", "ultra", "vortex", "wave",
  "xerox", "yacht", "zappy", "agile", "brisk", "cargo", "delta", "enter", "focus", "grasp",
  "hoist", "imply", "jumbo", "knack", "lever", "midst", "notch", "olive", "prime", "quest",
  "relay", "sonic", "tribe", "unite", "vital", "wings", "xenial", "yield", "zonal"
];

module.exports = {
  name: "wordle",
  description: "Play a Wordle-like game with multiple features",
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const gameState = {
      word: '',
      attempts: 0,
      maxAttempts: 6,
      guessedLetters: new Set(),
      correctPositions: new Array(5).fill(null),
      inGameLetters: new Set(),
      gameOver: false
    };

    gameState.word = words[Math.floor(Math.random() * words.length)];

    await bot.sendMessage(chatId, `🎮 Welcome to my Wordle Challenge! I've chosen a secret 5-letter word. Can you guess it? You have ${gameState.maxAttempts} attempts. Good luck! 🚀`);

    const gameHandler = async (msg) => {
      if (msg.chat.id !== chatId || msg.from.id !== userId) return;

      const guess = msg.text.toLowerCase();

      if (!isValidGuess(guess)) {
        await bot.sendMessage(chatId, "❌ Oops! Please enter a valid 5-letter word.");
        return;
      }

      gameState.attempts++;

      try {
        const result = evaluateGuess(guess, gameState);
        
        updateGameTracking(guess, result, gameState);

        const resultMessage = `Attempt ${gameState.attempts}/${gameState.maxAttempts}: ${guess.toUpperCase()}\n${result.emoji}`;
        await bot.sendMessage(chatId, resultMessage);

        if (result.isCorrect) {
          await bot.sendMessage(chatId, `🎉 Congratulations! You cracked my secret word in ${gameState.attempts} attempts! The word was ${gameState.word.toUpperCase()}.`);
          endGame();
          return;
        }

        if (gameState.attempts >= gameState.maxAttempts) {
          await bot.sendMessage(chatId, `😔 Game over! My secret word was ${gameState.word.toUpperCase()}. Better luck next time!`);
          endGame();
        }
      } catch (error) {
        console.error("Game processing error:", error);
        await bot.sendMessage(chatId, "🤖 Oops! Something went wrong. Let's restart the game.");
        endGame();
      }
    };

    const listenerId = bot.onText(/^[a-zA-Z]{5}$/, gameHandler);

    function endGame() {
      bot.removeListener('text', listenerId);
      gameState.gameOver = true;
    }

    const gameTimeout = setTimeout(async () => {
      if (!gameState.gameOver) {
        await bot.sendMessage(chatId, `⏰ Game timed out! My secret word was ${gameState.word.toUpperCase()}.`);
        endGame();
      }
    }, 10 * 60 * 1000);
  }
};

function isValidGuess(guess) {
  return /^[a-zA-Z]{5}$/.test(guess) && words.includes(guess);
}

function evaluateGuess(guess, gameState) {
  const word = gameState.word;
  let emoji = '';
  let isCorrect = true;

  const wordLetters = word.split('');
  const result = new Array(5).fill('⬜');

  for (let i = 0; i < 5; i++) {
    if (guess[i] === word[i]) {
      result[i] = '🟩';
      wordLetters[i] = null;
      gameState.correctPositions[i] = guess[i];
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i] === '⬜') {
      const letterIndex = wordLetters.indexOf(guess[i]);
      if (letterIndex !== -1) {
        result[i] = '🟨';
        wordLetters[letterIndex] = null;
      }
    }
  }

  emoji = result.join('');
  isCorrect = emoji === '🟩🟩🟩🟩🟩';

  return { emoji, isCorrect };
}

function updateGameTracking(guess, result, gameState) {
  for (let letter of guess) {
    gameState.guessedLetters.add(letter);
  }

  for (let letter of gameState.word) {
    gameState.inGameLetters.add(letter);
  }
}
