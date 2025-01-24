const crypto = require('crypto');

module.exports = {
  name: "hangman",
  description: "Hangman Game with Randomized Letter Placement",
  
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id;
    
    // Extensive word list with strategic letter distribution
    const wordTemplates = [
      { word: "python", requiredLetters: ['p', 'y', 't', 'h', 'o', 'n'] },
      { word: "robot", requiredLetters: ['r', 'o', 'b', 't'] },
      { word: "code", requiredLetters: ['c', 'o', 'd', 'e'] },
      { word: "algorithm", requiredLetters: ['a', 'l', 'g', 'o', 'r', 'i', 't', 'h', 'm'] },
      { word: "network", requiredLetters: ['n', 'e', 't', 'w', 'o', 'r', 'k'] },
      { word: "machine", requiredLetters: ['m', 'a', 'c', 'h', 'i', 'n', 'e'] },
      { word: "database", requiredLetters: ['d', 'a', 't', 'a', 'b', 'a', 's', 'e'] },
      { word: "software", requiredLetters: ['s', 'o', 'f', 't', 'w', 'a', 'r', 'e'] },
      { word: "computer", requiredLetters: ['c', 'o', 'm', 'p', 'u', 't', 'e', 'r'] },
      { word: "internet", requiredLetters: ['i', 'n', 't', 'e', 'r', 'n', 'e', 't'] },
      { word: "developer", requiredLetters: ['d', 'e', 'v', 'e', 'l', 'o', 'p', 'e', 'r'] },
      { word: "programming", requiredLetters: ['p', 'r', 'o', 'g', 'r', 'a', 'm', 'm', 'i', 'n', 'g'] },
      { word: "system", requiredLetters: ['s', 'y', 's', 't', 'e', 'm'] },
      { word: "server", requiredLetters: ['s', 'e', 'r', 'v', 'e', 'r'] },
      { word: "cloud", requiredLetters: ['c', 'l', 'o', 'u', 'd'] },
      { word: "security", requiredLetters: ['s', 'e', 'c', 'u', 'r', 'i', 't', 'y'] },
      { word: "framework", requiredLetters: ['f', 'r', 'a', 'm', 'e', 'w', 'o', 'r', 'k'] },
      { word: "application", requiredLetters: ['a', 'p', 'p', 'l', 'i', 'c', 'a', 't', 'i', 'o', 'n'] },
      { word: "interface", requiredLetters: ['i', 'n', 't', 'e', 'r', 'f', 'a', 'c', 'e'] },
      { word: "runtime", requiredLetters: ['r', 'u', 'n', 't', 'i', 'm', 'e'] },
      { word: "cryptography", requiredLetters: ['c', 'r', 'y', 'p', 't', 'o', 'g', 'r', 'a', 'p', 'h', 'y'] },
      { word: "algorithm", requiredLetters: ['a', 'l', 'g', 'o', 'r', 'i', 't', 'h', 'm'] },
      { word: "quantum", requiredLetters: ['q', 'u', 'a', 'n', 't', 'u', 'm'] },
      { word: "browser", requiredLetters: ['b', 'r', 'o', 'w', 's', 'e', 'r'] },
      { word: "compiler", requiredLetters: ['c', 'o', 'm', 'p', 'i', 'l', 'e', 'r'] }
    ];

    // Enhanced custom word generation with randomized letter placement
    function generateCustomWord() {
      const selected = wordTemplates[crypto.randomInt(0, wordTemplates.length)];
      const word = selected.word.toLowerCase();
      const requiredLetters = [...new Set(selected.requiredLetters)];
      
      // Create a randomized word with correct letters and additional random letters
      const randomLength = Math.max(word.length + 2, word.length * 2);
      const randomLetters = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(l => !word.includes(l));
      
      let randomizedWord = '';
      let currentWordIndex = 0;
      
      for (let i = 0; i < randomLength; i++) {
        if (Math.random() < 0.4 && currentWordIndex < word.length) {
          // Add a correct letter
          randomizedWord += word[currentWordIndex];
          currentWordIndex++;
        } else {
          // Add a random letter
          const randomLetter = randomLetters[crypto.randomInt(0, randomLetters.length)];
          randomizedWord += randomLetter;
        }
      }
      
      // Ensure the original word is fully included
      while (currentWordIndex < word.length) {
        randomizedWord += word[currentWordIndex];
        currentWordIndex++;
      }
      
      return {
        word: word,
        randomizedWord: randomizedWord,
        requiredLetters: requiredLetters
      };
    }

    // Initialize game state
    const gameData = generateCustomWord();
    const word = gameData.word;
    const randomizedWord = gameData.randomizedWord;
    const requiredLetters = gameData.requiredLetters;
    const guessedLetters = new Set();
    let remainingAttempts = 6;

    // Hangman display (unchanged from previous version)
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

    // Generate keyboard with strategic letter placement
    function createCustomKeyboard() {
      // Ensure all required letters are included first
      const keyboardLetters = [
        ...new Set([...requiredLetters, ...'abcdefghijklmnopqrstuvwxyz'.split('')])
      ].filter(letter => letter <= 'u');

      // Shuffle letters while keeping required letters prominent
      const shuffledLetters = keyboardLetters
        .sort((a, b) => 
          requiredLetters.includes(b) ? 1 : 
          requiredLetters.includes(a) ? -1 : 
          0.5 - Math.random()
        )
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

    // Word display with randomized letters
    function getWordDisplay() {
      return randomizedWord
        .split('')
        .map(letter => 
          // Only reveal the original word letters if they've been guessed
          word.includes(letter) && guessedLetters.has(letter) ? letter : '_'
        )
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
