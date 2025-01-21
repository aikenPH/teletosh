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

  // Dynamic Badge Rendering Method
  const drawDynamicBadge = (text, x, y) => {
    // Set font for measurement
    ctx.font = '600 14px Inter';
    
    // Measure text width
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    
    // Define padding and styling
    const horizontalPadding = 20;
    const verticalPadding = 10;
    const minWidth = 100;
    const cornerRadius = 15;
    
    // Calculate badge dimensions
    const badgeWidth = Math.max(textWidth + (2 * horizontalPadding), minWidth);
    const badgeHeight = 30;
    
    // Difficulty badge colors with more vibrant gradient
    const difficultyColors = {
      'Beginner': {
        start: '#4ade80',     // green-400
        end: '#22c55e'         // green-500
      },
      'Intermediate': {
        start: '#facc15',     // yellow-400
        end: '#eab308'         // yellow-500
      },
      'Advanced': {
        start: '#f87171',     // red-400
        end: '#ef4444'         // red-500
      },
      'default': {
        start: '#9ca3af',     // gray-400
        end: '#6b7280'         // gray-500
      }
    };

    // Select badge color gradient
    const colorSet = difficultyColors[challenge.difficulty] || difficultyColors.default;
    const gradient = ctx.createLinearGradient(x, y, x + badgeWidth, y + badgeHeight);
    gradient.addColorStop(0, colorSet.start);
    gradient.addColorStop(1, colorSet.end);

    // Draw rounded rectangle badge with gradient
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, badgeWidth, badgeHeight, cornerRadius);
    ctx.fill();

    // Draw difficulty text
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 14px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + (badgeWidth / 2), y + (badgeHeight / 2));

    return { width: badgeWidth, height: badgeHeight };
  };

  // Background Gradient
  const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
  backgroundGradient.addColorStop(0, '#111827');   // dark blue-gray
  backgroundGradient.addColorStop(1, '#1f2937');   // slightly lighter
  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle Dot Background Pattern
  ctx.save();
  ctx.globalAlpha = 0.05;
  const dotGrid = (cols, rows, size) => {
    const gapX = width / cols;
    const gapY = height / rows;
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        ctx.beginPath();
        ctx.arc(gapX * i + gapX/2, gapY * j + gapY/2, size/2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }
  };
  dotGrid(20, 10, 6);
  ctx.restore();

  // Dynamic Badge Rendering
  const badge = drawDynamicBadge(challenge.difficulty, 40, 40);

  // Category Text (Positioned after badge)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px Inter';
  ctx.fillText(
    challenge.category.toUpperCase(), 
    40 + badge.width + 10, 
    60
  );

  // Title (Centered, Dynamic Sizing)
  ctx.fillStyle = '#ffffff';
  const titleFontSize = challenge.title.length > 30 ? 36 : 48;
  ctx.font = `bold ${titleFontSize}px Inter`;
  ctx.textAlign = 'center';
  
  const titleLines = this.wrapText(ctx, challenge.title, width - 160, titleFontSize);
  let titleY = height / 2 - (titleLines.length * (titleFontSize + 10) / 2);
  
  titleLines.forEach(line => {
    ctx.fillText(line, width / 2, titleY);
    titleY += titleFontSize + 10;
  });

  // Description (Centered, Responsive)
  ctx.fillStyle = '#d1d5db';
  const descFontSize = 22;
  ctx.font = `${descFontSize}px Inter`;
  ctx.textAlign = 'center';
  
  const descLines = this.wrapText(ctx, challenge.description, width - 160, descFontSize);
  let descY = titleY + 40;
  
  descLines.slice(0, 2).forEach(line => {
    ctx.fillText(line, width / 2, descY);
    descY += descFontSize + 8;
  });

  // Footer Elements (Simplified)
  const footerElements = [
    { icon: '✦', text: 'Challenge', align: 'left', x: 40, color: '#9ca3af' },
    { text: 'Generated by Lumina', align: 'right', x: width - 40, color: '#6b7280' }
  ];

  footerElements.forEach(element => {
    ctx.fillStyle = element.color;
    ctx.font = '12px Inter';
    ctx.textAlign = element.align;
    ctx.fillText(element.text, element.x, height - 34);
  });

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
    registerFont(path.join(fontsDir, 'Inter-SemiBold.ttf'), { family: 'Inter', weight: '600' });
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
