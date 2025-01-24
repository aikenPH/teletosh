module.exports = {
  name: 'minesweeper',
  description: 'Play a game of Minesweeper',
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id;
    const size = 5;
    const mines = 5;

    const board = Array(size).fill().map(() => Array(size).fill('🟦'));
    const minePositions = [];

    // Place mines
    for (let i = 0; i < mines; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
      } while (minePositions.some(pos => pos.x === x && pos.y === y));
      minePositions.push({x, y});
    }

    const getAdjacentMines = (x, y) => {
      let count = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
            if (minePositions.some(pos => pos.x === nx && pos.y === ny)) {
              count++;
            }
          }
        }
      }
      return count;
    };

    const revealCell = (x, y) => {
      if (minePositions.some(pos => pos.x === x && pos.y === y)) {
        board[y][x] = '💥';
        return false;
      } else {
        const count = getAdjacentMines(x, y);
        board[y][x] = count > 0 ? count.toString() : '⬜';
        return true;
      }
    };

    const displayBoard = () => {
      return board.map(row => row.join('')).join('\n');
    };

    const gameMessage = await bot.sendMessage(chatId, displayBoard());

    const listener = bot.onText(/^(\d+),(\d+)$/, async (msg, match) => {
      if (msg.chat.id !== chatId) return;

      const x = Number.parseInt(match[1]);
      const y = Number.parseInt(match[2]);

      if (x < 0 || x >= size || y < 0 || y >= size) {
        await bot.sendMessage(chatId, 'Invalid coordinates. Try again.');
        return;
      }

      if (board[y][x] !== '🟦') {
        await bot.sendMessage(chatId, 'This cell has already been revealed. Try again.');
        return;
      }

      if (revealCell(x, y)) {
        await bot.editMessageText(displayBoard(), {
          chat_id: chatId,
          message_id: gameMessage.message_id
        });

        if (board.every(row => row.every(cell => cell !== '🟦' || minePositions.some(pos => pos.x === x && pos.y === y)))) {
          bot.removeListener('text', listener);
          await bot.sendMessage(chatId, 'Congratulations! You\'ve cleared all the safe cells!');
        }
      } else {
        bot.removeListener('text', listener);
        await bot.editMessageText(displayBoard(), {
          chat_id: chatId,
          message_id: gameMessage.message_id
        });
        await bot.sendMessage(chatId, 'Game over! You hit a mine!');
      }
    });

    await bot.sendMessage(chatId, 'Enter coordinates to reveal a cell (e.g., "2,3")');
  }
};
