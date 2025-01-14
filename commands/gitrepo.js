const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'gitrepo',
    description: 'Download GitHub repository as ZIP',
    async execute(bot, msg, args) {
        if (args.length < 1) {
            return bot.sendMessage(msg.chat.id, '❌ Usage:\n/githubdownload <query>\n/githubdownload <username>/<repository>');
        }

        const input = args.join(' ');
        const chatId = msg.chat.id;

        try {
            let repoInfo;

            // Check if input is in username/repository format
            if (input.includes('/')) {
                const [username, repository] = input.split('/');
                repoInfo = await getSpecificRepository(username, repository);
            } else {
                // Search for repositories and get the first result
                const results = await searchRepositories(input);
                
                if (results.length === 0) {
                    return bot.sendMessage(chatId, '🔍 No repositories found.');
                }

                repoInfo = results[0];
            }

            // Download repository ZIP
            const zipFilePath = await downloadRepository(repoInfo.full_name);

            // Prepare caption with repository details
            const caption = `
<b>🔧 Repository Details</b>

<b>Name:</b> ${escapeHtml(repoInfo.full_name)}
<b>Description:</b> ${escapeHtml(repoInfo.description || 'No description')}
<b>Stars:</b> ${repoInfo.stargazers_count || 0}
<b>Language:</b> ${escapeHtml(repoInfo.language || 'Not specified')}
<b>Created:</b> ${new Date(repoInfo.created_at).toLocaleDateString()}

<i>Visit:</i> <a href="${repoInfo.html_url}">GitHub Repository</a>
            `.trim();

            // Send ZIP file as document
            await bot.sendDocument(chatId, zipFilePath, {
                caption: caption,
                parse_mode: 'HTML'
            });

            // Clean up temporary ZIP file
            fs.unlinkSync(zipFilePath);

        } catch (error) {
            console.error('GitHub Download Error:', error);
            
            // Detailed error handling
            if (error.response) {
                switch (error.response.status) {
                    case 404:
                        bot.sendMessage(chatId, '❌ Repository not found.');
                        break;
                    case 403:
                        bot.sendMessage(chatId, '❌ GitHub API rate limit exceeded.');
                        break;
                    default:
                        bot.sendMessage(chatId, '❌ An error occurred while fetching the repository.');
                }
            } else {
                bot.sendMessage(chatId, '❌ Unable to download repository.');
            }
        }
    }
};

// Search repositories
async function searchRepositories(query) {
    try {
        const response = await axios.get('https://api.github.com/search/repositories', {
            params: {
                q: query,
                sort: 'stars',
                order: 'desc',
                per_page: 1  // Only get the top result
            },
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        return response.data.items;
    } catch (error) {
        console.error('Repository Search Error:', error);
        return [];
    }
}

// Get specific repository details
async function getSpecificRepository(username, repository) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${username}/${repository}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Specific Repository Error:', error);
        throw error;
    }
}

// Download repository as ZIP
async function downloadRepository(fullName) {
    try {
        const zipUrl = `https://github.com/${fullName}/archive/refs/heads/main.zip`;
        
        const response = await axios({
            method: 'get',
            url: zipUrl,
            responseType: 'arraybuffer',
            headers: {
                'Accept': 'application/zip'
            }
        });

        // Generate unique filename
        const fileName = `${fullName.replace('/', '_')}_${Date.now()}.zip`;
        const filePath = path.join(__dirname, fileName);
        
        // Write ZIP file
        fs.writeFileSync(filePath, response.data);
        
        return filePath;
    } catch (error) {
        console.error('Repository Download Error:', error);
        throw error;
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
