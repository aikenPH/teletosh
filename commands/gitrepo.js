const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'gitrepo',
    description: 'Search and download GitHub repositories',
    async execute(bot, msg, args) {
        if (args.length < 1) {
            return bot.sendMessage(msg.chat.id, '❌ Usage:\n/gitrepo <search term>\n/gitrepo <username>/<repository>');
        }

        const input = args.join(' ');
        const chatId = msg.chat.id;

        try {
            // Show "typing" status while processing
            await bot.sendChatAction(chatId, 'typing');

            let repositories = [];
            let isSpecificRepo = false;

            // Check if input is in username/repository format
            if (input.includes('/')) {
                isSpecificRepo = true;
                const [username, repository] = input.split('/');
                try {
                    const repo = await getSpecificRepository(username, repository);
                    repositories = [repo];
                } catch (error) {
                    if (error.response?.status === 404) {
                        // If specific repo not found, try searching instead
                        repositories = await searchRepositories(input);
                        isSpecificRepo = false;
                    } else {
                        throw error;
                    }
                }
            } else {
                repositories = await searchRepositories(input);
            }

            if (repositories.length === 0) {
                // Try a broader search if no results found
                repositories = await searchRepositories(input.split(' ')[0]);
            }

            if (repositories.length === 0) {
                return bot.sendMessage(chatId, '🔍 No repositories found. Please try different keywords.');
            }

            // For specific repo search, just show that repo
            // For keyword search, show up to 5 results
            const displayRepos = isSpecificRepo ? repositories : repositories.slice(0, 5);

            for (const repo of displayRepos) {
                const message = formatRepoMessage(repo, isSpecificRepo);
                
                // Send repository information with download button
                const keyboard = {
                    inline_keyboard: [
                        [
                            {
                                text: '⬇️ Download ZIP',
                                callback_data: `download_${repo.full_name}`
                            },
                            {
                                text: '🔗 View on GitHub',
                                url: repo.html_url
                            }
                        ]
                    ]
                };

                await bot.sendMessage(chatId, message, {
                    parse_mode: 'HTML',
                    reply_markup: keyboard,
                    disable_web_page_preview: true
                });
            }

            if (!isSpecificRepo && repositories.length > 5) {
                await bot.sendMessage(
                    chatId,
                    `🔍 Showing top 5 results out of ${repositories.length} repositories found.\nFor more specific results, try:\n- Adding more keywords\n- Using username/repository format`
                );
            }

        } catch (error) {
            console.error('GitHub Repository Error:', error);
            handleError(bot, chatId, error);
        }
    },

    // Handle callback for download button
    async handleCallback(bot, callbackQuery) {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;

        if (callbackQuery.data.startsWith('download_')) {
            const fullName = callbackQuery.data.replace('download_', '');
            
            try {
                await bot.sendChatAction(chatId, 'upload_document');
                await bot.editMessageReplyMarkup(
                    {
                        inline_keyboard: [[{ text: '⏳ Downloading...', callback_data: 'downloading' }]]
                    },
                    {
                        chat_id: chatId,
                        message_id: messageId
                    }
                );

                const zipFilePath = await downloadRepository(fullName);
                
                await bot.sendDocument(chatId, zipFilePath, {
                    caption: `📦 Repository: ${fullName}\n\nDownloaded successfully!`
                });

                // Restore original keyboard
                await bot.editMessageReplyMarkup(
                    {
                        inline_keyboard: [
                            [
                                {
                                    text: '⬇️ Download ZIP',
                                    callback_data: `download_${fullName}`
                                },
                                {
                                    text: '🔗 View on GitHub',
                                    url: `https://github.com/${fullName}`
                                }
                            ]
                        ]
                    },
                    {
                        chat_id: chatId,
                        message_id: messageId
                    }
                );

                fs.unlinkSync(zipFilePath);
            } catch (error) {
                console.error('Download Error:', error);
                handleError(bot, chatId, error);
                
                // Restore original keyboard on error
                await bot.editMessageReplyMarkup(
                    {
                        inline_keyboard: [
                            [
                                {
                                    text: '⬇️ Download ZIP',
                                    callback_data: `download_${fullName}`
                                },
                                {
                                    text: '🔗 View on GitHub',
                                    url: `https://github.com/${fullName}`
                                }
                            ]
                        ]
                    },
                    {
                        chat_id: chatId,
                        message_id: messageId
                    }
                );
            }
        }
    }
};

function formatRepoMessage(repo, isSpecificRepo) {
    const created = new Date(repo.created_at).toLocaleDateString();
    const updated = new Date(repo.updated_at).toLocaleDateString();
    
    let message = `
<b>📚 Repository Details</b>
<b>Name:</b> ${escapeHtml(repo.full_name)}
<b>Description:</b> ${escapeHtml(repo.description || 'No description')}
<b>⭐ Stars:</b> ${repo.stargazers_count.toLocaleString()}
<b>👁 Watchers:</b> ${repo.watchers_count.toLocaleString()}
<b>🔄 Forks:</b> ${repo.forks_count.toLocaleString()}
<b>💻 Language:</b> ${escapeHtml(repo.language || 'Not specified')}
<b>📅 Created:</b> ${created}
<b>🔄 Last Updated:</b> ${updated}
    `.trim();

    if (isSpecificRepo) {
        message += `\n<b>📦 Size:</b> ${(repo.size / 1024).toFixed(2)} MB
<b>🔍 Open Issues:</b> ${repo.open_issues_count}
<b>📋 License:</b> ${repo.license ? escapeHtml(repo.license.name) : 'Not specified'}`;
    }

    return message;
}

async function searchRepositories(query) {
    try {
        const response = await axios.get('https://api.github.com/search/repositories', {
            params: {
                q: query,
                sort: 'stars',
                order: 'desc',
                per_page: 100 // Get more results to ensure we have alternatives
            },
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-Repository-Bot'
            }
        });

        return response.data.items;
    } catch (error) {
        console.error('Repository Search Error:', error);
        throw error;
    }
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
                errorMessage = '❌ Repository not found. Please check the username and repository name.';
                break;
            case 403:
                errorMessage = '❌ Rate limit exceeded. Please try again later.';
                break;
            case 401:
                errorMessage = '❌ Authentication failed. Please check the bot configuration.';
                break;
            default:
                errorMessage = `❌ Server error (${error.response.status}). Please try again later.`;
        }
    } else if (error.request) {
        errorMessage = '❌ Network error. Please check your connection and try again.';
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
