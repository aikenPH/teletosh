const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'gitrepo',
    description: 'Search and download GitHub repositories as ZIP files',
    async execute(bot, msg, args) {
        if (args.length < 1) {
            return bot.sendMessage(msg.chat.id, '❌ Please provide a search query. Usage: /githubdownload <query>');
        }

        const query = args.join(' ');
        const chatId = msg.chat.id;

        try {
            const results = await searchFiles(query);

            if (results.length === 0) {
                return bot.sendMessage(chatId, '🔍 No repositories found.');
            }

            // Display results and prompt for selection
            let resultMessage = 'Search Results:\n';
            results.forEach(repo => {
                resultMessage += `[${repo.id}] ${repo.name}\n`;
                resultMessage += `   Stars: ${repo.stars}\n`;
                resultMessage += `   Description: ${repo.description}\n\n`;
            });

            // Send the results to the user
            await bot.sendMessage(chatId, resultMessage);

            // For simplicity, we will just download the first repository
            const selectedRepo = results[0]; // Change this to allow user selection if needed
            const zipFilePath = await downloadRepository(selectedRepo.url, selectedRepo.name);

            // Send the ZIP file as an attachment
            const caption = `
<b>Repository Details</b>
<b>Name:</b> ${escapeHtml(selectedRepo.name)}
<b>Description:</b> ${escapeHtml(selectedRepo.description)}
<b>Stars:</b> ${selectedRepo.stars}
<i>Visit:</i> <a href="${selectedRepo.url}">GitHub Link</a>
            `.trim();

            await bot.sendDocument(chatId, zipFilePath, { caption: caption, parse_mode: 'HTML' });

            // Clean up the temporary file after sending
            fs.unlinkSync(zipFilePath);

        } catch (error) {
            console.error('GitHub Search Error:', error);
            bot.sendMessage(chatId, '❌ Unable to perform GitHub search.', { parse_mode: 'HTML' });
        }
    }
};

// Function to search files on GitHub
async function searchFiles(query) {
    try {
        const response = await axios.get('https://api.github.com/search/repositories', {
            params: {
                q: query,
                sort: 'stars',
                order: 'desc'
            }
        });

        return response.data.items.slice(0, 10).map((repo, index) => ({
            id: index + 1,
            name: repo.full_name,
            description: repo.description,
            stars: repo.stargazers_count,
            url: repo.clone_url
        }));
    } catch (error) {
        console.error('Error searching files:', error.message);
        return [];
    }
}

// Function to download repository as ZIP
async function downloadRepository(url, repoName) {
    try {
        const zipUrl = `${url}/archive/refs/heads/main.zip`; // Adjust if necessary for the default branch
        const response = await axios({
            method: 'get',
            url: zipUrl,
            responseType: 'arraybuffer'
        });

        const fileName = `${repoName.replace('/', '_')}.zip`;
        const filePath = path.join(__dirname, fileName);
        
        fs.writeFileSync(filePath, response.data);
        console.log(`Downloaded: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('Error downloading repository:', error.message);
        return null;
    }
}

// HTML escape function
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
