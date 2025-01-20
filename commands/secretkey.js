const crypto = require('crypto');

class SecretKeyGenerator {
  constructor(options = {}) {
    this.defaultOptions = {
      length: 32,
      type: 'hex',
      complexity: 'high',
      specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      prefix: '',
      suffix: ''
    };
    this.options = { ...this.defaultOptions, ...options };
  }

  generateRandomBytes(length) {
    return crypto.randomBytes(length);
  }

  generateHexKey(length) {
    return this.generateRandomBytes(length).toString('hex');
  }

  generateBase64Key(length) {
    return this.generateRandomBytes(length).toString('base64');
  }

  generateAlphanumericKey(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(crypto.randomInt(0, chars.length));
    }
    return result;
  }

  generateComplexKey(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(crypto.randomInt(0, chars.length));
    }
    return result;
  }

  generateUUIDKey() {
    return crypto.randomUUID();
  }

  generateSecretKey() {
    const { length, type, complexity, prefix, suffix } = this.options;

    let key;
    switch (type) {
      case 'hex':
        key = this.generateHexKey(length);
        break;
      case 'base64':
        key = this.generateBase64Key(length);
        break;
      case 'alphanumeric':
        key = this.generateAlphanumericKey(length);
        break;
      case 'complex':
        key = this.generateComplexKey(length);
        break;
      case 'uuid':
        key = this.generateUUIDKey();
        break;
      default:
        key = this.generateHexKey(length);
    }

    return `${prefix}${key}${suffix}`;
  }

  generateMultipleKeys(count) {
    const keys = new Set();
    while (keys.size < count) {
      keys.add(this.generateSecretKey());
    }
    return Array.from(keys);
  }

  validateKeyStrength(key) {
    const strengthChecks = {
      length: key.length >= 16,
      hasUppercase: /[A-Z]/.test(key),
      hasLowercase: /[a-z]/.test(key),
      hasNumbers: /[0-9]/.test(key),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};:,.<>?]/.test(key)
    };

    return {
      isStrong: Object.values(strengthChecks).every(check => check),
      checks: strengthChecks
    };
  }

  hashKey(key, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(key).digest('hex');
  }
}

module.exports = {
  name: 'secretkey',
  description: 'Generate secure secret keys',
  async execute(bot, msg, args) {
    const keyGenerator = new SecretKeyGenerator({
      length: 32,
      type: 'complex',
      prefix: 'SK_'
    });

    try {
      const key = keyGenerator.generateSecretKey();
      const keyStrength = keyGenerator.validateKeyStrength(key);
      const hashedKey = keyGenerator.hashKey(key);

      const response = `
🔐 Secret Key Generator 🔐

✅ Generated Key: <code>${key}</code>

🔒 Hashed Key: <code>${hashedKey}</code>

🛡️ Key Strength:
• Length: ${keyStrength.checks.length ? '✓' : '✗'}
• Uppercase: ${keyStrength.checks.hasUppercase ? '✓' : '✗'}
• Lowercase: ${keyStrength.checks.hasLowercase ? '✓' : '✗'}
• Numbers: ${keyStrength.checks.hasNumbers ? '✓' : '✗'}
• Special Chars: ${keyStrength.checks.hasSpecialChars ? '✓' : '✗'}

Overall Strength: ${keyStrength.isStrong ? 'Strong 💪' : 'Weak ⚠️'}
      `;

      await bot.sendMessage(msg.chat.id, response, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Key generation error:', error);
      await bot.sendMessage(msg.chat.id, 'Failed to generate secret key.');
    }
  }
};
