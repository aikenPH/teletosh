const crypto = require('crypto');

class ChallengeGenerator {
  constructor() {
    this.challenges = {
      beginner: {
        coding: [
          {
            title: "Temperature Converter",
            difficulty: "Beginner",
            description: "Create a program that converts Celsius to Fahrenheit and vice versa.",
            languages: ["Python", "JavaScript", "Java"],
            timeLimit: "20 minutes",
            learningObjectives: [
              "Basic type conversion",
              "Simple mathematical operations",
              "Function creation"
            ]
          },
          {
            title: "Guess the Number Game",
            difficulty: "Beginner",
            description: "Develop a simple number guessing game where the computer generates a random number.",
            languages: ["Python", "JavaScript", "C++"],
            timeLimit: "30 minutes",
            learningObjectives: [
              "Random number generation",
              "User input handling",
              "Conditional statements"
            ]
          }
        ],
        design: [
          {
            title: "Personal Portfolio Webpage",
            difficulty: "Beginner",
            description: "Create a simple personal portfolio webpage with HTML and CSS.",
            skills: ["HTML", "CSS", "Responsive Design"],
            timeLimit: "45 minutes",
            learningObjectives: [
              "Basic HTML structure",
              "CSS styling",
              "Layout design"
            ]
          }
        ]
      },
      intermediate: {
        coding: [
          {
            title: "Todo List Application",
            difficulty: "Intermediate",
            description: "Build a full-featured Todo List app with add, edit, delete, and mark complete functionality.",
            languages: ["React", "Vue.js", "Angular"],
            timeLimit: "90 minutes",
            learningObjectives: [
              "State management",
              "CRUD operations",
              "Component-based architecture"
            ]
          },
          {
            title: "Weather API Integration",
            difficulty: "Intermediate",
            description: "Create an application that fetches and displays weather data from a public API.",
            languages: ["JavaScript", "Python", "Node.js"],
            timeLimit: "60 minutes",
            learningObjectives: [
              "API integration",
              "Async programming",
              "Error handling"
            ]
          }
        ],
        algorithm: [
          {
            title: "Balanced Parentheses Checker",
            difficulty: "Intermediate",
            description: "Implement an algorithm to check if parentheses in a string are balanced.",
            languages: ["Java", "C++", "Python"],
            timeLimit: "45 minutes",
            learningObjectives: [
              "Stack data structure",
              "String manipulation",
              "Algorithmic thinking"
            ]
          }
        ]
      },
      advanced: {
        coding: [
          {
            title: "Real-time Chat Application",
            difficulty: "Advanced",
            description: "Develop a full-stack real-time chat application with WebSocket support.",
            languages: ["Node.js", "React", "Socket.IO"],
            timeLimit: "180 minutes",
            learningObjectives: [
              "WebSocket implementation",
              "Full-stack development",
              "Real-time communication"
            ]
          },
          {
            title: "Distributed Caching System",
            difficulty: "Advanced",
            description: "Design a distributed caching system with consistency and scalability.",
            languages: ["Go", "Rust", "Distributed Systems"],
            timeLimit: "240 minutes",
            learningObjectives: [
              "Distributed systems design",
              "Caching strategies",
              "Performance optimization"
            ]
          }
        ],
        algorithm: [
          {
            title: "Advanced Path Finding Algorithm",
            difficulty: "Advanced",
            description: "Implement A* pathfinding algorithm with obstacle avoidance.",
            languages: ["Python", "C++", "Java"],
            timeLimit: "120 minutes",
            learningObjectives: [
              "Graph algorithms",
              "Heuristic optimization",
              "Complex problem-solving"
            ]
          }
        ]
      }
    };
  }

