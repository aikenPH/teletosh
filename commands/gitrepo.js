const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'githubdownload',
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
                    return bot.sendMessage(chatId, '🔍 I am sorry, but I could not find any repositories matching your search. Please try a broader keyword or check the spelling.');
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

            // Clean up the temporary ZIP file
            fs.unlinkSync(zipFilePath);

        } catch (error) {
            console.error('GitHub Download Error:', error);
            
            // Detailed error handling
            if (error.response) {
                switch (error.response.status) {
                    case 404:
                        bot.sendMessage(chatId, '❌ I am sorry, but the repository you requested could not be found.');
                        break;
                    case 403:
                        bot.sendMessage(chatId, '❌ I have exceeded the GitHub API rate limit. Please try again later.');
                        break;
                    default:
                        bot.sendMessage(chatId, '❌ An error occurred while fetching the repository. Please try again.');
                }
            } else {
                bot.sendMessage(chatId, '❌ I encountered an unexpected error while processing your request.');
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
                per_page: 10 // Get up to 10 results
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
        const zipUrl = `https://github.com/${fullName}/archive/refs/heads/main.zip`; // Adjust if necessary for the default branch
        const response = await axios({
            method: 'get',
            url: zipUrl,
            responseType: 'arraybuffer'
        });

        const fileName = `${fullName.replace('/', '_')}.zip`;
        const filePath = path.join(__dirname, fileName);
        
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
