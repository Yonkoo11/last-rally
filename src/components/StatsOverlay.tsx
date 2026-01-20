import React from 'react';
import { loadStats } from '../lib/storage';
import './StatsOverlay.css';

interface StatsOverlayProps {
  onClose: () => void;
}

export function StatsOverlay({ onClose }: StatsOverlayProps) {
  const stats = loadStats();

  const winRate = stats.totalGames > 0
    ? Math.round((stats.totalWins / stats.totalGames) * 100)
    : 0;

  return (
    <div className="overlay stats-overlay" onClick={onClose}>
      <div className="overlay-content" onClick={e => e.stopPropagation()}>
        <div className="overlay-header">
          <h2 className="overlay-title">Statistics</h2>
          <button className="overlay-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="stats-content">
          {/* Overall Stats */}
          <section className="stats-section">
            <h3 className="section-title">Overall</h3>
            <div className="stats-grid">
              <div className="stat-card highlight">
                <span className="stat-value">{stats.totalGames}</span>
                <span className="stat-label">Games Played</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.totalWins}</span>
                <span className="stat-label">Wins</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.totalLosses}</span>
                <span className="stat-label">Losses</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{winRate}%</span>
                <span className="stat-label">Win Rate</span>
              </div>
            </div>
          </section>

          {/* Records */}
          <section className="stats-section">
            <h3 className="section-title">Records</h3>
            <div className="stats-grid">
              <div className="stat-card gold">
                <span className="stat-value">{stats.bestWinStreak}</span>
                <span className="stat-label">Best Streak</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.bestRally}</span>
                <span className="stat-label">Best Rally</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.currentWinStreak}</span>
                <span className="stat-label">Current Streak</span>
              </div>
            </div>
          </section>

          {/* By Mode */}
          <section className="stats-section">
            <h3 className="section-title">By Mode</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-mode">VS AI</span>
                <span className="stat-record">{stats.aiWins}W - {stats.aiLosses}L</span>
              </div>
              <div className="stat-row">
                <span className="stat-mode">VS Friend</span>
                <span className="stat-record">{stats.pvpWins}W - {stats.pvpLosses}L</span>
              </div>
              <div className="stat-row">
                <span className="stat-mode">Quests</span>
                <span className="stat-record">{stats.questWins}W - {stats.questLosses}L</span>
              </div>
            </div>
          </section>

          {/* By Difficulty */}
          <section className="stats-section">
            <h3 className="section-title">AI Difficulty</h3>
            <div className="difficulty-stats">
              <div className="difficulty-row easy">
                <span className="difficulty-name">Easy</span>
                <span className="difficulty-wins">{stats.aiEasyWins}W</span>
              </div>
              <div className="difficulty-row medium">
                <span className="difficulty-name">Medium</span>
                <span className="difficulty-wins">{stats.aiMediumWins}W</span>
              </div>
              <div className="difficulty-row hard">
                <span className="difficulty-name">Hard</span>
                <span className="difficulty-wins">{stats.aiHardWins}W</span>
              </div>
              <div className="difficulty-row impossible">
                <span className="difficulty-name">Impossible</span>
                <span className="difficulty-wins">{stats.aiImpossibleWins}W</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
