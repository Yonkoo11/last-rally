// ============================================
// LAST RALLY - ONLINE LOBBY v2.0
// Premium Arcade Multiplayer Lobby - CSS Class-based
// ============================================

import { useState, useEffect, useRef } from 'react';
import { multiplayer, ConnectionState } from '../lib/multiplayer';
import { IconChevronLeft, IconSwords } from './ui';

interface OnlineLobbyProps {
  onGameStart?: (playerId: 1 | 2) => void;
  onBack: () => void;
}

export function OnlineLobby({ onGameStart, onBack }: OnlineLobbyProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [playerId, setPlayerId] = useState<1 | 2 | null>(null);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playerIdRef = useRef<1 | 2 | null>(null);
  const onGameStartRef = useRef(onGameStart);
  playerIdRef.current = playerId;
  onGameStartRef.current = onGameStart;

  useEffect(() => {
    multiplayer.setCallbacks({
      onConnectionChange: (state) => {
        setConnectionState(state);
        if (state === 'connected' || state === 'inRoom') setError(null);
      },
      onRoomCreated: (code) => {
        setRoomCode(code);
        setPlayerId(1);
        setError(null);
      },
      onRoomJoined: (code, id) => {
        setRoomCode(code);
        setPlayerId(id);
        setOpponentConnected(true);
        setError(null);
      },
      onOpponentJoined: () => setOpponentConnected(true),
      onOpponentDisconnected: () => {
        setOpponentConnected(false);
        setError('Opponent disconnected');
      },
      onMatchFound: (code, id) => {
        setRoomCode(code);
        setPlayerId(id);
        setOpponentConnected(true);
        setError(null);
      },
      onGameStart: () => {
        if (playerIdRef.current && onGameStartRef.current) {
          onGameStartRef.current(playerIdRef.current);
        }
      },
      onError: (msg) => setError(msg),
    });

    multiplayer.connect().catch(() => setError('Failed to connect to server'));
  }, []);

  const handleCreateRoom = () => { setError(null); multiplayer.createRoom(); };
  const handleJoinRoom = () => { if (joinCode.length === 4) { setError(null); multiplayer.joinRoom(joinCode); } };
  const handleQuickMatch = () => { setError(null); multiplayer.quickMatch(); };
  const handleCancelMatchmaking = () => multiplayer.cancelMatchmaking();
  const handleReady = () => multiplayer.ready();
  const handleLeaveRoom = () => { multiplayer.leaveRoom(); setRoomCode(null); setPlayerId(null); setOpponentConnected(false); };
  const handleBack = () => { multiplayer.disconnect(); onBack(); };

  const isConnected = connectionState === 'connected' || connectionState === 'inRoom' || connectionState === 'playing';
  const isConnecting = connectionState === 'connecting' || connectionState === 'matchmaking';

  // Lobby selection view
  const renderLobbySelection = () => (
    <div className="stagger-entrance" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Quick Match */}
      <button className="mode-card" data-glow="primary" onClick={handleQuickMatch} disabled={connectionState === 'connecting'}>
        <div className="mode-card__content">
          <span className="mode-card__title">Quick Match</span>
          <span className="mode-card__description">Find an opponent automatically</span>
        </div>
      </button>

      {/* Create Private Room */}
      <button className="mode-card" data-glow="blue" onClick={handleCreateRoom} disabled={connectionState === 'connecting'}>
        <div className="mode-card__content">
          <span className="mode-card__title">Create Private Room</span>
          <span className="mode-card__description">Get a code to share with a friend</span>
        </div>
      </button>

      {/* Join Private Room */}
      <div className="card card--md" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-gold)', marginBottom: 'var(--space-2)' }}>
          Join Private Room
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
          Enter a friend's room code
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input
            type="text"
            className="input"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="XXXX"
            maxLength={4}
            style={{ flex: 1, textAlign: 'center', fontSize: 'var(--text-xl)', letterSpacing: '0.2em', fontWeight: 600, color: 'var(--color-gold)', background: 'rgba(255, 215, 0, 0.05)', borderColor: 'rgba(255, 215, 0, 0.2)' }}
          />
          <button
            className={`btn ${joinCode.length === 4 ? 'btn--gold' : 'btn--secondary'} btn--md`}
            onClick={handleJoinRoom}
            disabled={joinCode.length !== 4 || connectionState === 'connecting'}
          >
            JOIN
          </button>
        </div>
      </div>
    </div>
  );

  // Matchmaking view
  const renderMatchmaking = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)', padding: 'var(--space-8)' }}>
      <div className="animate-spin" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent' }} />
      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
        Finding opponent...
      </div>
      <button className="btn btn--secondary btn--md" onClick={handleCancelMatchmaking}>
        Cancel
      </button>
    </div>
  );

  // Room view
  const renderRoom = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)' }}>
      {/* Room Code Display */}
      <div className="card card--lg" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.02) 100%)', borderColor: 'rgba(0, 212, 255, 0.3)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>
          ROOM CODE
        </div>
        <div className="glow-text-blue" style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-player1)', letterSpacing: '0.2em' }}>
          {roomCode}
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-3)' }}>
          Share this code with your friend
        </div>
      </div>

      {/* Player Status */}
      <div style={{ display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-5)' }}>
        <PlayerSlot label="Player 1" color="var(--color-player1)" connected={playerId === 1 || opponentConnected} isYou={playerId === 1} />
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
          <IconSwords size={24} />
        </div>
        <PlayerSlot label="Player 2" color="var(--color-player2)" connected={playerId === 2 || opponentConnected} isYou={playerId === 2} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        {opponentConnected ? (
          <button className="btn btn--primary btn--lg" onClick={handleReady}>READY</button>
        ) : (
          <div style={{ padding: 'var(--space-4) var(--space-8)', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)' }}>
            Waiting for opponent...
          </div>
        )}
      </div>

      <button className="btn btn--ghost btn--sm" onClick={handleLeaveRoom}>Leave Room</button>
    </div>
  );

  return (
    <div className="screen">
      <div className="scanlines" />
      <div className="ambient-glow" style={{ top: '15%', left: '30%', background: 'radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)' }} />

      <div className="screen__content screen-enter" style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <button className="back-btn" onClick={handleBack}>
            <IconChevronLeft size={16} />
            BACK
          </button>
          <h1 className="screen__title" style={{ marginTop: 'var(--space-4)', textTransform: 'uppercase' }}>
            Online <span style={{ color: 'var(--color-player1)' }}>Play</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? 'var(--color-primary)' : isConnecting ? 'var(--color-gold)' : 'var(--color-error)',
              boxShadow: isConnected ? '0 0 10px var(--color-primary)' : 'none',
            }} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
              {connectionState === 'disconnected' && 'Disconnected'}
              {connectionState === 'connecting' && 'Connecting...'}
              {connectionState === 'connected' && 'Connected'}
              {connectionState === 'matchmaking' && 'Finding match...'}
              {connectionState === 'inRoom' && 'In Room'}
              {connectionState === 'playing' && 'Playing'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="badge badge--error" style={{ display: 'block', width: '100%', padding: 'var(--space-4)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', textAlign: 'left', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}

        {/* Content */}
        {connectionState === 'matchmaking' && renderMatchmaking()}
        {(connectionState === 'inRoom' || connectionState === 'playing') && roomCode && renderRoom()}
        {(connectionState === 'connected' || connectionState === 'connecting' || connectionState === 'disconnected') && !roomCode && renderLobbySelection()}
      </div>
    </div>
  );
}

// Player slot component
function PlayerSlot({ label, color, connected, isYou }: { label: string; color: string; connected: boolean; isYou: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: 'var(--radius-lg)',
        background: connected ? `${color}20` : 'rgba(255, 255, 255, 0.05)',
        border: `2px solid ${connected ? color : 'rgba(255, 255, 255, 0.1)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: connected ? `0 0 20px ${color}40` : 'none',
        transition: 'all 0.3s ease-out',
      }}>
        {connected && (
          <div style={{ width: '12px', height: '40px', background: color, borderRadius: '4px', boxShadow: `0 0 15px ${color}` }} />
        )}
      </div>
      <div style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-display)', color: connected ? color : 'var(--text-muted)' }}>
        {label}
      </div>
      {isYou && (
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
          (YOU)
        </div>
      )}
    </div>
  );
}
