const crypto = require('crypto');

module.exports = {
  name: "hangman",
  description: "Hangman Game with A-U Letters and Strategic Word Generation",
  
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id;
    
    // Custom word generation with strategic letter placement
    function generateCustomWord() {
      const wordTemplates = [
        { word: "python", requiredLetters: ['p', 'y', 't', 'h', 'o', 'n'] },
        { word: "robot", requiredLetters: ['r', 'o', 'b', 't'] },
        { word: "code", requiredLetters: ['c', 'o', 'd', 'e'] }
      ];

      const selected = wordTemplates[crypto.randomInt(0, wordTemplates.length)];
      return {
        word: selected.word.toLowerCase(),
        requiredLetters: selected.requiredLetters
      };
    }

    // Initialize game state
    const gameData = generateCustomWord();
    const word = gameData.word;
    const requiredLetters = gameData.requiredLetters;
    const guessedLetters = new Set();
    let remainingAttempts = 6;

    // Hangman display
    function getHangmanDisplay() {
      const hangmanStages = [
        "  +---+     \n  |   |     \n      |     \n      |     \n      |     \n      |     \n=========",
        "  +---+     \n  |   |     \n  O   |     \n      |     \n      |     \n      |     \n=========",
        "  +---+     \n  |   |     \n  O   |     \n  |   |     \n      |     \n      |     \n=========",
        "  +---+     \n  |   |     \n  O   |     \n /|   |     \n      |     \n      |     \n=========",
        "  +---+     \n  |   |     \n  O   |     \n /|\\  |     \n      |     \n      |     \n=========",
        "  +---+     \n  |   |     \n  O   |     \n /|\\  |     \n /    |     \n      |     \n=========",
        "  +---+     \n  |   |     \n  O   |     \n /|\\  |     \n / \\  |     \n      |     \n=========",
      ];
      return hangmanStages[6 - remainingAttempts];
    }

    // Generate keyboard with A-U letters and strategic placement
    function createCustomKeyboard() {
      const validLetters = 'abcdefghijklmnopqrstuvwxyz'
        .split('')
        .filter(letter => letter <= 'u');

      // Ensure required letters are included
      const keyboardLetters = [
        ...new Set([...requiredLetters, ...validLetters])
      ].filter(letter => letter <= 'u');

      // Shuffle letters while keeping required letters
      const shuffledLetters = keyboardLetters
        .sort(() => 0.5 - Math.random())
        .slice(0, 16);

      return [
        shuffledLetters.slice(0, 8).map(letter => ({
          text: guessedLetters.has(letter) ? '✓' : letter.toUpperCase(),
          callback_data: letter
        })),
        shuffledLetters.slice(8).map(letter => ({
          text: guessedLetters.has(letter) ? '✓' : letter.toUpperCase(),
          callback_data: letter
        }))
      ];
    }

    // Word display
    function getWordDisplay() {
      return word
        .split('')
        .map(letter => guessedLetters.has(letter) ? letter : '_')
        .join(' ');
    }

    // Start game
    async function startGame() {
      const gameMessage = await bot.sendMessage(chatId, 
        `Hangman Game\n\n${getHangmanDisplay()}\n\n${getWordDisplay()}`, 
        {
          reply_markup: {
            inline_keyboard: createCustomKeyboard()
          }
        }
      );
      return gameMessage;
    }

    // Update game message
    async function updateGameMessage(gameMessage) {
      await bot.editMessageText(
        `Hangman Game\n\n${getHangmanDisplay()}\n\n${getWordDisplay()}\n\n` +
        `Guessed Letters: ${Array.from(guessedLetters).join(', ')}\n` +
        `Remaining Attempts: ${remainingAttempts}`,
        {
          chat_id: chatId,
          message_id: gameMessage.message_id,
          reply_markup: {
            inline_keyboard: createCustomKeyboard()
          }
        }
      );
    }

    // Game logic handler
    async function handleGuess(query, gameMessage) {
      const letter = query.data.toLowerCase();

      if (guessedLetters.has(letter)) {
        await bot.answerCallbackQuery(query.id, {
          text: "Already guessed this letter!",
          show_alert: true
        });
        return true;
      }

      guessedLetters.add(letter);

      if (!word.includes(letter)) {
        remainingAttempts--;
        await bot.answerCallbackQuery(query.id, {
          text: `Incorrect! "${letter.toUpperCase()}" is not in the word.`,
          show_alert: true
        });
      } else {
        await bot.answerCallbackQuery(query.id, {
          text: `Good guess! "${letter.toUpperCase()}" is in the word.`,
          show_alert: true
        });
      }

      await updateGameMessage(gameMessage);

      if (remainingAttempts === 0) {
        await bot.sendMessage(chatId, `Game Over! The word was: ${word.toUpperCase()}`);
        return false;
      }

      if (!getWordDisplay().includes('_')) {
        await bot.sendMessage(chatId, `Congratulations! You guessed the word: ${word.toUpperCase()}`);
        return false;
      }

      return true;
    }

    // Main game execution
    const gameMessage = await startGame();

    bot.on('callback_query', async (query) => {
      if (query.message.message_id !== gameMessage.message_id) return;
      
      const continueGame = await handleGuess(query, gameMessage);
      if (!continueGame) {
        bot.removeListener('callback_query', this);
      }
    });
  }
};
