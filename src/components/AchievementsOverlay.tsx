import React, { useState } from 'react';
import { loadAchievements } from '../lib/storage';
import { ACHIEVEMENTS } from '../data/achievements';
import { playMenuSelect } from '../audio/sounds';
import './AchievementsOverlay.css';

interface AchievementsOverlayProps {
  onClose: () => void;
}

type Category = 'all' | 'victory' | 'skill' | 'progression' | 'secret';

export function AchievementsOverlay({ onClose }: AchievementsOverlayProps) {
  const [category, setCategory] = useState<Category>('all');
  const unlockedAchievements = loadAchievements();

  const filteredAchievements = category === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === category);

  const unlockedCount = Object.keys(unlockedAchievements).length;
  const totalCount = ACHIEVEMENTS.length;

  const handleCategoryChange = (cat: Category) => {
    playMenuSelect();
    setCategory(cat);
  };

  return (
    <div className="overlay achievements-overlay" onClick={onClose}>
      <div className="overlay-content" onClick={e => e.stopPropagation()}>
        <div className="overlay-header">
          <div className="header-left">
            <h2 className="overlay-title">Achievements</h2>
            <span className="achievement-count">{unlockedCount}/{totalCount}</span>
          </div>
          <button className="overlay-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category Filter */}
        <div className="category-tabs">
          {(['all', 'victory', 'skill', 'progression', 'secret'] as Category[]).map(cat => (
            <button
              key={cat}
              className={`category-tab ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="achievements-grid">
          {filteredAchievements.map(achievement => {
            const isUnlocked = !!unlockedAchievements[achievement.id];
            return (
              <div
                key={achievement.id}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <span className="achievement-icon">{achievement.icon}</span>
                <div className="achievement-info">
                  <span className="achievement-name">{achievement.name}</span>
                  <span className="achievement-desc">{achievement.description}</span>
                </div>
                <div className="achievement-actions">
                  {isUnlocked && (
                    <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
