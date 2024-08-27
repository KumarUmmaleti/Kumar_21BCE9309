const http = require('http');
const WebSocket = require('ws');
const GameState = require('./gamelogic'); // Import the game logic

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let gameState = new GameState(); // Initialize the game state

// Track connected clients
const clients = {};

wss.on('connection', (ws) => {
    console.log('New player connected');

    // Assign a unique ID to the new client
    const clientId = generateUniqueId();
    clients[clientId] = ws;

    // Send the initial game state to the new client
    ws.send(JSON.stringify({
        type: 'init',
        gameState: gameState
    }));

    // Handle incoming messages from clients
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'move') {
            const { playerId, character, direction } = data;

            // Process the move using the game logic
            const result = gameState.move(playerId, character, direction);

            if (result.error) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: result.error
                }));
            } else {
                // Broadcast the updated game state to all connected clients
                Object.values(clients).forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'update',
                            gameState: gameState
                        }));
                    }
                });

                // If the game is over, notify all clients
                if (result.gameOver) {
                    Object.values(clients).forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'gameOver',
                                winner: result.winner
                            }));
                        }
                    });

                    // Optionally, reset the game for a new match
                    // gameState = new GameState(); // Uncomment to reset the game
                }
            }
        }
    });

    // Handle client disconnections
    ws.on('close', () => {
        console.log('Player disconnected');
        // Clean up the disconnected client
        delete clients[clientId];
    });
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});

// Helper function to generate unique IDs for clients
function generateUniqueId() {
    return 'xxxx-xxxx-4xxx-yxxx-xxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
