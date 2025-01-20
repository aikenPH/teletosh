const axios = require('axios');

const zodiacSigns = {
  'Aries': { 
    dates: 'March 21 - April 19',
    element: 'Fire',
    symbol: '♈',
    ruling_planet: 'Mars',
    personality_traits: [
      'Courageous', 'Energetic', 'Confident', 'Enthusiastic'
    ],
    compatibility: {
      best: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
      worst: ['Cancer', 'Capricorn', 'Virgo']
    }
  },
  'Taurus': {
    dates: 'April 20 - May 20',
    element: 'Earth',
    symbol: '♉',
    ruling_planet: 'Venus',
    personality_traits: [
      'Reliable', 'Patient', 'Practical', 'Devoted'
    ],
    compatibility: {
      best: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
      worst: ['Leo', 'Aquarius', 'Scorpio']
    }
  },
  'Gemini': {
    dates: 'May 21 - June 20',
    element: 'Air',
    symbol: '♊',
    ruling_planet: 'Mercury',
    personality_traits: [
      'Adaptable', 'Outgoing', 'Intellectual', 'Witty'
    ],
    compatibility: {
      best: ['Libra', 'Aquarius', 'Aries', 'Leo'],
      worst: ['Virgo', 'Pisces', 'Sagittarius']
    }
  },
  'Cancer': {
    dates: 'June 21 - July 22',
    element: 'Water',
    symbol: '♋',
    ruling_planet: 'Moon',
    personality_traits: [
      'Emotional', 'Intuitive', 'Nurturing', 'Protective'
    ],
    compatibility: {
      best: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
      worst: ['Aries', 'Libra', 'Sagittarius']
    }
  },
  'Leo': {
    dates: 'July 23 - August 22',
    element: 'Fire',
    symbol: '♌',
    ruling_planet: 'Sun',
    personality_traits: [
      'Charismatic', 'Generous', 'Creative', 'Confident'
    ],
    compatibility: {
      best: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
      worst: ['Taurus', 'Scorpio', 'Cancer']
    }
  },
  'Virgo': {
    dates: 'August 23 - September 22',
    element: 'Earth',
    symbol: '♍',
    ruling_planet: 'Mercury',
    personality_traits: [
      'Analytical', 'Practical', 'Detail-oriented', 'Modest'
    ],
    compatibility: {
      best: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
      worst: ['Gemini', 'Sagittarius', 'Leo']
    }
  },
  'Libra': {
    dates: 'September 23 - October 22',
    element: 'Air',
    symbol: '♎',
    ruling_planet: 'Venus',
    personality_traits: [
      'Charming', 'Diplomatic', 'Fair-minded', 'Social'
    ],
    compatibility: {
      best: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
      worst: ['Cancer', 'Capricorn', 'Scorpio']
    }
  },
  'Scorpio': {
    dates: 'October 23 - November 21',
    element: 'Water',
    symbol: '♏',
    ruling_planet: 'Pluto',
    personality_traits: [
      'Passionate', 'Resourceful', 'Determined', 'Intense'
    ],
    compatibility: {
      best: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
      worst: ['Leo', 'Aquarius', 'Taurus']
    }
  },
  'Sagittarius': {
    dates: 'November 22 - December 21',
    element: 'Fire',
    symbol: '♐',
    ruling_planet: 'Jupiter',
    personality_traits: [
      'Optimistic', 'Adventurous', 'Independent', 'Philosophical'
    ],
    compatibility: {
      best: ['Aries', 'Leo', 'Gemini', 'Aquarius'],
      worst: ['Virgo', 'Pisces', 'Cancer']
    }
  },
  'Capricorn': {
    dates: 'December 22 - January 19',
    element: 'Earth',
    symbol: '♑',
    ruling_planet: 'Saturn',
    personality_traits: [
      'Disciplined', 'Responsible', 'Ambitious', 'Practical'
    ],
    compatibility: {
      best: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
      worst: ['Aries', 'Libra', 'Gemini']
    }
  },
  'Aquarius': {
    dates: 'January 20 - February 18',
    element: 'Air',
    symbol: '♒',
    ruling_planet: 'Uranus',
    personality_traits: [
      'Innovative', 'Humanitarian', 'Independent', 'Eccentric'
    ],
    compatibility: {
      best: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
      worst: ['Taurus', 'Scorpio', 'Leo']
    }
  },
  'Pisces': {
    dates: 'February 19 - March 20',
    element: 'Water',
    symbol: '♓',
    ruling_planet: 'Neptune',
    personality_traits: [
      'Compassionate', 'Artistic', 'Intuitive', 'Gentle'
    ],
    compatibility: {
      best: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
      worst: ['Gemini', 'Sagittarius', 'Leo']
    }
  }
};

