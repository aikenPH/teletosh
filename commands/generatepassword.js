class PasswordGenerator {
  constructor() {
    this.charsets = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };
  }

  generatePassword(baseWord = '', length = 8, options = {}) {
    const {
      useUppercase = true,
      useLowercase = true,
      useNumbers = true,
      useSymbols = true,
      includeSimilarChars = false
    } = options;

    if (length < 7 || length > 32) {
      throw new Error('Password length must be between 7 and 32 characters');
    }

    let charset = '';
    if (useLowercase) charset += this.charsets.lowercase;
    if (useUppercase) charset += this.charsets.uppercase;
    if (useNumbers) charset += this.charsets.numbers;
    if (useSymbols) charset += this.charsets.symbols;

    if (!includeSimilarChars) {
      const similarChars = 'l1O0';
      charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
    }

    const passwordChars = [];
    if (useLowercase) passwordChars.push(this.getRandomChar(this.charsets.lowercase));
    if (useUppercase) passwordChars.push(this.getRandomChar(this.charsets.uppercase));
    if (useNumbers) passwordChars.push(this.getRandomChar(this.charsets.numbers));
    if (useSymbols) passwordChars.push(this.getRandomChar(this.charsets.symbols));

    const processedBaseWord = this.processBaseWord(baseWord, length);
    passwordChars.push(...processedBaseWord);

    while (passwordChars.length < length) {
      passwordChars.push(this.getRandomChar(charset));
    }

    return this.shuffleArray(passwordChars).join('');
  }

  getRandomChar(charset) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    return charset[randomIndex];
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
  }

  processBaseWord(baseWord, totalLength) {
    if (!baseWord) return [];

    const transformedWord = baseWord
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, Math.floor(totalLength / 2));

    const variations = [
      transformedWord,
      transformedWord.split('').reverse().join(''),
      this.capitalizeFirstLetter(transformedWord)
    ];

    return variations[Math.floor(Math.random() * variations.length)]
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
    
    return Math.random() < 0.3 && modifications[char] 
      ? modifications[char] 
      : char;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

module.exports = {
  name: 'generatepass',
  description: 'Generate strong passwords with optional base word',
  
  async execute(bot, msg, args) {
    const passwordGenerator = new PasswordGenerator();

    const baseWord = args[0] || '';
    const passwordLength = 12;
    try {
      const passwords = [];
      for (let i = 0; i < 6; i++) {
        const password = passwordGenerator.generatePassword(baseWord, passwordLength, {
          useUppercase: true,
          useLowercase: true,
          useNumbers: true,
          useSymbols: true,
          includeSimilarChars: false
        });
        passwords.push(`*${password}*` );      }

      const responseMessage = `
🔐 Generated Passwords:
${passwords.join('\n')}
      
💡 Usage: /generatepass [base_word]
- Generates 6 strong passwords based on the base word (if provided).
- Passwords are between 7 and 32 characters long.
      `;

      await bot.sendMessage(msg.chat.id, responseMessage, {
        parse_mode: 'Markdown'
      });

    } catch (error) {
      console.error('Password Generation Error:', error);
      await bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
    }
  }
};