  validateInput(difficulty, category) {
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    const validCategories = Object.keys(this.challenges[validDifficulties[0]]);

    if (!validDifficulties.includes(difficulty)) {
      throw new Error(`difficulty`, 
        `Oops! 🤖 I can only generate challenges for: ${validDifficulties.join(', ')}.`
      );
    }

    if (!validCategories.includes(category)) {
      throw new Error(`category`, 
        `Hmm... 🧐 I can only generate challenges in these categories: ${validCategories.join(', ')}.`
      );
    }
  }

  generateChallenge(difficulty = null, category = null) {
    const difficulties = Object.keys(this.challenges);
    const selectedDifficulty = difficulty || 
      difficulties[crypto.randomInt(0, difficulties.length)];

    const categories = Object.keys(this.challenges[selectedDifficulty]);
    const selectedCategory = category || 
      categories[crypto.randomInt(0, categories.length)];

    this.validateInput(selectedDifficulty, selectedCategory);

    const challengeList = this.challenges[selectedDifficulty][selectedCategory];
    const challenge = challengeList[crypto.randomInt(0, challengeList.length)];

    return {
      difficulty: selectedDifficulty,
      category: selectedCategory,
      ...challenge,
      id: this.generateChallengeId()
    };
  }

  generateChallengeId() {
    return crypto.randomBytes(8).toString('hex');
  }

  formatChallengeMessage(challenge) {
    return `
🚀 Challenge: ${challenge.title}
🏷️ Difficulty: ${challenge.difficulty.toUpperCase()}
📊 Category: ${challenge.category.toUpperCase()}

📝 Description:
${challenge.description}

🕒 Time Limit: ${challenge.timeLimit}

💻 Recommended Languages: ${challenge.languages?.join(', ') || 'Any'}

🎓 Learning Objectives:
${challenge.learningObjectives.map(obj => `• ${obj}`).join('\n')}

🆔 Challenge ID: <code>${challenge.id}</code>

💡 Tip: Break down the problem, plan your approach, and have fun coding!
    `;
  }
}