const compatibilityMatrix = {
  'Aries': {
    'Leo': {
      compatibility: '❤️ Perfect Match! Passionate and dynamic',
      score: 90,
      description: 'Both fire signs with incredible energy and mutual understanding.',
      emotional_connection: 'High',
      communication: 'Excellent',
      challenges: 'Potential ego conflicts'
    },
    'Sagittarius': {
      compatibility: '💖 Exciting and adventurous connection',
      score: 85,
      description: 'Shared love for adventure and spontaneity creates a strong bond.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May struggle with commitment'
    },
    'Gemini': {
      compatibility: '🔥 High energy and intellectual bond',
      score: 75,
      description: 'Stimulating conversations and mutual curiosity drive the relationship.',
      emotional_connection: 'Moderate',
      communication: 'Excellent',
      challenges: 'Can be inconsistent'
    },
    'Cancer': {
      compatibility: '❌ Challenging relationship, opposite approaches',
      score: 40,
      description: 'Conflicting emotional and action-oriented natures create tension.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different needs for security and independence'
    },
    'Capricorn': {
      compatibility: '⚠️ Potential conflicts in goals',
      score: 45,
      description: 'Ambitious Capricorn may clash with Aries’ impulsive nature.',
      emotional_connection: 'Low',
      communication: 'Average',
      challenges: 'Different priorities in life'
    },
    'Virgo': {
      compatibility: '⚠️ Practicality meets impulsiveness',
      score: 50,
      description: 'Virgo’s need for order may conflict with Aries’ spontaneity.',
      emotional_connection: 'Moderate',
      communication: 'Average',
      challenges: 'Different approaches to life'
    }
  },
  'Taurus': {
    'Virgo': {
      compatibility: '❤️ Stable and supportive partnership',
      score: 88,
      description: 'Shared earth element creates a practical and reliable connection.',
      emotional_connection: 'High',
      communication: 'Excellent',
      challenges: 'Can be too focused on routine'
    },
    'Capricorn': {
      compatibility: '💖 Strong foundation and mutual respect',
      score: 85,
      description: 'Both value stability, security, and long-term commitment.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May be too serious at times'
    },
    'Cancer': {
      compatibility: '💞 Nurturing and caring relationship',
      score: 80,
      description: 'Both signs value security and emotional connection.',
      emotional_connection: 'High',
      communication: 'Good',
      challenges: 'Can be overly cautious'
    },
    'Leo': {
      compatibility: '⚠️ Potential power struggles',
      score: 50,
      description: 'Taurus’ stubbornness may clash with Leo’s need for attention.',
      emotional_connection: 'Moderate',
      communication: 'Average',
      challenges: 'Different needs for independence'
    },
    'Aquarius': {
      compatibility: '❌ Challenging relationship, different values',
      score: 30,
      description: 'Taurus’ practicality may conflict with Aquarius’ unpredictability.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different approaches to life'
    }
  },
  'Gemini': {
    'Libra': {
      compatibility: '❤️ Harmonious and balanced relationship',
      score: 90,
      description: 'Both air signs enjoy socializing and intellectual discussions.',
      emotional_connection: 'High',
      communication: 'Excellent',
      challenges: 'Can be indecisive together'
    },
    'Aquarius': {
      compatibility: '💖 Exciting and innovative connection',
      score: 85,
      description: 'Shared love for freedom and exploration creates a strong bond.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May lack emotional depth'
    },
    'Aries': {
      compatibility: '🔥 High energy and intellectual bond',
      score: 75,
      description: 'Stimulating conversations and mutual curiosity drive the relationship.',
      emotional_connection: 'Moderate',
      communication: 'Excellent',
      challenges: 'Can be inconsistent'
    },
    'Virgo': {
      compatibility: '⚠️ Practicality meets spontaneity',
      score: 50,
      description: 'Virgo’s need for order may conflict with Gemini’s unpredictability.',
      emotional_connection: 'Moderate',
      communication: 'Average',
      challenges: 'Different approaches to life'
    },
    'Pisces': {
      compatibility: '❌ Challenging relationship, different needs',
      score: 40,
      description: 'Gemini’s need for freedom may clash with Pisces’ emotional depth.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different priorities in life'
    }
  },
  'Cancer': {
    'Scorpio': {
      compatibility: '❤️ Deep and intense connection',
      score: 90,
      description: 'Both water signs share emotional depth and understanding.',
      emotional_connection: 'High',
      communication: 'Excellent',
      challenges: 'Can be overly sensitive'
    },
    'Pisces': {
      compatibility: '💖 Nurturing and compassionate relationship',
      score: 85,
      description: 'Both value emotional connection and support each other well.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'Can be too idealistic'
    },
    'Taurus': {
      compatibility: '💞 Nurturing and caring relationship',
      score: 80,
      description: 'Both signs value security and emotional connection.',
      emotional_connection: 'High',
      communication: 'Good',
      challenges: 'Can be overly cautious'
    },
    'Aries': {
      compatibility: '❌ Challenging relationship, opposite approaches',
      score: 40,
      description: 'Conflicting emotional and action-oriented natures create tension.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different needs for security and independence'
    },
    'Libra': {
      compatibility: '⚠️ Potential misunderstandings',
      score: 50,
      description: 'Cancer’s emotional depth may clash with Libra’s need for balance.',
      emotional_connection: 'Moderate',
      communication: 'Average',
      challenges: 'Different approaches to relationships'
    }
  },
  'Leo': {
    'Aries': {
      compatibility: '❤️ Perfect Match! Passionate and dynamic',
      score: 90,
      description: 'Both fire signs with incredible energy and mutual understanding.',
      emotional_connection: 'High',
      communication: 'Excellent',
      challenges: 'Potential ego conflicts'
    },
    'Sagittarius': {
      compatibility: '💖 Exciting and adventurous connection',
      score: 85,
      description: 'Shared love for adventure and spontaneity creates a strong bond.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May struggle with commitment'
    },
    'Gemini': {
      compatibility: '🔥 High energy and intellectual bond',
      score: 75,
      description: 'Stimulating conversations and mutual curiosity drive the relationship.',
      emotional_connection: 'Moderate',
      communication: 'Excellent',
      challenges: 'Can be inconsistent'
    },
    'Taurus': {
      compatibility: '⚠️ Potential power struggles',
      score: 50,
      description: 'Taurus’ stubbornness may clash with Leo’s need for attention.',
      emotional_connection: 'Moderate',
      communication: 'Average',
      challenges: 'Different needs for independence'
    },
    'Scorpio': {
      compatibility: '❌ Intense but challenging relationship',
      score: 40,
      description: 'Leo’s need for attention may conflict with Scorpio’s intensity.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different emotional needs'
    }
  },
  'Virgo': {
    'Taurus': {
      compatibility: '❤️ Stable and supportive partnership',
      score: 88,
      description: 'Shared earth element creates a practical and reliable connection.',
      emotional_connection: 'High',
      communication: 'Excellent',
      challenges: 'Can be too focused on routine'
    },
    'Capricorn': {
      compatibility: '💖 Strong foundation and mutual respect',
      score: 85,
      description: 'Both value stability, security, and long-term commitment.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May be too serious at times'
    },
    'Gemini': {
      compatibility: '⚠️ Practicality meets spontaneity',
      score: 50,
      description: 'Virgo’s need for order may conflict with Gemini’s unpredictability.',
      emotional_connection: 'Moderate',
      communication: 'Average',
      challenges: 'Different approaches to life'
    },
    'Cancer': {
      compatibility: '💞 Nurturing and caring relationship',
      score: 80,
      description: 'Both signs value security and emotional connection.',
      emotional_connection: 'High',
      communication: 'Good',
      challenges: 'Can be overly cautious'
    },
    'Leo': {
      compatibility: '⚠️ Practicality meets impulsiveness',
      score: 50,
      description: 'Virgo’s need for order may conflict with Leo’s spontaneity.',
      emotional_connection: 'Moderate',
      communication: 'Average',
      challenges: 'Different approaches to life'
    }
  },
  'Libra': {
    'Gemini': {
      compatibility: '❤️ Harmonious and balanced relationship',
      score: 90,
      description: 'Both air signs enjoy socializing and intellectual discussions.',
      emotional_connection: 'High',
      communication: 'Excellent',
      challenges: 'Can be indecisive together'
    },
    'Aquarius': {
      compatibility: '💖 Exciting and innovative connection',
      score: 85,
      description: 'Shared love for freedom and exploration creates a strong bond.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May lack emotional depth'
    },
    'Aries': {
      compatibility: '⚠️ Potential misunderstandings',
      score: 50,
      description: 'Libra’s need for balance may clash with Aries’ impulsive nature.',
      emotional_connection: 'Moderate',
      communication: 'Average',
      challenges: 'Different approaches to relationships'
    },
    'Cancer': {
      compatibility: '⚠️ Potential misunderstandings',
      score: 50,
      description: 'Cancer’s emotional depth may clash with Libra’s need for balance.',
      emotional_connection: 'Moderate',
      communication: 'Average',
      challenges: 'Different approaches to relationships'
    },
    'Scorpio': {
      compatibility: '❌ Challenging relationship, different values',
      score: 30,
      description: 'Libra’s need for harmony may conflict with Scorpio’s intensity.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different emotional needs'
    }
  },
  'Scorpio': {
    'Cancer': {
      compatibility: '❤️ Deep and intense connection',
      score: 90,
      description: 'Both water signs share emotional depth and understanding.',
      emotional_connection: 'High',
      communication: 'Excellent',
      challenges: 'Can be overly sensitive'
    },
    'Pisces': {
      compatibility: '💖 Nurturing and compassionate relationship',
      score: 85,
      description: 'Both value emotional connection and support each other well.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'Can be too idealistic'
    },
    'Virgo': {
      compatibility: '⚠️ Practicality meets intensity',
      score: 50,
      description: 'Virgo’s need for order may conflict with Scorpio’s emotional depth.',
      emotional_connection: 'Moderate',
      communication: 'Average',
      challenges: 'Different approaches to life'
    },
    'Leo': {
      compatibility: '❌ Intense but challenging relationship',
      score: 40,
      description: 'Leo’s need for attention may conflict with Scorpio’s intensity.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different emotional needs'
    },
    'Aquarius': {
      compatibility: '❌ Challenging relationship, different values',
      score: 30,
      description: 'Scorpio’s depth may clash with Aquarius’ need for freedom.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different priorities in life'
    }
  },
  'Sagittarius': {
    'Aries': {
      compatibility: '💖 Exciting and adventurous connection',
      score: 85,
      description: 'Shared love for adventure and spontaneity creates a strong bond.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May struggle with commitment'
    },
    'Leo': {
      compatibility: '💖 Exciting and adventurous connection',
      score: 85,
      description: 'Shared love for adventure and spontaneity creates a strong bond.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May struggle with commitment'
    },
    'Gemini': {
      compatibility: '🔥 High energy and intellectual bond',
      score: 75,
      description: 'Stimulating conversations and mutual curiosity drive the relationship.',
      emotional_connection: 'Moderate',
      communication: 'Excellent',
      challenges: 'Can be inconsistent'
    },
    'Virgo': {
      compatibility: '⚠️ Practicality meets spontaneity',
      score: 50,
      description: 'Virgo’s need for order may conflict with Sagittarius’ adventurous spirit.',
      emotional_connection: 'Moderate',
      communication: 'Average',
      challenges: 'Different approaches to life'
    },
    'Pisces': {
      compatibility: '❌ Challenging relationship, different needs',
      score: 40,
      description: 'Sagittarius’ need for freedom may clash with Pisces’ emotional depth.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different priorities in life'
    }
  },
  'Capricorn': {
    'Taurus': {
      compatibility: '💖 Strong foundation and mutual respect',
      score: 85,
      description: 'Both value stability, security, and long-term commitment.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May be too serious at times'
    },
    'Virgo': {
      compatibility: '💖 Strong foundation and mutual respect',
      score: 85,
      description: 'Both value stability, security, and long-term commitment.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May be too serious at times'
    },
    'Scorpio': {
      compatibility: '⚠️ Potential conflicts in goals',
      score: 45,
      description: 'Ambitious Capricorn may clash with Scorpio’s emotional intensity.',
      emotional_connection: 'Low',
      communication: 'Average',
      challenges: 'Different priorities in life'
    },
    'Aries': {
      compatibility: '⚠️ Potential conflicts in goals',
      score: 45,
      description: 'Ambitious Capricorn may clash with Aries’ impulsive nature.',
      emotional_connection: 'Low',
      communication: 'Average',
      challenges: 'Different priorities in life'
    },
    'Aquarius': {
      compatibility: '❌ Challenging relationship, different values',
      score: 30,
      description: 'Capricorn’s practicality may conflict with Aquarius’ unpredictability.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different approaches to life'
    }
  },
  'Aquarius': {
    'Gemini': {
      compatibility: '💖 Exciting and innovative connection',
      score: 85,
      description: 'Shared love for freedom and exploration creates a strong bond.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May lack emotional depth'
    },
    'Libra': {
      compatibility: '💖 Exciting and innovative connection',
      score: 85,
      description: 'Shared love for freedom and exploration creates a strong bond.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May lack emotional depth'
    },
    'Sagittarius': {
      compatibility: '💖 Exciting and adventurous connection',
      score: 85,
      description: 'Shared love for adventure and spontaneity creates a strong bond.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'May struggle with commitment'
    },
    'Taurus': {
      compatibility: '❌ Challenging relationship, different values',
      score: 30,
      description: 'Aquarius’ unpredictability may conflict with Taurus’ practicality.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different approaches to life'
    },
    'Scorpio': {
      compatibility: '❌ Challenging relationship, different values',
      score: 30,
      description: 'Aquarius’ need for freedom may clash with Scorpio’s intensity.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different emotional needs'
    }
  },
  'Pisces': {
    'Cancer': {
      compatibility: '💖 Nurturing and compassionate relationship',
      score: 85,
      description: 'Both value emotional connection and support each other well.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'Can be too idealistic'
    },
    'Scorpio': {
      compatibility: '💖 Nurturing and compassionate relationship',
      score: 85,
      description: 'Both value emotional connection and support each other well.',
      emotional_connection: 'High',
      communication: 'Great',
      challenges: 'Can be too idealistic'
    },
    'Taurus': {
      compatibility: '💞 Nurturing and caring relationship',
      score: 80,
      description: 'Both signs value security and emotional connection.',
      emotional_connection: 'High',
      communication: 'Good',
      challenges: 'Can be overly cautious'
    },
    'Gemini': {
      compatibility: '❌ Challenging relationship, different needs',
      score: 40,
      description: 'Pisces’ emotional depth may clash with Gemini’s need for freedom.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different priorities in life'
    },
    'Sagittarius': {
      compatibility: '❌ Challenging relationship, different needs',
      score: 40,
      description: 'Sagittarius’ need for freedom may clash with Pisces’ emotional depth.',
      emotional_connection: 'Low',
      communication: 'Poor',
      challenges: 'Different priorities in life'
    }
  }
};


