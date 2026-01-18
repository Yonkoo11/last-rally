// ============================================
// LAST RALLY - COSMETIC SELECTION v3.0
// Premium Arcade Experience - CSS Class-based
// ============================================

import { useState } from 'react';
import {
  loadCosmeticState,
  selectPaddleSkin,
  selectBallTrail,
  selectArenaTheme,
  PADDLE_SKINS,
  BALL_TRAILS,
  ARENA_THEMES,
  PaddleSkin,
  BallTrail,
  ArenaTheme,
  CosmeticState,
} from '../lib/cosmetics';
import { IconChevronLeft, IconCheck, IconLock } from './ui';

type Tab = 'paddles' | 'trails' | 'themes';

interface CosmeticSelectProps {
  onBack: () => void;
}

export function CosmeticSelect({ onBack }: CosmeticSelectProps) {
  const [cosmeticState, setCosmeticState] = useState<CosmeticState>(loadCosmeticState);
  const [activeTab, setActiveTab] = useState<Tab>('paddles');

  const handleSelectPaddle = (skinId: string) => {
    setCosmeticState(selectPaddleSkin(skinId));
  };

  const handleSelectTrail = (trailId: string) => {
    setCosmeticState(selectBallTrail(trailId));
  };

  const handleSelectTheme = (themeId: string) => {
    setCosmeticState(selectArenaTheme(themeId));
  };

  return (
    <div className="screen">
      <div className="scanlines" />
      <div className="ambient-glow ambient-glow--gold" style={{ top: '20%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '500px' }} />

      <div className="screen__content screen-enter" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <button className="back-btn" onClick={onBack}>
            <IconChevronLeft size={16} />
            BACK
          </button>
          <h1 className="screen__title" style={{ marginTop: 'var(--space-4)', textTransform: 'uppercase' }}>
            Custom<span style={{ color: 'var(--color-gold)' }}>ize</span>
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>
            Unlock cosmetics by completing achievements
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs stagger-entrance" style={{ marginBottom: 'var(--space-6)' }}>
          <button className={`tab ${activeTab === 'paddles' ? 'tab--active' : ''}`} onClick={() => setActiveTab('paddles')}>
            Paddles
          </button>
          <button className={`tab ${activeTab === 'trails' ? 'tab--active' : ''}`} onClick={() => setActiveTab('trails')}>
            Trails
          </button>
          <button className={`tab ${activeTab === 'themes' ? 'tab--active' : ''}`} onClick={() => setActiveTab('themes')}>
            Themes
          </button>
        </div>

        {/* Content */}
        <div className="stagger-entrance">
          {activeTab === 'paddles' && (
            <div className="item-grid">
              {PADDLE_SKINS.map((skin) => (
                <PaddlePreview
                  key={skin.id}
                  skin={skin}
                  isSelected={cosmeticState.selectedPaddleSkin === skin.id}
                  isUnlocked={cosmeticState.unlockedPaddleSkins.includes(skin.id)}
                  onSelect={handleSelectPaddle}
                />
              ))}
            </div>
          )}

          {activeTab === 'trails' && (
            <div className="item-grid">
              {BALL_TRAILS.map((trail) => (
                <TrailPreview
                  key={trail.id}
                  trail={trail}
                  isSelected={cosmeticState.selectedBallTrail === trail.id}
                  isUnlocked={cosmeticState.unlockedBallTrails.includes(trail.id)}
                  onSelect={handleSelectTrail}
                />
              ))}
            </div>
          )}

          {activeTab === 'themes' && (
            <div className="item-grid">
              {ARENA_THEMES.map((theme) => (
                <ThemePreview
                  key={theme.id}
                  theme={theme}
                  isSelected={cosmeticState.selectedArenaTheme === theme.id}
                  isUnlocked={cosmeticState.unlockedArenaThemes.includes(theme.id)}
                  onSelect={handleSelectTheme}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats summary */}
        <div className="stats-grid" style={{ marginTop: 'var(--space-8)' }}>
          <div className="stat-card">
            <span className="stat-card__label">PADDLES</span>
            <span className="stat-card__value" style={{ color: 'var(--color-player1)' }}>
              {cosmeticState.unlockedPaddleSkins.length}/{PADDLE_SKINS.length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">TRAILS</span>
            <span className="stat-card__value" style={{ color: 'var(--color-primary)' }}>
              {cosmeticState.unlockedBallTrails.length}/{BALL_TRAILS.length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">THEMES</span>
            <span className="stat-card__value" style={{ color: 'var(--color-gold)' }}>
              {cosmeticState.unlockedArenaThemes.length}/{ARENA_THEMES.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Paddle preview component
function PaddlePreview({ skin, isSelected, isUnlocked, onSelect }: { skin: PaddleSkin; isSelected: boolean; isUnlocked: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      className={`cosmetic-item ${isSelected ? 'cosmetic-item--selected' : ''} ${!isUnlocked ? 'cosmetic-item--locked' : ''}`}
      onClick={() => isUnlocked && onSelect(skin.id)}
      disabled={!isUnlocked}
      style={{ '--glow-color': skin.color } as React.CSSProperties}
    >
      {/* Preview */}
      <div className="cosmetic-item__preview">
        <div
          style={{
            width: '16px',
            height: '60px',
            background: skin.color,
            borderRadius: '4px',
            boxShadow: isUnlocked ? `0 0 25px ${skin.glowColor}` : 'none',
          }}
        />
      </div>

      {/* Name and status */}
      <div className="cosmetic-item__footer">
        <span className="cosmetic-item__name">{skin.name}</span>
        {isSelected && <IconCheck size={16} style={{ color: 'var(--color-primary)' }} />}
        {!isUnlocked && <IconLock size={14} style={{ color: 'var(--text-muted)' }} />}
      </div>

      {/* Unlock condition */}
      {!isUnlocked && (
        <div className="cosmetic-item__unlock">{skin.unlockCondition}</div>
      )}
    </button>
  );
}

// Trail preview component
function TrailPreview({ trail, isSelected, isUnlocked, onSelect }: { trail: BallTrail; isSelected: boolean; isUnlocked: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      className={`cosmetic-item ${isSelected ? 'cosmetic-item--selected' : ''} ${!isUnlocked ? 'cosmetic-item--locked' : ''}`}
      onClick={() => isUnlocked && onSelect(trail.id)}
      disabled={!isUnlocked}
      style={{ '--glow-color': trail.colors[0] } as React.CSSProperties}
    >
      {/* Preview */}
      <div className="cosmetic-item__preview" style={{ flexDirection: 'row', gap: 'var(--space-2)' }}>
        {trail.colors.map((color, i) => (
          <div
            key={i}
            style={{
              width: `${16 - i * 2}px`,
              height: `${16 - i * 2}px`,
              background: color,
              borderRadius: '50%',
              boxShadow: isUnlocked ? `0 0 10px ${color}` : 'none',
              opacity: 1 - i * 0.15,
            }}
          />
        ))}
        <div
          style={{
            width: '20px',
            height: '20px',
            background: 'var(--color-gold)',
            borderRadius: '50%',
            boxShadow: isUnlocked ? '0 0 15px var(--color-gold)' : 'none',
          }}
        />
      </div>

      {/* Name and status */}
      <div className="cosmetic-item__footer">
        <span className="cosmetic-item__name">{trail.name}</span>
        {isSelected && <IconCheck size={16} style={{ color: 'var(--color-primary)' }} />}
        {!isUnlocked && <IconLock size={14} style={{ color: 'var(--text-muted)' }} />}
      </div>

      {/* Unlock condition */}
      {!isUnlocked && (
        <div className="cosmetic-item__unlock">{trail.unlockCondition}</div>
      )}
    </button>
  );
}

// Theme preview component
function ThemePreview({ theme, isSelected, isUnlocked, onSelect }: { theme: ArenaTheme; isSelected: boolean; isUnlocked: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      className={`cosmetic-item ${isSelected ? 'cosmetic-item--selected' : ''} ${!isUnlocked ? 'cosmetic-item--locked' : ''}`}
      onClick={() => isUnlocked && onSelect(theme.id)}
      disabled={!isUnlocked}
      style={{ '--glow-color': theme.accentColor } as React.CSSProperties}
    >
      {/* Mini arena preview */}
      <div
        className="cosmetic-item__preview"
        style={{
          background: theme.bgColor,
          borderRadius: 'var(--radius-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Center line */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', background: theme.lineColor }} />
        {/* Left paddle */}
        <div
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '4px',
            height: '30px',
            background: theme.accentColor,
            borderRadius: '2px',
            boxShadow: isUnlocked ? `0 0 10px ${theme.accentColor}` : 'none',
          }}
        />
        {/* Right paddle */}
        <div
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '4px',
            height: '30px',
            background: theme.accentColor,
            borderRadius: '2px',
            boxShadow: isUnlocked ? `0 0 10px ${theme.accentColor}` : 'none',
          }}
        />
        {/* Ball */}
        <div
          style={{
            width: '8px',
            height: '8px',
            background: theme.accentColor,
            borderRadius: '50%',
            boxShadow: isUnlocked ? `0 0 8px ${theme.accentColor}` : 'none',
          }}
        />
      </div>

      {/* Name and status */}
      <div className="cosmetic-item__footer">
        <span className="cosmetic-item__name">{theme.name}</span>
        {isSelected && <IconCheck size={16} style={{ color: 'var(--color-primary)' }} />}
        {!isUnlocked && <IconLock size={14} style={{ color: 'var(--text-muted)' }} />}
      </div>

      {/* Unlock condition */}
      {!isUnlocked && (
        <div className="cosmetic-item__unlock">{theme.unlockCondition}</div>
      )}
    </button>
  );
}
