const crypto = require('crypto');

class PasswordGenerator {
  constructor() {
    this.charsets = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };
  }

  generatePassword(baseWord = '', options = {}) {
    const {
      length = 6,
      useUppercase = true,
      useLowercase = true,
      useNumbers = true,
      useSymbols = true
    } = options;

    // Validate input
    if (length < 6 || length > 32) {
      throw new Error('Password length must be between 6 and 32 characters');
    }

    // Build character set
    let charset = '';
    if (useLowercase) charset += this.charsets.lowercase;
    if (useUppercase) charset += this.charsets.uppercase;
    if (useNumbers) charset += this.charsets.numbers;
    if (useSymbols) charset += this.charsets.symbols;

    // Incorporate base word if provided
    const processedBaseWord = this.processBaseWord(baseWord, length);

    // Generate additional random characters
    const additionalLength = length - processedBaseWord.length;
    const additionalChars = this.generateRandomChars(charset, additionalLength);

    // Combine and shuffle
    const passwordChars = [
      ...processedBaseWord,
      ...additionalChars
    ];

    return this.shuffleArray(passwordChars).join('');
  }

  processBaseWord(baseWord, totalLength) {
    if (!baseWord) return [];

    // Transform base word
    const transformedWord = baseWord
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, Math.floor(totalLength / 2));

    // Add some variations
    const variations = [
      transformedWord,
      transformedWord.split('').reverse().join(''),
      this.capitalizeFirstLetter(transformedWord)
    ];

    return variations[crypto.randomInt(variations.length)]
      .split('')
      .map(this.randomlyModifyChar);
  }

  randomlyModifyChar(char) {
    const modifications = {
      'a': '@',
      'e': '3',
      'i': '!',
      'o': '0',
      's': '$'
    };
    
    // 30% chance of modification
    return Math.random() < 0.3 && modifications[char] 
      ? modifications[char] 
      : char;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  generateRandomChars(charset, length) {
    return Array.from({ length }, () => 
      this.getRandomChar(charset)
    );
  }

  getRandomChar(charset) {
    const randomBytes = crypto.randomBytes(4);
    const randomIndex = randomBytes.readUInt32LE(0) % charset.length;
    return charset[randomIndex];
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
  }

  evaluatePasswordStrength(password) {
    const criteria = [
      { 
        test: (pw) => pw.length >= 6, 
        message: '✅ Minimum length met' 
      },
      { 
        test: (pw) => /[a-z]/.test(pw), 
        message: '✅ Contains lowercase letters' 
      },
      { 
        test: (pw) => /[A-Z]/.test(pw), 
        message: '✅ Contains uppercase letters' 
      },
      { 
        test: (pw) => /[0-9]/.test(pw), 
        message: '✅ Contains numbers' 
      },
      { 
        test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw), 
        message: '✅ Contains special characters' 
      }
    ];

    const strengths = {
      weak: { color: '🔴', score: 1 },
      medium: { color: '🟠', score: 2 },
      strong: { color: '🟢', score: 3 },
      very_strong: { color: '🔵', score: 4 }
    };

    const passedTests = criteria.filter(c => c.test(password));
    const strengthLevel = this.determineStrengthLevel(passedTests.length);

    return {
      strength: strengthLevel,
      passedTests: passedTests.map(t => t.message),
      color: strengths[strengthLevel].color,
      score: strengths[strengthLevel].score
    };
  }

  determineStrengthLevel(passedTestCount) {
    if (passedTestCount <= 2) return 'weak';
    if (passedTestCount <= 3) return 'medium';
    if (passedTestCount <= 4) return 'strong';
    return 'very_strong';
  }
}