class ZodiacCompatibility {
  constructor(bot) {
    this.bot = bot;
    this.zodiacSigns = zodiacSigns;
    this.compatibilityMatrix = compatibilityMatrix;
  }

  async executeCompatibility(msg, args) {
    const chatId = msg.chat.id;

    if (args.length !== 2) {
      return this.sendErrorMessage(chatId, 
        "Incorrect format! Use:\n" +
        "/zodiac [Sign1] [Sign2]\n" +
        "Example: /zodiac Aries Leo"
      );
    }

    const sign1 = this.normalizeSign(args[0]);
    const sign2 = this.normalizeSign(args[1]);

    if (!this.isValidSign(sign1) || !this.isValidSign(sign2)) {
      return this.sendErrorMessage(chatId, 
        "Invalid zodiac sign. Valid signs are:\n" +
        Object.keys(zodiacSigns).join(', ')
      );
    }

    const compatibility = this.calculateCompatibility(sign1, sign2);
    const message = this.generateCompatibilityMessage(sign1, sign2, compatibility);

    await this.sendRichMessage(chatId, message);
  }

  calculateCompatibility(sign1, sign2) {
    const baseCompatibility = this.compatibilityMatrix[sign1]?.[sign2] || 
                               this.compatibilityMatrix[sign2]?.[sign1] || 
                               this.generateDefaultCompatibility(sign1, sign2);

    const elementBoost = this.calculateElementCompatibility(sign1, sign2);
    
    return {
      ...baseCompatibility,
      score: Math.min(baseCompatibility.score + elementBoost, 100)
    };
  }

