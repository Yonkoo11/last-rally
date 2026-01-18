import React, { useState } from 'react';
import { PaddleSkin, TrailType, ArenaTheme } from '../types';
import {
  loadCosmetics,
  loadStats,
  loadQuestProgress,
  loadAchievements,
  selectCosmetic,
} from '../lib/storage';
import {
  PADDLE_SKINS,
  BALL_TRAILS,
  ARENA_THEMES,
  PADDLE_COLORS,
  THEME_COLORS,
  isUnlocked,
} from '../data/cosmetics';
import { playMenuSelect } from '../audio/sounds';
import './CosmeticSelect.css';

interface CosmeticSelectProps {
  onClose: () => void;
  isOverlay?: boolean;
}

type Tab = 'paddles' | 'trails' | 'themes';

export function CosmeticSelect({ onClose, isOverlay = false }: CosmeticSelectProps) {
  const [activeTab, setActiveTab] = useState<Tab>('paddles');
  const [, forceUpdate] = useState({});
  const cosmetics = loadCosmetics();
  const stats = loadStats();
  const questProgress = loadQuestProgress();
  const achievements = loadAchievements();

  const unlockContext = {
    gamesPlayed: stats.totalGames,
    completedQuests: questProgress.completedQuests,
    unlockedAchievements: Object.keys(achievements),
    bestStreak: stats.bestWinStreak,
    aiEasyWins: stats.aiEasyWins,
    aiMediumWins: stats.aiMediumWins,
    aiHardWins: stats.aiHardWins,
    aiImpossibleWins: stats.aiImpossibleWins,
  };

  const handleSelect = (type: 'paddle' | 'trail' | 'theme', id: string) => {
    playMenuSelect();
    selectCosmetic(type, id);
    forceUpdate({});
  };

  const handleTabChange = (tab: Tab) => {
    playMenuSelect();
    setActiveTab(tab);
  };

  const content = (
    <>
      <div className="cosmetic-header">
        <h2 className="modal-title">Settings</h2>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="cosmetic-tabs">
        <button
          className={`tab ${activeTab === 'paddles' ? 'active' : ''}`}
          onClick={() => handleTabChange('paddles')}
        >
          Paddles
        </button>
        <button
          className={`tab ${activeTab === 'trails' ? 'active' : ''}`}
          onClick={() => handleTabChange('trails')}
        >
          Trails
        </button>
        <button
          className={`tab ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => handleTabChange('themes')}
        >
          Themes
        </button>
      </div>

      <div className="cosmetic-grid">
        {activeTab === 'paddles' &&
          PADDLE_SKINS.map(item => {
            const unlocked = isUnlocked(item, unlockContext);
            const selected = cosmetics.selectedPaddleSkin === item.id;
            const color = PADDLE_COLORS[item.id as PaddleSkin];

            return (
              <button
                key={item.id}
                className={`cosmetic-card ${selected ? 'selected' : ''} ${
                  !unlocked ? 'locked' : ''
                }`}
                onClick={() => unlocked && handleSelect('paddle', item.id)}
                disabled={!unlocked}
              >
                <div
                  className="paddle-preview"
                  style={{
                    background: Array.isArray(color)
                      ? `linear-gradient(to bottom, ${color.join(', ')})`
                      : color,
                  }}
                />
                <span className="cosmetic-name">{item.name}</span>
                {!unlocked && (
                  <span className="cosmetic-unlock">
                    {item.unlockCondition.description}
                  </span>
                )}
                {selected && (
                  <span className="cosmetic-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
                {!unlocked && (
                  <span className="cosmetic-lock">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}

        {activeTab === 'trails' &&
          BALL_TRAILS.map(item => {
            const unlocked = isUnlocked(item, unlockContext);
            const selected = cosmetics.selectedBallTrail === item.id;

            return (
              <button
                key={item.id}
                className={`cosmetic-card ${selected ? 'selected' : ''} ${
                  !unlocked ? 'locked' : ''
                }`}
                onClick={() => unlocked && handleSelect('trail', item.id)}
                disabled={!unlocked}
              >
                <div className="trail-preview">
                  <TrailPreview type={item.id as TrailType} />
                </div>
                <span className="cosmetic-name">{item.name}</span>
                {!unlocked && (
                  <span className="cosmetic-unlock">
                    {item.unlockCondition.description}
                  </span>
                )}
                {selected && (
                  <span className="cosmetic-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
                {!unlocked && (
                  <span className="cosmetic-lock">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}

        {activeTab === 'themes' &&
          ARENA_THEMES.map(item => {
            const unlocked = isUnlocked(item, unlockContext);
            const selected = cosmetics.selectedArenaTheme === item.id;
            const colors = THEME_COLORS[item.id as ArenaTheme];

            return (
              <button
                key={item.id}
                className={`cosmetic-card theme-card ${selected ? 'selected' : ''} ${
                  !unlocked ? 'locked' : ''
                }`}
                onClick={() => unlocked && handleSelect('theme', item.id)}
                disabled={!unlocked}
              >
                <div
                  className="theme-preview"
                  style={{ background: colors.background }}
                >
                  <div
                    className="theme-line"
                    style={{ background: colors.lines }}
                  />
                  <div
                    className="theme-ball"
                    style={{ background: colors.ball }}
                  />
                </div>
                <span className="cosmetic-name">{item.name}</span>
                {!unlocked && (
                  <span className="cosmetic-unlock">
                    {item.unlockCondition.description}
                  </span>
                )}
                {selected && (
                  <span className="cosmetic-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
                {!unlocked && (
                  <span className="cosmetic-lock">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
      </div>
    </>
  );

  if (isOverlay) {
    return (
      <div className="overlay" onClick={onClose}>
        <div className="cosmetic-modal" onClick={e => e.stopPropagation()}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="cosmetic-select">
      {content}
    </div>
  );
}

function TrailPreview({ type }: { type: TrailType }) {
  const colors: Record<TrailType, string[]> = {
    none: ['transparent'],
    classic: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)'],
    fire: ['#EF4444', '#F59E0B', '#FCD34D'],
    rainbow: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
    pixel: ['#00FF00', '#00DD00', '#00BB00'],
  };

  const trailColors = colors[type];

  return (
    <div className="trail-dots">
      {trailColors.map((color, i) => (
        <div
          key={i}
          className="trail-dot"
          style={{
            background: color,
            opacity: 1 - i * 0.25,
            transform: `scale(${1 - i * 0.15})`,
          }}
        />
      ))}
    </div>
  );
}
