const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const currentPlayerElement = document.getElementById('currentPlayer');
const charactersElement = document.getElementById('characters');
const movesElement = document.getElementById('moves');
const historyListElement = document.getElementById('historyList');

// Initialize WebSocket connection
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
    console.log('Connected to server');
    statusElement.textContent = 'Connected to server. Waiting for game initialization...';
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'init':
            initializeBoard(data.gameState);
            currentPlayerElement.textContent = `Current Player: ${data.gameState.currentTurn}`;
            statusElement.textContent = 'Game started. Your turn!';
            updateCharacterSelection(data.gameState.players);
            break;
        case 'update':
            updateBoard(data.gameState);
            currentPlayerElement.textContent = `Current Player: ${data.gameState.currentTurn}`;
            updateMoveHistory(data.gameState.moveHistory);
            break;
        case 'error':
            statusElement.textContent = `Error: ${data.message}`;
            break;
        case 'gameOver':
            statusElement.textContent = `Game Over. Player ${data.winner} wins!`;
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
};

function updateCharacterSelection(players) {
    charactersElement.innerHTML = '';
    for (const playerId in players) {
        const chars = players[playerId];
        chars.forEach(character => {
            const charDiv = document.createElement('div');
            charDiv.textContent = character;
            charDiv.addEventListener('click', () => {
                updateMoveOptions(character);
            });
            charactersElement.appendChild(charDiv);
        });
    }
}

function updateMoveOptions(character) {
    movesElement.innerHTML = '';
    // Define possible moves for characters
    const moves = {
        'P': ['L', 'R', 'F', 'B'],
        'H': ['L', 'R', 'F', 'B'],
        'H2': ['FL', 'FR', 'BL', 'BR']
    };
    const charType = character.charAt(0);
    const availableMoves = moves[charType] || [];

    availableMoves.forEach(move => {
        const button = document.createElement('button');
        button.textContent = move;
        button.addEventListener('click', () => {
            sendMove(character, move);
        });
        movesElement.appendChild(button);
    });
}

function sendMove(character, move) {
    const moveCommand = {
        type: 'move',
        playerId: 'A', // Update with actual player ID logic
        character: character,
        move: move
    };
    ws.send(JSON.stringify(moveCommand));
}

function initializeBoard(gameState) {
    boardElement.innerHTML = ''; // Clear the board
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        boardElement.appendChild(cell);
    }
    updateBoard(gameState); // Render characters on the board initially
}

function updateBoard(gameState) {
    const cells = boardElement.children;
    for (let i = 0; i < cells.length; i++) {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const cell = cells[i];
        const char = gameState.board[row][col];

        if (char) {
            cell.textContent = char;
            cell.style.backgroundColor = '#555'; // Different background for occupied cells
        } else {
            cell.textContent = '';
            cell.style.backgroundColor = '#2a2a2a'; // Default background for empty cells
        }
    }
}

function updateMoveHistory(moveHistory) {
    historyListElement.innerHTML = '';
    moveHistory.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry;
        historyListElement.appendChild(li);
    });
}