  calculateElementCompatibility(sign1, sign2) {
    const elementCompatibilityMap = {
      'Fire': ['Air'],
      'Earth': ['Water'],
      'Air': ['Fire'],
      'Water': ['Earth']
    };

    const sign1Element = this.zodiacSigns[sign1].element;
    const sign2Element = this.zodiacSigns[sign2].element;

    return elementCompatibilityMap[sign1Element]?.includes(sign2Element) ? 15 : 5;
  }

  generateDefaultCompatibility(sign1, sign2) {
    return {
      compatibility: '🤝 Neutral Compatibility',
      score: 60,
      description: 'Balanced relationship with potential for growth',
      emotional_connection: 'Moderate',
      communication: 'Average',
      challenges: 'Requires mutual understanding'
    };
  }

  generateCompatibilityMessage(sign1, sign2, compatibility) {
    const sign1Details = this.zodiacSigns[sign1];
    const sign2Details = this.zodiacSigns[sign2];

    return `
🌟 Zodiac Compatibility Report 🌟

${sign1} ${sign1Details.symbol} ♥️ ${sign2} ${sign2Details.symbol}

📊 Compatibility Score: ${compatibility.score}%

💖 Compatibility: ${compatibility.compatibility}

🔮 Insights:
• Emotional Connection: ${compatibility.emotional_connection}
• Communication Level: ${compatibility.communication}
• Potential Challenges: ${compatibility.challenges}

🌈 Sign Details:
${sign1} (${sign1Details.dates})
• Element: ${sign1Details.element}
• Ruling Planet: ${sign1Details.ruling_planet}
• Key Traits: ${sign1Details.personality_traits.join(', ')}

${sign2} (${sign2Details.dates})
• Element: ${sign2Details.element}
• Ruling Planet: ${sign2Details.ruling_planet}
• Key Traits: ${sign2Details.personality_traits.join(', ')}

💡 Compatibility Tip: ${this.generateCompatibilityTip(sign1, sign2)}
    `;
  }

