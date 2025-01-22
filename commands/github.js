const { createCanvas, loadImage, registerFont } = require('canvas');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

class GitHubVisualizer {
  constructor() {
    this.colors = {
      background: '#0d1117',
      text: '#c9d1d9',
      accent: '#58a6ff',
      secondary: '#8b949e',
      success: '#2ea043',
      border: '#30363d'
    };
  }

  async fetchGitHubData(username) {
    try {
      const userResponse = await axios.get(`https://api.github.com/users/${username}`);
      const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos`);
      const contributionsResponse = await axios.get(
        `https://github-contributions-api.deno.dev/${username}.json`
      );

      return {
        user: userResponse.data,
        repos: reposResponse.data,
        contributions: contributionsResponse.data
      };
    } catch (error) {
      throw new Error(`Failed to fetch GitHub data: ${error.message}`);
    }
  }

  async generateProfileImage(data) {
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = this.colors.background;
    ctx.fillRect(0, 0, width, height);

    // Add decorative grid pattern
    this.drawGridPattern(ctx, width, height);

    // Draw user info section
    await this.drawUserInfo(ctx, data.user, 40, 40);

    // Draw statistics
    this.drawStatistics(ctx, data.user, data.repos, 40, 220);

    // Draw contribution graph
    this.drawContributionGraph(ctx, data.contributions, 40, 340);

    // Draw top languages
    await this.drawTopLanguages(ctx, data.repos, 40, 480);

    // Add GitHub logo watermark
    await this.drawGitHubLogo(ctx, width - 60, height - 60);

    return canvas.toBuffer('image/png');
  }

  drawGridPattern(ctx, width, height) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = this.colors.border;
    
    const gridSize = 30;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  async drawUserInfo(ctx, user, x, y) {
    // Draw avatar
    const avatarSize = 120;
    const avatar = await loadImage(user.avatar_url);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + avatarSize/2, y + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, x, y, avatarSize, avatarSize);
    ctx.restore();

    // Draw name and username
    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 32px Inter';
    ctx.fillText(user.name || user.login, x + avatarSize + 20, y + 40);
    
    ctx.fillStyle = this.colors.secondary;
    ctx.font = '20px Inter';
    ctx.fillText(`@${user.login}`, x + avatarSize + 20, y + 70);

    // Draw bio
    if (user.bio) {
      ctx.fillStyle = this.colors.text;
      ctx.font = '16px Inter';
      const bioLines = this.wrapText(ctx, user.bio, 600, 16);
      bioLines.forEach((line, index) => {
        ctx.fillText(line, x + avatarSize + 20, y + 100 + (index * 20));
      });
    }
  }

  drawStatistics(ctx, user, repos, x, y) {
    const stats = [
      { label: 'Repositories', value: user.public_repos },
      { label: 'Followers', value: user.followers },
      { label: 'Following', value: user.following },
      { label: 'Stars', value: repos.reduce((acc, repo) => acc + repo.stargazers_count, 0) }
    ];

    const boxWidth = 270;
    const boxHeight = 80;
    const gap = 20;

    stats.forEach((stat, index) => {
      const boxX = x + (index * (boxWidth + gap));
      
      // Draw box
      ctx.fillStyle = '#161b22';
      ctx.strokeStyle = this.colors.border;
      ctx.lineWidth = 1;
      this.drawRoundedRect(ctx, boxX, y, boxWidth, boxHeight, 8);
      ctx.stroke();
      ctx.fill();

      // Draw stat value
      ctx.fillStyle = this.colors.text;
      ctx.font = 'bold 28px Inter';
      ctx.fillText(stat.value.toLocaleString(), boxX + 20, y + 35);

      // Draw label
      ctx.fillStyle = this.colors.secondary;
      ctx.font = '16px Inter';
      ctx.fillText(stat.label, boxX + 20, y + 60);
    });
  }

  drawContributionGraph(ctx, contributions, x, y) {
    const title = 'Contributions';
    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 20px Inter';
    ctx.fillText(title, x, y - 10);

    const weeks = contributions.contributions.slice(-52);
    const cellSize = 10;
    const cellGap = 2;
    const rows = 7;

    weeks.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        const cellX = x + (weekIndex * (cellSize + cellGap));
        const cellY = y + (dayIndex * (cellSize + cellGap));
        
        // Calculate color based on contribution count
        const intensity = Math.min(day.count / 10, 1);
        const color = this.interpolateColor('#0e4429', '#39d353', intensity);
        
        ctx.fillStyle = day.count > 0 ? color : '#161b22';
        this.drawRoundedRect(ctx, cellX, cellY, cellSize, cellSize, 2);
        ctx.fill();
      });
    });
  }

  async drawTopLanguages(ctx, repos, x, y) {
    const languages = {};
    let totalSize = 0;

    // Calculate language usage
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + repo.size;
        totalSize += repo.size;
      }
    });

    const sortedLanguages = Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const title = 'Top Languages';
    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 20px Inter';
    ctx.fillText(title, x, y - 10);

    const barWidth = 1000;
    const barHeight = 20;
    let currentX = x;

    sortedLanguages.forEach(([language, size], index) => {
      const percentage = (size / totalSize) * 100;
      const width = (barWidth * size) / totalSize;

      // Draw language bar
      ctx.fillStyle = this.getLanguageColor(language);
      this.drawRoundedRect(ctx, currentX, y, width, barHeight, index === 0 ? 4 : 0);
      ctx.fill();

      // Draw language label
      if (percentage >= 5) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter';
        ctx.fillText(`${language} ${percentage.toFixed(1)}%`, currentX + 5, y + 14);
      }

      currentX += width;
    });
  }

  async drawGitHubLogo(ctx, x, y) {
    ctx.fillStyle = this.colors.secondary;
    ctx.font = '14px Inter';
    ctx.textAlign = 'right';
    ctx.fillText('Generated with GitHub API', x, y);
  }

  // Utility functions
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
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

  interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  getLanguageColor(language) {
    const colors = {
      JavaScript: '#f1e05a',
      Python: '#3572A5',
      Java: '#b07219',
      TypeScript: '#2b7489',
      Ruby: '#701516',
      Go: '#00ADD8',
      Rust: '#dea584',
      C: '#555555',
      'C++': '#f34b7d',
      'C#': '#178600',
      PHP: '#4F5D95',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
      default: '#8b949e'
    };
    return colors[language] || colors.default;
  }

  getUsageInstructions() {
    return `
📊 <b>GitHub Profile Visualizer</b> 📊

Generate a beautiful visualization of any GitHub profile!

Usage:
/github [username]

Example:
<code>/github torvalds</code>

The visualization includes:
• Profile information
• Repository statistics
• Contribution graph
• Top programming languages
• And more!

Try it now with your GitHub username! 🚀`;
  }
}

module.exports = {
  name: 'github',
  description: 'Generate GitHub profile visualization',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const visualizer = new GitHubVisualizer();

    try {
      if (args.length === 0) {
        await bot.sendMessage(chatId, visualizer.getUsageInstructions(), {
          parse_mode: 'HTML'
        });
        return;
      }

      const username = args[0];
      await bot.sendMessage(chatId, `🔍 Fetching GitHub data for @${username}...`);
      
      const data = await visualizer.fetchGitHubData(username);
      await bot.sendChatAction(chatId, 'upload_photo');
      
      const profileImage = await visualizer.generateProfileImage(data);

      await bot.sendPhoto(chatId, profileImage, {
        caption: `🎨 GitHub Profile Visualization for @${username}\nGenerated on ${new Date().toLocaleDateString()}`,
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('GitHub Visualization Error:', error);
      const errorMessage = `⚠️ Error: ${error.message}\n\n${visualizer.getUsageInstructions()}`;
      
      await bot.sendMessage(chatId, errorMessage, {
        parse_mode: 'HTML'
      });
    }
  }
};
