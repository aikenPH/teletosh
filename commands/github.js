const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

class LuminaGitHubVisualizer {
  constructor() {
    this.colors = {
      background: '#0d1117',
      text: '#e6edf3',
      accent: '#58a6ff',
      secondary: '#8b949e',
      success: '#2ea043',
      border: '#30363d',
      cardBg: '#161b22',
      gradient: {
        start: '#1f6feb',
        end: '#238636'
      }
    };
  }

  async fetchGitHubData(username) {
    try {
      const [userResponse, reposResponse, eventsResponse] = await Promise.all([
        axios.get(`https://api.github.com/users/${username}`),
        axios.get(`https://api.github.com/users/${username}/repos`),
        axios.get(`https://api.github.com/users/${username}/events/public`)
      ]);

      return {
        user: userResponse.data,
        repos: reposResponse.data,
        events: eventsResponse.data
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

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, this.colors.background);
    gradient.addColorStop(1, '#161b22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    this.drawHexagonPattern(ctx, width, height);

    await this.drawUserInfo(ctx, data.user, 50, 40);
    this.drawStatistics(ctx, data.user, data.repos, 50, 220);
    this.drawActivityGraph(ctx, data.events, 50, 340);
    await this.drawLanguageCards(ctx, data.repos, 50, 480);

    this.drawDecorations(ctx, width, height);
    await this.drawBrandingFooter(ctx, width - 60, height - 30);

    return canvas.toBuffer();
  }

  drawHexagonPattern(ctx, width, height) {
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = this.colors.border;
    
    const size = 30;
    const h = size * Math.sqrt(3);
    
    for (let x = 0; x < width + size; x += size * 1.5) {
      for (let y = 0; y < height + h; y += h) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = 2 * Math.PI / 6 * i;
          const xPos = x + size * Math.cos(angle);
          const yPos = y + size * Math.sin(angle);
          if (i === 0) ctx.moveTo(xPos, yPos);
          else ctx.lineTo(xPos, yPos);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  async drawUserInfo(ctx, user, x, y) {
    const avatarSize = 130;
    const avatar = await loadImage(user.avatar_url);
    
    ctx.save();
    ctx.shadowColor = this.colors.accent;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x + avatarSize/2, y + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, x, y, avatarSize, avatarSize);
    ctx.restore();

    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 36px Arial';
    ctx.fillText(user.name || user.login, x + avatarSize + 30, y + 45);
    
    ctx.fillStyle = this.colors.accent;
    ctx.font = '22px Arial';
    ctx.fillText(`@${user.login}`, x + avatarSize + 30, y + 80);

    if (user.bio) {
      ctx.fillStyle = this.colors.secondary;
      ctx.font = '18px Arial';
      const bioLines = this.wrapText(ctx, user.bio, 650, 18);
      bioLines.forEach((line, index) => {
        ctx.fillText(line, x + avatarSize + 30, y + 115 + (index * 25));
      });
    }
  }

  drawActivityGraph(ctx, events, x, y) {
    const title = ' '; // recent activity
    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 24px Arial';
    ctx.fillText(title, x, y - 15);

    const graphWidth = 1100;
    const graphHeight = 100;
    const padding = 20;

    // graph background
    ctx.fillStyle = this.colors.cardBg;
    this.drawRoundedRect(ctx, x, y, graphWidth, graphHeight, 10);
    ctx.fill();

    // events data
    const activityData = this.processEvents(events);
    const maxActivity = Math.max(...Object.values(activityData));
    
    // activity bars
    Object.entries(activityData).forEach(([date, count], index) => {
      const barHeight = (count / maxActivity) * (graphHeight - padding * 2);
      const barWidth = (graphWidth - padding * 2) / Object.keys(activityData).length;
      const barX = x + padding + (index * barWidth);
      const barY = y + graphHeight - padding - barHeight;

      ctx.fillStyle = this.interpolateColor(
        this.colors.gradient.start,
        this.colors.gradient.end,
        count / maxActivity
      );
      this.drawRoundedRect(ctx, barX, barY, barWidth - 2, barHeight, 3);
      ctx.fill();
    });
  }

  processEvents(events) {
    const activity = {};
    const now = new Date();
    const days = 14; // last 14 days of activity

    // all days with 0
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      activity[date.toISOString().split('T')[0]] = 0;
    }

    // events
    events.forEach(event => {
      const date = event.created_at.split('T')[0];
      if (activity[date] !== undefined) {
        activity[date]++;
      }
    });

    return activity;
  }

  drawStatistics(ctx, user, repos, x, y) {
    const stats = [
      { label: 'Repositories', value: user.public_repos, icon: '♜' },
      { label: 'Followers', value: user.followers, icon: '♟' },
      { label: 'Following', value: user.following, icon: '▶' },
      { label: 'Stars', value: repos.reduce((acc, repo) => acc + repo.stargazers_count, 0), icon: '★' }
    ];

    const boxWidth = 260;
    const boxHeight = 90;
    const gap = 25;

    stats.forEach((stat, index) => {
      const boxX = x + (index * (boxWidth + gap));
      
      ctx.save();
      ctx.fillStyle = this.colors.cardBg;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      this.drawRoundedRect(ctx, boxX, y, boxWidth, boxHeight, 12);
      ctx.fill();
      
      const gradient = ctx.createLinearGradient(boxX, y, boxX + boxWidth, y + boxHeight);
      gradient.addColorStop(0, this.colors.gradient.start);
      gradient.addColorStop(1, this.colors.gradient.end);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = this.colors.text;
      ctx.font = 'bold 32px Arial';
      ctx.fillText(`${stat.icon} ${stat.value.toLocaleString()}`, boxX + 20, y + 40);

      ctx.fillStyle = this.colors.secondary;
      ctx.font = '18px Arial';
      ctx.fillText(stat.label, boxX + 20, y + 65);
    });
  }

  async drawLanguageCards(ctx, repos, x, y) {
    const languages = {};
    let totalSize = 0;

    if (Array.isArray(repos)) {
      repos.forEach(repo => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + repo.size;
          totalSize += repo.size;
        }
      });
    }

    const sortedLanguages = Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const title = ' '; // top Language
    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 24px Arial';
    ctx.fillText(title, x, y - 15);

    const cardWidth = 200;
    const cardHeight = 80;
    const cardGap = 20;

    sortedLanguages.forEach(([language, size], index) => {
      const cardX = x + (index * (cardWidth + cardGap));
      const percentage = (size / totalSize) * 100;

      ctx.save();
      ctx.fillStyle = this.colors.cardBg;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      this.drawRoundedRect(ctx, cardX, y, cardWidth, cardHeight, 10);
      ctx.fill();

      const indicatorHeight = 5;
      ctx.fillStyle = this.getLanguageColor(language);
      ctx.fillRect(cardX, y, cardWidth, indicatorHeight);

      ctx.fillStyle = this.colors.text;
      ctx.font = 'bold 20px Arial';
      ctx.fillText(language, cardX + 15, y + 35);

      ctx.fillStyle = this.colors.secondary;
      ctx.font = '16px Arial';
      ctx.fillText(`${percentage.toFixed(1)}%`, cardX + 15, y + 60);
      ctx.restore();
    });
  }