module.exports = {
  name: 'generatepass',
  description: 'Generate a secure password with optional base word',
  
  async execute(bot, msg, args) {
    const passwordGenerator = new PasswordGenerator();

    // Extract base word (first argument) or use empty string
    const baseWord = args[0] || '';

    try {
      // Generate password
      const password = passwordGenerator.generatePassword(baseWord);
      
      // Evaluate strength
      const strengthAnalysis = passwordGenerator.evaluatePasswordStrength(password);

      // Prepare response message
      const responseMessage = `
🔐 Generated Password:
\`${password}\`

🛡️ Strength Analysis:
${strengthAnalysis.color} Strength: ${strengthAnalysis.strength.toUpperCase()}
${strengthAnalysis.passedTests.join('\n')}

💡 Base Word: ${baseWord || 'None'}
      `;

      // Create inline keyboard for interaction
      const keyboard = {
        inline_keyboard: [
          [
            { 
              text: '📋 Copy Password', 
              callback_data: `copy_password:${password}` 
            },
            { 
              text: '🔄 Regenerate', 
              callback_data: `regenerate_pass:${baseWord}` 
            }
          ]
        ]
      };

      // Send message with password and keyboard
      await bot.sendMessage(msg.chat.id, responseMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

      // Handle callback queries
      bot.on('callback_query', async (callbackQuery) => {
        const [action, data] = callbackQuery.data.split(':');

        if (action === 'copy_password') {
          // Copy to clipboard mechanism (Telegram-specific)
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '📋 Password Copied!',
            show_alert: true
          });
        } else if (action === 'regenerate_pass') {
          // Regenerate password with same base word
          const regeneratedPassword = passwordGenerator.generatePassword(data);
          const regenStrength = passwordGenerator.evaluatePasswordStrength(regeneratedPassword);

          await bot.editMessageText(
            `🔐 Regenerated Password:\n\`${regeneratedPassword}\`\n\n${regenStrength.color} Strength: ${regenStrength.strength.toUpperCase()}`, 
            {
                        chat_id: msg.chat.id,
              message_id: callbackQuery.message.message_id,
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [
                    { 
                      text: '📋 Copy Password', 
                      callback_data: `copy_password:${regeneratedPassword}` 
                    },
                    { 
                      text: '🔄 Regenerate', 
                      callback_data: `regenerate_pass:${data}` 
                    }
                  ]
                ]
              }
            }
          );

          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '🔄 Password Regenerated!',
          });
        }
      });

    } catch (error) {
      console.error('Password Generation Error:', error);
      await bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
    }
  }
};

// Additional Utility Function for Bot Setup
function setupPasswordGeneratorCallbacks(bot) {
  // Global clipboard mechanism
  const userClipboards = new Map();

  bot.on('callback_query', async (callbackQuery) => {
    const [action, data] = callbackQuery.data.split(':');

    if (action === 'copy_password') {
      // Store password in user-specific clipboard
      userClipboards.set(callbackQuery.from.id, data);

      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '📋 Password Copied to Clipboard!',
        show_alert: true
      });
    }
  });

  // Optional: Add a command to retrieve last copied password
  bot.onText(/\/getpass/, async (msg) => {
    const userId = msg.from.id;
    const lastPassword = userClipboards.get(userId);

    if (lastPassword) {
      await bot.sendMessage(msg.chat.id, `🔐 Your Last Copied Password:\n\`${lastPassword}\``, {
        parse_mode: 'Markdown'
      });
    } else {
      await bot.sendMessage(msg.chat.id, '❌ No password copied recently.');
    }
  });
}

// Password Strength Visualization
function createPasswordStrengthVisualization(strength) {
  const strengthBars = {
    weak: '🟥🟥⬜⬜⬜',
    medium: '🟧🟧🟧⬜⬜',
    strong: '🟩🟩🟩🟩⬜',
    very_strong: '🟦🟦🟦🟦🟦'
  };

  return strengthBars[strength] || '⬜⬜⬜⬜⬜';
}

// Example Usage Guide Command
module.exports.helpCommand = {
  name: 'passhelp',
  description: 'Get help with password generation',
  
  async execute(bot, msg) {
    const helpMessage = `
🔐 Password Generator Help

Usage:
/generatepass - Generate random password
/generatepass [base_word] - Generate password using base word

Examples:
/generatepass - Random 6-char password
/generatepass John - Password based on 'John'
/generatepass MyName123 - Password with custom base

Features:
✅ 6-character minimum length
✅ Includes uppercase, lowercase, numbers
✅ Optional base word integration
✅ Strength analysis
✅ Copy to clipboard

Strength Levels:
🔴 Weak
🟠 Medium
🟢 Strong
🔵 Very Strong
    `;

    await bot.sendMessage(msg.chat.id, helpMessage);
  }
};

// Export setup function
module.exports.setupCallbacks = setupPasswordGeneratorCallbacks;
