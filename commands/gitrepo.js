const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'gitrepo',
    description: 'Search and download GitHub repository',
    async execute(bot, msg, args) {
        if (args.length < 1) {
            return bot.sendMessage(msg.chat.id, '❌ Usage:\n/gitrepo <username>/<repository>');
        }

        const input = args.join(' ');
        const chatId = msg.chat.id;

        try {
            await bot.sendChatAction(chatId, 'typing');

            let repository;
            const [username, repoName] = input.split('/');

            if (!repoName) {
                return bot.sendMessage(chatId, '❌ Kindly ensure to use the format: "username/repository."');
            }

            try {
                repository = await getSpecificRepository(username, repoName);
            } catch (error) {
                return bot.sendMessage(chatId, '❌ The repository could not be found. Please verify the username and repository name for accuracy.');
            }

            const message = formatRepoMessage(repository);
            
            await bot.sendMessage(chatId, message, {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });

            // Download and send repository
            await bot.sendChatAction(chatId, 'upload_document');
            const zipFilePath = await downloadRepository(`${username}/${repoName}`);
            
            await bot.sendDocument(chatId, zipFilePath, {
                caption: `📦 Repository: ${username}/${repoName}\n🔗 GitHub: https://github.com/${username}/${repoName}`
            });

            // Clean up temporary zip file
            fs.unlinkSync(zipFilePath);

        } catch (error) {
            console.error('GitHub Repository Error:', error);
            handleError(bot, chatId, error);
        }
    }
};

function formatRepoMessage(repo) {
    const created = new Date(repo.created_at).toLocaleDateString();
    const updated = new Date(repo.updated_at).toLocaleDateString();
    
    return `
<b>📚 Repository Details</b>
<b>Name:</b> ${escapeHtml(repo.full_name)}
<b>Description:</b> ${escapeHtml(repo.description || 'No description')}
<b>⭐ Stars:</b> ${repo.stargazers_count.toLocaleString()}
<b>👁 Watchers:</b> ${repo.watchers_count.toLocaleString()}
<b>🔄 Forks:</b> ${repo.forks_count.toLocaleString()}
<b>💻 Language:</b> ${escapeHtml(repo.language || 'Not specified')}
<b>📅 Created:</b> ${created}
<b>🔄 Last Updated:</b> ${updated}
<b>📦 Size:</b> ${(repo.size / 1024).toFixed(2)} MB
<b>🔍 Open Issues:</b> ${repo.open_issues_count}
<b>📋 License:</b> ${repo.license ? escapeHtml(repo.license.name) : 'Not specified'}
    `.trim();
}

async function getSpecificRepository(username, repository) {
    const response = await axios.get(`https://api.github.com/repos/${username}/${repository}`, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Repository-Bot'
        }
    });

    return response.data;
}

async function downloadRepository(fullName) {
    const response = await axios({
        method: 'get',
        url: `https://api.github.com/repos/${fullName}/zipball`,
        responseType: 'arraybuffer',
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Repository-Bot'
        }
    });

    const fileName = `${fullName.replace('/', '_')}.zip`;
    const filePath = path.join(__dirname, fileName);
    
    fs.writeFileSync(filePath, response.data);
    return filePath;
}

function handleError(bot, chatId, error) {
    let errorMessage = '❌ An unexpected error occurred.';
    
    if (error.response) {
        switch (error.response.status) {
            case 404:
                errorMessage = '❌ Repository not found.';
                break;
            case 403:
                errorMessage = '❌ Rate limit exceeded. Try again later.';
                break;
            default:
                errorMessage = `❌ Server error (${error.response.status}).`;
        }
    }

    bot.sendMessage(chatId, errorMessage);
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
