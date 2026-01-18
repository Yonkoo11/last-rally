// ============================================
// LAST RALLY - MULTIPLAYER CLIENT
// WebSocket client for online play
// ============================================

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'matchmaking' | 'inRoom' | 'playing';

export interface GameState {
  ball: { x: number; y: number; vx: number; vy: number };
  paddle1Y: number;
  paddle2Y: number;
  score1: number;
  score2: number;
}

export interface MultiplayerCallbacks {
  onConnectionChange?: (state: ConnectionState) => void;
  onRoomCreated?: (roomCode: string) => void;
  onRoomJoined?: (roomCode: string, playerId: 1 | 2) => void;
  onOpponentJoined?: () => void;
  onOpponentDisconnected?: () => void;
  onMatchFound?: (roomCode: string, playerId: 1 | 2) => void;
  onGameStart?: () => void;
  onGameState?: (state: GameState) => void;
  onGameOver?: (winner: 1 | 2, score1: number, score2: number) => void;
  onError?: (message: string) => void;
}

const SERVER_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

class MultiplayerClient {
  private ws: WebSocket | null = null;
  private callbacks: MultiplayerCallbacks = {};
  private _connectionState: ConnectionState = 'disconnected';
  private _roomCode: string | null = null;
  private _playerId: 1 | 2 | null = null;
  private reconnectTimeout: number | null = null;

  get connectionState() {
    return this._connectionState;
  }

  get roomCode() {
    return this._roomCode;
  }

  get playerId() {
    return this._playerId;
  }

  setCallbacks(callbacks: MultiplayerCallbacks) {
    // Merge callbacks instead of replacing to preserve handlers from other components
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  clearCallbacks() {
    this.callbacks = {};
  }

  private setConnectionState(state: ConnectionState) {
    this._connectionState = state;
    this.callbacks.onConnectionChange?.(state);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.setConnectionState('connecting');

      try {
        this.ws = new WebSocket(SERVER_URL);

        this.ws.onopen = () => {
          console.log('Connected to multiplayer server');
          this.setConnectionState('connected');
          resolve();
        };

        this.ws.onclose = () => {
          console.log('Disconnected from multiplayer server');
          this.setConnectionState('disconnected');
          this._roomCode = null;
          this._playerId = null;
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.callbacks.onError?.('Connection failed');
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            this.handleMessage(msg);
          } catch (e) {
            console.error('Failed to parse message:', e);
          }
        };
      } catch (error) {
        this.setConnectionState('disconnected');
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this._roomCode = null;
    this._playerId = null;
    this.setConnectionState('disconnected');
  }

  private send(data: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleMessage(msg: Record<string, unknown>) {
    switch (msg.type) {
      case 'roomCreated':
        this._roomCode = msg.roomCode as string;
        this._playerId = msg.playerId as 1 | 2;
        this.setConnectionState('inRoom');
        this.callbacks.onRoomCreated?.(this._roomCode);
        break;

      case 'roomJoined':
        this._roomCode = msg.roomCode as string;
        this._playerId = msg.playerId as 1 | 2;
        this.setConnectionState('inRoom');
        this.callbacks.onRoomJoined?.(this._roomCode, this._playerId);
        break;

      case 'opponentJoined':
        this.callbacks.onOpponentJoined?.();
        break;

      case 'opponentDisconnected':
        this.setConnectionState('inRoom');
        this.callbacks.onOpponentDisconnected?.();
        break;

      case 'matchmaking':
        this.setConnectionState('matchmaking');
        break;

      case 'matchmakingCancelled':
        this.setConnectionState('connected');
        break;

      case 'matchFound':
        this._roomCode = msg.roomCode as string;
        this._playerId = msg.playerId as 1 | 2;
        this.setConnectionState('inRoom');
        this.callbacks.onMatchFound?.(this._roomCode, this._playerId);
        break;

      case 'gameStart':
        this.setConnectionState('playing');
        this.callbacks.onGameStart?.();
        break;

      case 'gameState':
        this.callbacks.onGameState?.(msg as unknown as GameState);
        break;

      case 'gameOver':
        this.setConnectionState('inRoom');
        this.callbacks.onGameOver?.(
          msg.winner as 1 | 2,
          msg.score1 as number,
          msg.score2 as number
        );
        break;

      case 'error':
        this.callbacks.onError?.(msg.message as string);
        break;
    }
  }

  // Actions
  createRoom() {
    this.send({ type: 'createRoom' });
  }

  joinRoom(roomCode: string) {
    this.send({ type: 'joinRoom', roomCode: roomCode.toUpperCase() });
  }

  quickMatch() {
    this.send({ type: 'quickMatch' });
  }

  cancelMatchmaking() {
    this.send({ type: 'cancelMatchmaking' });
  }

  ready() {
    this.send({ type: 'ready' });
  }

  sendInput(paddleY: number) {
    this.send({ type: 'input', paddleY });
  }

  leaveRoom() {
    this.send({ type: 'leaveRoom' });
    this._roomCode = null;
    this._playerId = null;
    this.setConnectionState('connected');
  }
}

// Singleton instance
export const multiplayer = new MultiplayerClient();