module.exports = {
  name: 'challenge',
  description: 'Generate coding challenges with difficulty levels',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const challengeGenerator = new ChallengeGenerator();

    try {
      await bot.sendChatAction(chatId, 'typing');

      let challenge;
      if (args.length === 2) {
        const [difficulty, category] = args.map(arg => arg.toLowerCase());
        challenge = challengeGenerator.generateChallenge(difficulty, category);
      } else if (args.length === 1) {
        const input = args[0].toLowerCase();
        challenge = challengeGenerator.generateChallenge(input) || 
          challengeGenerator.generateChallenge(null, input);
      } else {
        challenge = challengeGenerator.generateChallenge();
      }

      const challengeMessage = challengeGenerator.formatChallengeMessage(challenge);

      await bot.sendMessage(chatId, challengeMessage, {
        parse_mode: 'HTML'
      });

    } catch (error) {
      let errorMessage;
      if (error.type === 'difficulty') {
        errorMessage = `🤖 Hey there! ${error.message}`;
      } else if (error.type === 'category') {
        errorMessage = `🧐 Oops! ${error.message}`;
      } else {
        errorMessage = "Hmm... Something went wrong. My circuits are a bit tangled! 🤖";
      }

      await bot.sendMessage(chatId, errorMessage);
    }
  
    async multiChallenges(bot, msg, args) {
    const chatId = msg.chat.id;
    const challengeGenerator = new ChallengeGenerator();

    try {
      await bot.sendChatAction(chatId, 'typing');

      let challenges;
      if (args.length === 2) {
        const [difficulty, category] = args.map(arg => arg.toLowerCase());
        challengeGenerator.validateInput(difficulty, category);
        
        challenges = Array.from({ length: 3 }, () => 
          challengeGenerator.generateChallenge(difficulty, category)
        );
      } else if (args.length === 1) {
        const input = args[0].toLowerCase();
        challenges = Array.from({ length: 3 }, () => {
          try {
            return challengeGenerator.generateChallenge(input) || 
              challengeGenerator.generateChallenge(null, input);
          } catch (error) {
            return challengeGenerator.generateChallenge();
          }
        });
      } else {
        challenges = challengeGenerator.generateMultipleChallenges();
      }

      const challengeMessages = challenges.map(challenge => 
        challengeGenerator.formatChallengeMessage(challenge)
      ).join('\n\n---\n\n');

      await bot.sendMessage(chatId, challengeMessages, {
        parse_mode: 'HTML'
      });

    } catch (error) {
      let errorMessage;
      if (error.type === 'difficulty') {
        errorMessage = `🤖 Oops! ${error.message} I'll generate a random challenge instead.`;
      } else if (error.type === 'category') {
        errorMessage = `🧐 Hmm... ${error.message} Let me surprise you with a random challenge!`;
      } else {
        errorMessage = "My challenge generator seems to be on a coffee break! 😅 Try again later.";
      }

      await bot.sendMessage(chatId, errorMessage);
    }
  },

  async challengeStats(bot, msg, args) {
    const chatId = msg.chat.id;
    const challengeGenerator = new ChallengeGenerator();

    try {
      const stats = {
        totalChallenges: 0,
        challengesByDifficulty: {},
        challengesByCategory: {}
      };

      Object.keys(challengeGenerator.challenges).forEach(difficulty => {
        stats.challengesByDifficulty[difficulty] = 0;
        
        Object.keys(challengeGenerator.challenges[difficulty]).forEach(category => {
          const categoryChallenges = challengeGenerator.challenges[difficulty][category];
          
          stats.totalChallenges += categoryChallenges.length;
          stats.challengesByDifficulty[difficulty] += categoryChallenges.length;
          
          if (!stats.challengesByCategory[category]) {
            stats.challengesByCategory[category] = 0;
          }
          stats.challengesByCategory[category] += categoryChallenges.length;
        });
      });

      const statsMessage = `
🔍 Challenge Generator Stats:

📊 Total Challenges: ${stats.totalChallenges}

🏆 Challenges by Difficulty:
${Object.entries(stats.challengesByDifficulty).map(([diff, count]) => 
  `• ${diff.toUpperCase()}: ${count} challenges`
).join('\n')}

🧩 Challenges by Category:
${Object.entries(stats.challengesByCategory).map(([category, count]) => 
  `• ${category.toUpperCase()}: ${count} challenges`
).join('\n')}

💡 I'm always expanding my challenge library! Keep coding!
      `;

      await bot.sendMessage(chatId, statsMessage);

    } catch (error) {
      console.error('Challenge Stats Error:', error);
      await bot.sendMessage(chatId, "Oops! My stats calculator seems to be taking a break. 🤖");
    }
  },

  async suggestChallenge(bot, msg, args) {
    const chatId = msg.chat.id;
    const challengeGenerator = new ChallengeGenerator();

    try {
      await bot.sendChatAction(chatId, 'typing');

      const learningPath = [
        "Just starting your coding journey? 🌱",
        "Feeling more confident and ready to level up? 🚀",
        "Looking to tackle complex problems? 💪"
      ];

      const recommendationMessage = `
🤖 Lumina's Challenge Recommendation:

${learningPath.map((path, index) => 
  `${['🟢', '🟡', '🔴'][index]} ${path}`
).join('\n')}

🎯 Recommended Difficulty Progression:
1. Beginner Challenges: Build fundamental skills
2. Intermediate Challenges: Apply and expand knowledge
3. Advanced Challenges: Push your coding limits

💡 Pro Tip: Don't just copy-paste code. Understand each line!

🚀 Ready to start? Try:
• /challenge beginner coding
• /challenge intermediate algorithm
• /challenge advanced design
      `;

      await bot.sendMessage(chatId, recommendationMessage);

    } catch (error) {
      console.error('Challenge Suggestion Error:', error);
      await bot.sendMessage(chatId, "My recommendation engine is taking a quick nap! 😴");
    }
  }
};
