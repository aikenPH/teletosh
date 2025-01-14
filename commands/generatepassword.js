class PasswordGenerator {
  constructor() {
    this.charsets = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_'
    };
  }

  generatePassword(baseWord = '', length = 12, options = {}) {
    const {
      useUppercase = true,
      useLowercase = true,
      useNumbers = true,
      useSymbols = true
    } = options;

    // Validate input
    if (length < 7 || length > 32) {
      throw new Error('Password length must be between 7 and 32 characters');
    }

    // Build character set dynamically
    let charset = '';
    if (useLowercase) charset += this.charsets.lowercase;
    if (useUppercase) charset += this.charsets.uppercase;
    if (useNumbers) charset += this.charsets.numbers;
    if (useSymbols) charset += this.charsets.symbols;

    // Process base word
    const processedBaseWord = this.processBaseWord(baseWord, length);

    // Calculate additional character length
    const additionalLength = length - processedBaseWord.length;
    
    // Generate additional random characters
    const additionalChars = this.generateRandomChars(charset, additionalLength);

    // Combine and shuffle
    const passwordChars = [
      ...processedBaseWord,
      ...additionalChars.split('')
    ];

    return this.shuffleArray(passwordChars).join('');
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

  generateRandomChars(charset, length) {
    let randomChars = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomChars += charset[randomIndex];
    }
    return randomChars;
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
        test: (pw) => pw.length >= 7, 
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
  description: 'Generate strong passwords with optional base word',
  
  async execute(bot, msg, args) {
    const passwordGenerator = new PasswordGenerator();
    const baseWord = args[0] || '';
    const passwordLength = 12;

    try {
      const passwords = [];
      const strengthAnalyses = [];

      for (let i = 0; i < 6; i++) {
        const password = passwordGenerator.generatePassword(baseWord, passwordLength);
        const strengthAnalysis = passwordGenerator.evaluatePasswordStrength(password);
        
        passwords.push(`<code>${password}</code>`);
        strengthAnalyses.push(`${strengthAnalysis.color} ${strengthAnalysis.strength.toUpperCase()}`);
      }

      const responseMessage = `
🔐 Generated Passwords:
${passwords.join('\n')}

🛡️ Strength Levels:
${strengthAnalyses.join('\n')}

💡 Base Word: ${baseWord || 'None'}
      `;

      await bot.sendMessage(msg.chat.id, responseMessage, {
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Password Generation Error:', error);
      await bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
    }
  }
};
