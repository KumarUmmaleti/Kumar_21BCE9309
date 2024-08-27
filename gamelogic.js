class GameState {
    constructor() {
        this.board = this.initializeBoard();
        this.currentTurn = 'A'; // Player A starts first
        this.players = {
            'A': ['PA1', 'HA1', 'HA2'],
            'B': ['PB1', 'HB1', 'HB2']
        };
        this.moveHistory = [];
    }

    initializeBoard() {
        const board = Array.from({ length: 5 }, () => Array(5).fill(null));

        // Positioning Player A's characters
        board[4][0] = 'PA1'; // Pawn
        board[4][1] = 'HA1'; // Hero1
        board[4][2] = 'HA2'; // Hero2

        // Positioning Player B's characters
        board[0][0] = 'PB1'; // Pawn
        board[0][1] = 'HB1'; // Hero1
        board[0][2] = 'HB2'; // Hero2

        return board;
    }

    move(playerId, character, direction) {
        if (playerId !== this.currentTurn) {
            return { error: `It's not player ${playerId}'s turn.` };
        }

        if (!this.players[playerId].includes(character)) {
            return { error: `Character ${character} does not belong to player ${playerId}.` };
        }

        const pos = this.findCharacterPosition(character);
        if (!pos) {
            return { error: `Character ${character} not found on the board.` };
        }

        const [row, col] = pos;
        let newRow = row;
        let newCol = col;

        switch (direction) {
            case 'L': newCol--; break;
            case 'R': newCol++; break;
            case 'F': newRow = playerId === 'A' ? row - 1 : row + 1; break;
            case 'B': newRow = playerId === 'A' ? row + 1 : row - 1; break;
            case 'FL': newRow = playerId === 'A' ? row - 1 : row + 1; newCol--; break;
            case 'FR': newRow = playerId === 'A' ? row - 1 : row + 1; newCol++; break;
            case 'BL': newRow = playerId === 'A' ? row + 1 : row - 1; newCol--; break;
            case 'BR': newRow = playerId === 'A' ? row + 1 : row - 1; newCol++; break;
            default: return { error: `Invalid direction: ${direction}` };
        }

        if (!this.isValidMove(newRow, newCol)) {
            return { error: 'Invalid move. Out of bounds.' };
        }

        if (!this.isValidCharacterMove(character, direction, row, col, newRow, newCol)) {
            return { error: `Invalid move for character ${character} in direction ${direction}.` };
        }

        const target = this.board[newRow][newCol];
        if (target && target.charAt(1) !== playerId) {
            this.captureCharacter(newRow, newCol);
        }

        this.board[row][col] = null;
        this.board[newRow][newCol] = character;

        this.moveHistory.push(`${playerId}'s ${character} moved ${direction}`);
        this.switchTurn();

        if (this.isGameOver()) {
            return { gameOver: true, winner: this.currentTurn === 'A' ? 'B' : 'A' };
        }

        return { success: true, gameState: this };
    }

    isValidCharacterMove(character, direction, row, col, newRow, newCol) {
        const charType = character.substring(0, 2);
        const directionMap = {
            'PA': ['L', 'R', 'F', 'B'],
            'HA': ['L', 'R', 'F', 'B'],
            'HB': ['L', 'R', 'F', 'B'],
            'H2': ['FL', 'FR', 'BL', 'BR']
        };

        if (!directionMap[charType].includes(direction)) {
            return false;
        }

        if (charType === 'HA' || charType === 'HB') {
            if (direction === 'F' || direction === 'B') {
                const step = direction === 'F' ? -2 : 2;
                if (newRow !== row + step || col !== newCol) return false;
            }
        }

        if (charType === 'H2') {
            if (Math.abs(newRow - row) !== 2 || Math.abs(newCol - col) !== 2) return false;
        }

        return true;
    }

    findCharacterPosition(character) {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (this.board[row][col] === character) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    isValidMove(row, col) {
        return row >= 0 && row < 5 && col >= 0 && col < 5;
    }

    captureCharacter(row, col) {
        this.board[row][col] = null;
    }

    switchTurn() {
        this.currentTurn = this.currentTurn === 'A' ? 'B' : 'A';
    }

    isGameOver() {
        const remainingA = this.players['A'].some(char => this.findCharacterPosition(char) !== null);
        const remainingB = this.players['B'].some(char => this.findCharacterPosition(char) !== null);

        return !remainingA || !remainingB;
    }
}

module.exports = GameState;
