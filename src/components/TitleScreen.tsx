// ============================================
// LAST RALLY - TITLE SCREEN v4.0
// Premium Arcade Experience - CSS Class-based
// Inspired by: Celeste, Hollow Knight, Hades
// ============================================

import { useEffect, useState } from 'react';
import { IconPlay } from './ui';

interface TitleScreenProps {
  onStart: () => void;
  onQuickPlay: () => void;
}

export function TitleScreen({ onStart, onQuickPlay }: TitleScreenProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (ready && (e.key === 'Enter' || e.key === ' ')) {
        onStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [ready, onStart]);

  return (
    <div className="screen" style={{ justifyContent: 'center' }}>
      {/* Scanline overlay */}
      <div className="scanlines" />

      {/* Gradient glows */}
      <div className="ambient-glow ambient-glow--primary" style={{ top: '25%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px' }} />
      <div className="ambient-glow ambient-glow--gold" style={{ top: '35%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '300px' }} />

      {/* Content container */}
      <div className={`screen-enter ${ready ? '' : 'opacity-0'}`} style={{ textAlign: 'center', maxWidth: '520px', padding: 'var(--space-8)', position: 'relative', zIndex: 1 }}>

        {/* Logo - Pulsing orb */}
        <div className="stagger-entrance stagger-slow" style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
          <div
            className="animate-pulse"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, var(--color-gold), #B8860B)',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.2)',
            }}
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(3rem, 10vw, 4.5rem)',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.03em',
          margin: 0,
          lineHeight: 1,
          textTransform: 'uppercase',
        }}>
          <span className="glow-text-primary" style={{ color: 'var(--color-primary)' }}>
            LAST
          </span>{' '}
          <span className="glow-text-gold" style={{ color: 'var(--color-gold)' }}>
            RALLY
          </span>
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 'var(--text-base)',
          fontFamily: 'var(--font-display)',
          color: 'var(--text-secondary)',
          marginTop: 'var(--space-4)',
          marginBottom: 'var(--space-10)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          Fast. Fierce. Final.
        </p>

        {/* CTA Buttons */}
        <div className="stagger-entrance" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center' }}>
          <button
            className="btn btn--primary btn--xl"
            onClick={onStart}
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            <IconPlay size={22} />
            Play Now
          </button>

          <button
            className="btn btn--secondary btn--lg"
            onClick={onQuickPlay}
            style={{ minWidth: '220px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Quick Play
          </button>

          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            marginTop: 'var(--space-2)',
            letterSpacing: '0.02em',
          }}>
            Jump straight into a match
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 'var(--space-6)',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-6)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-disabled)',
        fontFamily: 'var(--font-mono)',
        opacity: 0.6,
      }}>
        <span>v4.0</span>
        <span style={{ color: 'var(--border-default)' }}>|</span>
        <span>Built on Linera</span>
      </div>
    </div>
  );
}