  drawDecorations(ctx, width, height) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = this.colors.accent;
    ctx.lineWidth = 2;
    
    const cornerSize = 40;
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(20, 20 + cornerSize);
    ctx.moveTo(20, 20);
    ctx.lineTo(20 + cornerSize, 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - 20, height - 20);
    ctx.lineTo(width - 20, height - 20 - cornerSize);
    ctx.moveTo(width - 20, height - 20);
    ctx.lineTo(width - 20 - cornerSize, height - 20);
    ctx.stroke();
    ctx.restore();
  }

  async drawBrandingFooter(ctx, x, y) {
    ctx.fillStyle = this.colors.secondary;
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('✢ Generated by Lumina', x, y);
  }

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
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Java: '#b07219',
      Ruby: '#701516',
      Go: '#00ADD8',
      Rust: '#dea584',
      C: '#555555',
      'C++': '#f34b7d',
      'C#': '#178600',
      PHP: '#4F5D95',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
      Vue: '#41b883',
      React: '#61dafb',
      HTML: '#e34c26',
      CSS: '#563d7c',
      default: '#8b949e'
    };
    return colors[language] || colors.default;
  }

  getUsageInstructions() {
    return `
🎨 <b>GitHub Profile Visualizer</b> 🎨

Create data visualizations of any GitHub profile!

Usage:
/github [username]

Example:
<code>/github torvalds</code>

Features:
• Gradient-based design
• Interactive stats cards
• Language visualization
• Activity timeline graph
• Animated glow effects
• Customized typography

✨ Give it a try with your GitHub username! ✨`;
  }
}

module.exports = {
  name: 'github',
  description: 'Generate GitHub profile visualization',
  
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const visualizer = new LuminaGitHubVisualizer();

    try {
      if (args.length === 0) {
        await bot.sendMessage(chatId, visualizer.getUsageInstructions(), {
          parse_mode: 'HTML'
        });
        return;
      }

      const username = args[0];
      await bot.sendMessage(chatId, `✨ Creating data visualization for https://github.com/${username}...`);
      
      const data = await visualizer.fetchGitHubData(username);
      await bot.sendChatAction(chatId, 'upload_photo');
      
      const profileImage = await visualizer.generateProfileImage(data);

      const imageBuffer = Buffer.from(profileImage);
      imageBuffer.filename = 'github_profile.png';

      await bot.sendPhoto(chatId, imageBuffer, {
        caption: `🎨 GitHub Profile Visualization for @${username}\n\nGenerated on ${new Date().toLocaleDateString()}\n\n✢ Generated by Lumina`,
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
