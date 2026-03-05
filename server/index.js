// ============================================
// LAST RALLY - WebSocket Relay Server
// Architecture: P1 is host (runs physics).
// Server relays messages between room players.
// No game logic on server.
// ============================================

const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
});

const wss = new WebSocketServer({ server });
server.listen(PORT);

// rooms: code -> { players: [ws, ws?] }
const rooms = new Map();
const matchmakingQueue = [];

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function send(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}

function relay(ws, data) {
  if (!ws.roomCode) return;
  const room = rooms.get(ws.roomCode);
  if (!room) return;
  const raw = typeof data === 'string' ? data : JSON.stringify(data);
  room.players.forEach(p => {
    if (p !== ws && p.readyState === 1) p.send(raw);
  });
}

function leaveRoom(ws) {
  if (!ws.roomCode) return;
  const room = rooms.get(ws.roomCode);
  if (room) {
    room.players = room.players.filter(p => p !== ws);
    if (room.players.length === 0) {
      rooms.delete(ws.roomCode);
    } else {
      room.players.forEach(p => send(p, { type: 'opponentDisconnected' }));
    }
  }
  ws.roomCode = null;
  ws.playerId = null;
  ws.isReady = false;
}

wss.on('connection', (ws) => {
  ws.roomCode = null;
  ws.playerId = null;
  ws.isReady = false;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {
      case 'createRoom': {
        leaveRoom(ws);
        const code = randomCode();
        rooms.set(code, { players: [ws] });
        ws.roomCode = code;
        ws.playerId = 1;
        send(ws, { type: 'roomCreated', roomCode: code, playerId: 1 });
        break;
      }

      case 'joinRoom': {
        const code = (msg.roomCode || '').toUpperCase();
        const room = rooms.get(code);
        if (!room) { send(ws, { type: 'error', message: 'Room not found' }); break; }
        if (room.players.length >= 2) { send(ws, { type: 'error', message: 'Room is full' }); break; }
        leaveRoom(ws);
        room.players.push(ws);
        ws.roomCode = code;
        ws.playerId = 2;
        send(ws, { type: 'roomJoined', roomCode: code, playerId: 2 });
        send(room.players[0], { type: 'opponentJoined' });
        break;
      }

      case 'quickMatch': {
        leaveRoom(ws);
        // Find a waiting player
        while (matchmakingQueue.length > 0) {
          const opponent = matchmakingQueue.shift();
          if (opponent.readyState === 1 && !opponent.roomCode) {
            const code = randomCode();
            rooms.set(code, { players: [opponent, ws] });
            opponent.roomCode = code; opponent.playerId = 1;
            ws.roomCode = code; ws.playerId = 2;
            send(opponent, { type: 'matchFound', roomCode: code, playerId: 1 });
            send(ws, { type: 'matchFound', roomCode: code, playerId: 2 });
            // Signal both players that opponent is present
            send(opponent, { type: 'opponentJoined' });
            send(ws, { type: 'opponentJoined' });
            return;
          }
        }
        matchmakingQueue.push(ws);
        send(ws, { type: 'matchmaking' });
        break;
      }

      case 'cancelMatchmaking': {
        const idx = matchmakingQueue.indexOf(ws);
        if (idx !== -1) matchmakingQueue.splice(idx, 1);
        send(ws, { type: 'matchmakingCancelled' });
        break;
      }

      case 'ready': {
        ws.isReady = true;
        if (ws.roomCode) {
          const room = rooms.get(ws.roomCode);
          if (room && room.players.length === 2 && room.players.every(p => p.isReady)) {
            room.players.forEach(p => { p.isReady = false; send(p, { type: 'gameStart' }); });
          }
        }
        break;
      }

      case 'leaveRoom': {
        leaveRoom(ws);
        send(ws, { type: 'leftRoom' });
        break;
      }

      default:
        // Relay gameState, input, gameOver, and any other messages to opponent
        relay(ws, msg);
        break;
    }
  });

  ws.on('close', () => {
    const idx = matchmakingQueue.indexOf(ws);
    if (idx !== -1) matchmakingQueue.splice(idx, 1);
    leaveRoom(ws);
  });
});

server.on('listening', () => console.log(`Last Rally WS server on port ${PORT}`));
