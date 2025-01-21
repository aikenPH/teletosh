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
          title: "Array Sum Calculator",
          difficulty: "Beginner",
          description: "Create a function that calculates the sum of all numbers in an array.",
          languages: ["JavaScript", "Python", "Ruby"],
          timeLimit: "20 minutes"
        },
        {
          title: "String Reversal",
          difficulty: "Beginner",
          description: "Write a function that reverses a string without using built-in reverse methods.",
          languages: ["Python", "JavaScript", "Java"],
          timeLimit: "25 minutes"
        },
        {
          title: "Palindrome Checker",
          difficulty: "Intermediate",
          description: "Create a function that checks if a given string is a palindrome, ignoring spaces and punctuation.",
          languages: ["JavaScript", "Python", "Java"],
          timeLimit: "30 minutes"
        },
        {
          title: "Fibonacci Generator",
          difficulty: "Intermediate",
          description: "Implement an efficient function to generate Fibonacci sequence up to n terms.",
          languages: ["C++", "Ruby", "Go"],
          timeLimit: "45 minutes"
        },
        {
          title: "Binary Tree Implementation",
          difficulty: "Advanced",
          description: "Implement a complete binary tree with insertion, deletion, and all three traversal methods.",
          languages: ["Java", "C++", "Python"],
          timeLimit: "90 minutes"
        }
      ],
      algorithm: [
        {
          title: "Bubble Sort",
          difficulty: "Beginner",
          description: "Implement the bubble sort algorithm for an array of numbers.",
          languages: ["Python", "JavaScript", "Java"],
          timeLimit: "30 minutes"
        },
        {
          title: "Binary Search",
          difficulty: "Intermediate",
          description: "Implement an iterative binary search algorithm on a sorted array.",
          languages: ["Python", "Java", "C"],
          timeLimit: "40 minutes"
        },
        {
          title: "Graph Traversal",
          difficulty: "Advanced",
          description: "Implement both BFS and DFS for a graph, with cycle detection.",
          languages: ["Python", "C++", "Java"],
          timeLimit: "120 minutes"
        }
      ],
      design: [
        {
          title: "Business Card",
          difficulty: "Beginner",
          description: "Create a simple business card design using HTML and CSS.",
          skills: ["HTML", "CSS"],
          timeLimit: "30 minutes"
        },
        {
          title: "Responsive Dashboard",
          difficulty: "Intermediate",
          description: "Design a responsive admin dashboard with navigation and widgets.",
          skills: ["HTML", "CSS", "JavaScript"],
          timeLimit: "90 minutes"
        },
        {
          title: "E-Commerce Platform",
          difficulty: "Advanced",
          description: "Design a full e-commerce platform with cart functionality and responsive design.",
          skills: ["HTML", "CSS", "JavaScript", "React"],
          timeLimit: "180 minutes"
        }
      ]
    };

    this.difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];
    this.categories = Object.keys(this.challenges);
  }

  getUsageInstructions() {
    return `
📚 Challenge Guide 📚

1️⃣  Category-Specific Challenge:
   /challenge [category]
   • Example: /challenge coding
   • Example: /challenge algorithm
   • Example: /challenge design

2️⃣ Difficulty-Specific Challenge:
   /challenge [difficulty]
   • Example: /challenge Beginner
   • Example: /challenge Intermediate
   • Example: /challenge Advanced

3️⃣ Category and Difficulty:
   /challenge [category] [difficulty]
   • Example: /challenge coding Beginner
   • Example: /challenge algorithm Advanced

Available Categories: ${this.categories.join(', ')}
Difficulty Levels: ${this.difficultyLevels.join(', ')}
    `;
  }

  generateChallenge(category = null, difficulty = null) {
    try {
      if (category && !this.categories.includes(category)) {
        throw new Error(`Invalid category! Available categories are: ${this.categories.join(', ')}`);
      }

      if (difficulty && !this.difficultyLevels.includes(difficulty)) {
        throw new Error(`Invalid difficulty! Available levels are: ${this.difficultyLevels.join(', ')}`);
      }

      const selectedCategory = category || 
        this.categories[crypto.randomInt(0, this.categories.length)];

      let challengeList = this.challenges[selectedCategory];

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
🎯 NEW CHALLENGE GENERATED!

🌟 Challenge: ${challenge.title}
🏷️ Category: ${challenge.category.toUpperCase()}
📊 Difficulty: ${challenge.difficulty}

📝 Description:
${challenge.description}

⏱️ Time Limit: ${challenge.timeLimit}

${challenge.languages ? 
  `💻 Recommended Languages: ${challenge.languages.join(', ')}` : 
  `🎨 Required Skills: ${challenge.skills?.join(', ') || challenge.tools?.join(', ')}`}

🆔 Challenge ID: <code>${challenge.id}</code>

💡 Tip: Break down the problem into smaller steps and test your solution with various inputs!
    `;
  }

  generateMultipleChallenges(count = 3, difficulty = null) {
    try {
      if (count > this.categories.length) {
        throw new Error(`Can only generate up to ${this.categories.length} different challenges at once!`);
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

