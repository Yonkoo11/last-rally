import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect } from 'react';
import { truncateAddress } from '../lib/solana';

interface WalletConnectProps {
  compact?: boolean;
}

export function WalletConnect({ compact = false }: WalletConnectProps) {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey || !connected) {
      setBalance(null);
      return;
    }

    let cancelled = false;

    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        if (!cancelled) setBalance(bal / LAMPORTS_PER_SOL);
      } catch {
        if (!cancelled) setBalance(null);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [publicKey, connected, connection]);

  if (!connected || !publicKey) {
    return (
      <button
        onClick={() => setVisible(true)}
        disabled={connecting}
        aria-label={connecting ? "Connecting to wallet" : "Connect wallet"}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: compact ? '8px 12px' : '10px 20px',
          background: 'linear-gradient(135deg, rgba(0, 255, 170, 0.15), rgba(0, 255, 170, 0.05))',
          border: '1px solid rgba(0, 255, 170, 0.3)',
          borderRadius: '8px',
          color: '#00FFAA',
          fontFamily: 'var(--font-ui)',
          fontSize: compact ? '13px' : '14px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          letterSpacing: '0.025em',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 170, 0.25), rgba(0, 255, 170, 0.1))';
          e.currentTarget.style.borderColor = 'rgba(0, 255, 170, 0.5)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 170, 0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 170, 0.15), rgba(0, 255, 170, 0.05))';
          e.currentTarget.style.borderColor = 'rgba(0, 255, 170, 0.3)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {connecting ? (
          <span style={{ opacity: 0.7 }}>Connecting...</span>
        ) : (
          <>
            <span style={{ fontSize: '16px' }}>◆</span>
            {!compact && <span>Connect Wallet</span>}
          </>
        )}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Balance display */}
      {balance !== null && !compact && (
        <span style={{
          color: 'var(--color-gray-400)',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
        }}>
          {balance.toFixed(2)} SOL
        </span>
      )}

      {/* Address button */}
      <button
        onClick={disconnect}
        aria-label={`Disconnect wallet ${truncateAddress(publicKey.toBase58())}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '6px 10px' : '8px 14px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          color: 'var(--color-white)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          e.currentTarget.style.color = '#EF4444';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = 'var(--color-white)';
        }}
        title="Disconnect wallet"
      >
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#22C55E',
          boxShadow: '0 0 6px rgba(34, 197, 94, 0.5)',
        }} />
        {truncateAddress(publicKey.toBase58())}
      </button>
    </div>
  );
}
