const crypto = require('crypto');

class ChallengeGenerator {
  constructor() {
    this.challenges = {
      coding: [
        {
          title: "Hello World Program",
          difficulty: "Beginner",
          description: "Write a program that prints 'Hello, World!' to the console.",
          languages: ["JavaScript", "Python", "Java"],
          timeLimit: "15 minutes"
        },
        {
          title: "Sum Calculator",
          difficulty: "Beginner",
          description: "Create a function that calculates the sum of all numbers in an array.",
          languages: ["JavaScript", "Python", "Ruby"],
          timeLimit: "20 minutes"
        },
        {
          title: "Palindrome Checker",
          difficulty: "Intermediate",
          description: "Create a function that checks if a given string is a palindrome.",
          languages: ["JavaScript", "Python", "Java"],
          timeLimit: "30 minutes"
        },
        {
          title: "Fibonacci Sequence Generator",
          difficulty: "Intermediate",
          description: "Implement a function to generate Fibonacci sequence up to n terms.",
          languages: ["C++", "Ruby", "Go"],
          timeLimit: "45 minutes"
        },
        {
          title: "Binary Tree Traversal",
          difficulty: "Advanced",
          description: "Implement in-order, pre-order, and post-order traversal of a binary tree.",
          languages: ["Java", "C++", "Python"],
          timeLimit: "60 minutes"
        },
        {
          title: "Red-Black Tree Implementation",
          difficulty: "Advanced",
          description: "Implement a complete Red-Black Tree with insertion and deletion.",
          languages: ["C++", "Java", "Python"],
          timeLimit: "90 minutes"
        }
      ],
      algorithm: [
        {
          title: "Linear Search",
          difficulty: "Beginner",
          description: "Implement a linear search algorithm to find an element in an array.",
          languages: ["Python", "JavaScript", "Java"],
          timeLimit: "20 minutes"
        },
        {
          title: "Binary Search Implementation",
          difficulty: "Intermediate",
          description: "Implement a binary search algorithm on a sorted array.",
          languages: ["Python", "Java", "C"],
          timeLimit: "40 minutes"
        },
        {
          title: "A* Pathfinding Algorithm",
          difficulty: "Advanced",
          description: "Implement the A* pathfinding algorithm for a 2D grid.",
          languages: ["Python", "C++", "Java"],
          timeLimit: "120 minutes"
        }
      ],
      design: [
        {
          title: "Static Profile Card",
          difficulty: "Beginner",
          description: "Design a simple profile card using HTML and CSS.",
          skills: ["HTML", "CSS", "Flexbox"],
          timeLimit: "30 minutes"
        },
        {
          title: "Responsive Landing Page",
          difficulty: "Intermediate",
          description: "Design a fully responsive landing page for a tech startup.",
          skills: ["HTML", "CSS", "Flexbox"],
          timeLimit: "90 minutes"
        },
        {
          title: "E-Commerce Dashboard",
          difficulty: "Advanced",
          description: "Design a complex e-commerce dashboard with dark/light mode.",
          skills: ["HTML", "CSS", "JavaScript"],
          timeLimit: "180 minutes"
        }
      ]
    };

    this.difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];
    this.categories = Object.keys(this.challenges);
  }

  generateChallenge(category = null, difficulty = null) {
    try {
      // Validate category if provided
      if (category && !this.categories.includes(category)) {
        throw new Error(`Invalid category! Available categories are: ${this.categories.join(', ')}`);
      }

      // Validate difficulty if provided
      if (difficulty && !this.difficultyLevels.includes(difficulty)) {
        throw new Error(`Invalid difficulty! Available levels are: ${this.difficultyLevels.join(', ')}`);
      }

      const selectedCategory = category || 
        this.categories[crypto.randomInt(0, this.categories.length)];

      let challengeList = this.challenges[selectedCategory];

      // Filter by difficulty if specified
      if (difficulty) {
        challengeList = challengeList.filter(c => c.difficulty === difficulty);
        if (challengeList.length === 0) {
          throw new Error(`No challenges found for ${difficulty} difficulty in ${selectedCategory} category!`);
        }
      }

      const challenge = challengeList[crypto.randomInt(0, challengeList.length)];

      return {
        category: selectedCategory,
        ...challenge,
        id: this.generateChallengeId()
      };
    } catch (error) {
      throw error;
    }
  }

  generateChallengeId() {
    return crypto.randomBytes(8).toString('hex');
  }

  formatChallengeMessage(challenge) {
    return `
Hey there! 👋 I'm Lumina, and I've got an exciting challenge for you!

🌟 Challenge: ${challenge.title}
🏷️ Category: ${challenge.category.toUpperCase()}
📊 Difficulty: ${challenge.difficulty}

📝 Description:
${challenge.description}

🕒 Time Limit: ${challenge.timeLimit}

${challenge.languages ? 
  `💻 Recommended Languages: ${challenge.languages.join(', ')}` : 
  `🎨 Required Skills: ${challenge.skills?.join(', ') || challenge.tools?.join(', ')}`}

🆔 Challenge ID: <code>${challenge.id}</code>

💡 Quick Tip from Lumina: Remember to break down the problem into smaller steps and plan before coding! You've got this! ✨

Need help? Feel free to ask me questions! Type /help for more commands.
    `;
  }

  generateMultipleChallenges(count = 3, difficulty = null) {
    try {
      if (count > this.categories.length) {
        throw new Error(`I can only generate up to ${this.categories.length} different challenges at once!`);
      }

      const challenges = [];
      const usedCategories = new Set();

      while (challenges.length < count) {
        const challenge = this.generateChallenge(null, difficulty);
        
        if (!usedCategories.has(challenge.category)) {
          challenges.push(challenge);
          usedCategories.add(challenge.category);
        }
      }

      return challenges;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  name: 'challenge',
  description: 'Generate random coding or creative challenges',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const challengeGenerator = new ChallengeGenerator();

    try {
      await bot.sendChatAction(chatId, 'typing');

      let category = null;
      let difficulty = null;

      // Parse arguments
      if (args.length > 0) {
        // Check if first argument is a difficulty level
        if (challengeGenerator.difficultyLevels.includes(args[0])) {
          difficulty = args[0];
          if (args[1]) category = args[1].toLowerCase();
        } else {
          category = args[0].toLowerCase();
          if (args[1] && challengeGenerator.difficultyLevels.includes(args[1])) {
            difficulty = args[1];
          }
        }
      }

      const challenge = challengeGenerator.generateChallenge(category, difficulty);
      const challengeMessage = challengeGenerator.formatChallengeMessage(challenge);

      await bot.sendMessage(chatId, challengeMessage, {
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Challenge Generation Error:', error);
      const errorMessage = `Oops! 😅 ${error.message || "I couldn't generate a challenge right now."}\n\nTry using the command like this:\n/challenge [difficulty] [category]\n\nFor example:\n/challenge Beginner coding\n/challenge Intermediate algorithm`;
      
      await bot.sendMessage(chatId, errorMessage);
    }
  },

  async multiChallenges(bot, msg, args) {
    const chatId = msg.chat.id;
    const challengeGenerator = new ChallengeGenerator();

    try {
      await bot.sendChatAction(chatId, 'typing');

      let difficulty = null;
      if (args.length > 0 && challengeGenerator.difficultyLevels.includes(args[0])) {
        difficulty = args[0];
      }

      const challenges = challengeGenerator.generateMultipleChallenges(3, difficulty);
      
      const message = `Hey there! 🌟 I've prepared a set of exciting challenges for you!\n\n${
        challenges.map(challenge => 
          challengeGenerator.formatChallengeMessage(challenge)
        ).join('\n\n---\n\n')
      }\nGood luck! Remember, I'm here if you need any help! 🚀`;

      await bot.sendMessage(chatId, message, {
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Multiple Challenges Generation Error:', error);
      const errorMessage = `Oops! 😅 ${error.message || "I couldn't generate multiple challenges right now."}\n\nTry using the command like this:\n/multichallenges [difficulty]\n\nFor example:\n/multichallenges Beginner`;
      
      await bot.sendMessage(chatId, errorMessage);
    }
  }
};
