const crypto = require('crypto');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

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
          title: "Palindrome Checker",
          difficulty: "Intermediate",
          description: "Create a function that checks if a given string is a palindrome.",
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
          description: "Implement a complete binary tree with insertion, deletion, and traversal.",
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

  async generateCoverImage(challenge) {
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add pattern overlay
    ctx.save();
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < width; i += 30) {
      for (let j = 0; j < height; j += 30) {
        ctx.beginPath();
        ctx.arc(i, j, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }
    ctx.restore();

    // Difficulty badge colors
    const difficultyColors = {
      'Beginner': '#22c55e',
      'Intermediate': '#eab308',
      'Advanced': '#ef4444'
    };

    // Draw difficulty badge
    ctx.fillStyle = difficultyColors[challenge.difficulty];
    ctx.beginPath();
    ctx.roundRect(40, 40, 140, 40, 20);
    ctx.fill();

    // Badge text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(challenge.difficulty, 110, 65);

    // Category
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px Inter';
    ctx.fillText(challenge.category.toUpperCase(), 200, 65);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Inter';
    const titleLines = this.wrapText(ctx, challenge.title, width - 80, 48);
    let titleY = 140;
    titleLines.forEach(line => {
      ctx.fillText(line, 40, titleY);
      titleY += 60;
    });

    // Description
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px Inter';
    const descriptionLines = this.wrapText(ctx, challenge.description, width - 80, 24);
    let descY = titleY + 40;
    descriptionLines.forEach(line => {
      ctx.fillText(line, 40, descY);
      descY += 35;
    });

    // Bottom bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, height - 80, width, 80);

    // Challenge icon
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(40, height - 60, 40, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('🎯', 60, height - 32);

    // Challenge text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px Inter';
    ctx.fillText('Challenge', 90, height - 32);

    // Lumina credits
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.font = '18px Inter';
    ctx.fillText('Generated by Lumina', width - 40, height - 32);

    // Return as buffer
    return canvas.toBuffer('image/png');
  }

  wrapText(ctx, text, maxWidth, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  getUsageInstructions() {
    return `
📚 <b>Challenge Guide</b> 📚

1️⃣ <b>Category-Specific Challenge:</b>
   /challenge [category]
   • Example: <code>/challenge coding</code>
   • Example: <code>/challenge algorithm</code>
   • Example: <code>/challenge design</code>

2️⃣ <b>Difficulty-Specific Challenge:</b>
   /challenge [difficulty]
   • Example: <code>/challenge Beginner</code>
   • Example: <code>/challenge Intermediate</code>
   • Example: <code>/challenge Advanced</code>

3️⃣ <b>Category and Difficulty:</b>
   /challenge [category] [difficulty]
   • Example: <code>/challenge coding Beginner</code>
   • Example: <code>/challenge algorithm Advanced</code>

<b>Available Categories:</b> ${this.categories.join(', ')}
<b>Difficulty Levels:</b> ${this.difficultyLevels.join(', ')}`;
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
🎯 CHALLENGE

🌟 Title: ${challenge.title}
🏷️ Category: ${challenge.category.toUpperCase()}
📊 Difficulty: ${challenge.difficulty}

📝 Description:
${challenge.description}

⏱️ Time Limit: ${challenge.timeLimit}

${challenge.languages ? 
  `💻 Recommended Languages: ${challenge.languages.join(', ')}` : 
  `🎨 Required Skills: ${challenge.skills?.join(', ')}`}

🆔 Challenge ID: <code>${challenge.id}</code>

💡 Tip: Break down the problem into smaller steps and test your solution thoroughly!`;
  }
}

// Register fonts for canvas
const registerFonts = () => {
  const fontsDir = path.join(__dirname, 'fonts');
  if (fs.existsSync(fontsDir)) {
    registerFont(path.join(fontsDir, 'Inter-Regular.ttf'), { family: 'Inter' });
    registerFont(path.join(fontsDir, 'Inter-Bold.ttf'), { family: 'Inter', weight: 'bold' });
  }
};

module.exports = {
  name: 'challenge',
  description: 'Generate coding, algorithm, and design challenges',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const challengeGenerator = new ChallengeGenerator();

    try {
      await bot.sendChatAction(chatId, 'upload_photo');

      // Register fonts if not already registered
      registerFonts();

      if (args.length === 0) {
        await bot.sendMessage(chatId, challengeGenerator.getUsageInstructions(), {
          parse_mode: 'HTML'
        });
        return;
      }

      let category = null;
      let difficulty = null;

      if (args.length > 0) {
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
      
      // Generate cover image
      const coverImage = await challengeGenerator.generateCoverImage(challenge);

      // Send cover image with challenge details
      await bot.sendPhoto(chatId, coverImage, {
        caption: challengeMessage,
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Challenge Generation Error:', error);
      const errorMessage = `⚠️ Error: ${error.message}\n\n${challengeGenerator.getUsageInstructions()}`;
      
      await bot.sendMessage(chatId, errorMessage, {
        parse_mode: 'HTML'
      });
    }
  }
};