  generateCompatibilityTip(sign1, sign2) {
  const tips = [
    'Communication is key to understanding each other.',
    'Respect each other\'s differences and unique perspectives.',
    'Practice patience and empathy in your relationship.',
    'Embrace your complementary strengths.',
    'Listen actively and validate each other\'s feelings.',
    'Create space for individual growth and shared experiences.',
    'Be honest and transparent about your needs and expectations.',
    'Celebrate each other\'s uniqueness and achievements.',
    'Find a balance between independence and togetherness.',
    'Practice emotional intelligence and understanding.',
    'Support each other\'s dreams and personal goals.',
    'Maintain a sense of humor and playfulness.',
    'Be willing to compromise and find middle ground.',
    'Show appreciation and gratitude regularly.',
    'Learn from each other\'s strengths and perspectives.',
    'Build trust through consistent actions and words.',
    'Create shared rituals and meaningful experiences.',
    'Respect each other\'s personal boundaries.',
    'Cultivate emotional and intellectual intimacy.',
    'Navigate challenges as a team, not as opponents.',
    'Practice forgiveness and let go of minor conflicts.',
    'Maintain mutual respect and admiration.',
    'Keep the relationship dynamic and evolving.',
    'Prioritize quality time and meaningful connection.',
    'Be each other\'s biggest supporters and cheerleaders.'
  ];

  return tips[Math.floor(Math.random() * tips.length)];
}

  isValidSign(sign) {
    return Object.keys(this.zodiacSigns).includes(sign);
  }

  normalizeSign(sign) {
    return sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
  }

  async sendErrorMessage(chatId, message) {
    await this.bot.sendMessage(chatId, message);
  }

  async sendRichMessage(chatId, message) {
    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  }
}

module.exports = {
  name: 'zodiac',
  description: 'Zodiac compatibility analysis',
  zodiacSigns,
  compatibilityMatrix,
  async execute(bot, msg, args) {
    const zodiacCompat = new ZodiacCompatibility(bot);
    await zodiacCompat.executeCompatibility(msg, args);
  }
};
