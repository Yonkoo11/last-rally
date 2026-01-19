// ============================================
// LAST RALLY - MODE SELECT v4.0
// Premium Arcade Dashboard - CSS Class-based
// Inspired by: Celeste, Hollow Knight, Hades
// ============================================

import { useState } from 'react';
import { AIDifficulty, DIFFICULTY_INFO } from '../lib/ai';
import { QUESTS, QuestProgress, isQuestUnlocked, loadQuestProgress } from '../lib/quests';
import { loadStats, getWinRate, getDifficultySuggestion } from '../lib/stats';
import { ACHIEVEMENTS, getAchievementCount, loadAchievements } from '../lib/achievements';
import { loadCosmeticState, PADDLE_SKINS, BALL_TRAILS, ARENA_THEMES } from '../lib/cosmetics';
import {
  Badge,
  IconGamepad,
  IconCpu,
  IconTrophy,
  IconChevronRight,
  IconChevronLeft,
  IconCheck,
  IconLock,
  IconSparkles,
  IconShare,
  IconBlockchain,
} from './ui';
import { generateStatsShareText, copyToClipboard, shareNative, canShareNative } from '../lib/share';

export type GameMode = 'pvp' | 'ai' | 'quest';

interface ModeSelectProps {
  onSelectPvP: () => void;
  onSelectAI: (difficulty: AIDifficulty) => void;
  onSelectQuest: (questId: number) => void;
  onSelectOnline: () => void;
  onCustomize: () => void;
  onBack: () => void;
}

// Mode card using CSS classes
function ModeCard({
  icon,
  iconBg,
  glowColor,
  title,
  description,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  glowColor: 'primary' | 'blue' | 'red' | 'gold' | 'purple';
  title: string;
  description: string;
  badge?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="mode-card" data-glow={glowColor} onClick={onClick}>
      <div className="mode-card__icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="mode-card__content">
        <span className="mode-card__title">{title}</span>
        <span className="mode-card__description">{description}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
        {badge}
        <IconChevronRight size={20} className="mode-card__chevron" />
      </div>
    </button>
  );
}

// Difficulty button using CSS classes
function DifficultyButton({
  difficulty,
  onSelect,
}: {
  difficulty: AIDifficulty;
  onSelect: (diff: AIDifficulty) => void;
}) {
  const info = DIFFICULTY_INFO[difficulty];

  return (
    <button className="difficulty-btn" onClick={() => onSelect(difficulty)}>
      <div className="difficulty-btn__indicator" style={{ background: info.color, color: info.color }} />
      <div className="difficulty-btn__content">
        <span className="difficulty-btn__name">{info.name}</span>
        <span className="difficulty-btn__desc">{info.description}</span>
      </div>
      <IconChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
    </button>
  );
}

// Quest button using CSS classes
function QuestButton({
  quest,
  questProgress,
  onSelect,
}: {
  quest: typeof QUESTS[0];
  questProgress: QuestProgress;
  onSelect: (questId: number) => void;
}) {
  const isUnlocked = isQuestUnlocked(quest.id, questProgress);
  const isCompleted = questProgress.completedQuests.includes(quest.id);
  const diffInfo = DIFFICULTY_INFO[quest.difficulty];

  return (
    <button
      className={`cosmetic-item ${isCompleted ? 'cosmetic-item--selected' : ''} ${!isUnlocked ? 'cosmetic-item--locked' : ''}`}
      onClick={() => isUnlocked && onSelect(quest.id)}
      disabled={!isUnlocked}
      style={{ alignItems: 'flex-start', textAlign: 'left' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 'var(--space-2)' }}>
        <span style={{ fontSize: '10px', color: diffInfo.color, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em' }}>
          #{quest.id}
        </span>
        {isCompleted && <IconCheck size={16} style={{ color: 'var(--color-primary)' }} />}
        {!isUnlocked && <IconLock size={16} style={{ color: 'var(--text-muted)' }} />}
      </div>
      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-display)', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
        {quest.name}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        {quest.description}
      </div>
    </button>
  );
}

// Back button component
function BackButton({ onClick, label = 'BACK' }: { onClick: () => void; label?: string }) {
  return (
    <button className="back-btn" onClick={onClick} aria-label={`Go back`}>
      <IconChevronLeft size={16} />
      {label}
    </button>
  );
}

// Screen header component
function ScreenHeader({
  onBack,
  title,
  highlight,
  highlightColor = 'var(--color-primary)',
  subtitle,
}: {
  onBack: () => void;
  title: string;
  highlight?: string;
  highlightColor?: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <BackButton onClick={onBack} />
      <h1 className="screen__title" style={{ marginTop: 'var(--space-4)', textTransform: 'uppercase' }}>
        {title} {highlight && <span style={{ color: highlightColor }}>{highlight}</span>}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function ModeSelect({ onSelectPvP, onSelectAI, onSelectQuest, onSelectOnline, onCustomize, onBack }: ModeSelectProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [questProgress] = useState<QuestProgress>(loadQuestProgress);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const stats = loadStats();
  const achievementState = loadAchievements();
  const { unlocked: achievementsUnlocked, total: achievementsTotal } = getAchievementCount();
  const cosmeticState = loadCosmeticState();
  const totalCosmetics = PADDLE_SKINS.length + BALL_TRAILS.length + ARENA_THEMES.length;
  const unlockedCosmetics = cosmeticState.unlockedPaddleSkins.length + cosmeticState.unlockedBallTrails.length + cosmeticState.unlockedArenaThemes.length;

  const handleShareStats = async () => {
    const text = generateStatsShareText();
    if (canShareNative()) {
      const shared = await shareNative('Last Rally Stats', text);
      if (shared) {
        setShareMessage('Shared!');
        setTimeout(() => setShareMessage(null), 2000);
        return;
      }
    }
    const copied = await copyToClipboard(text);
    setShareMessage(copied ? 'Copied!' : 'Failed');
    setTimeout(() => setShareMessage(null), 2000);
  };

  // Stats bar component
  const StatsBar = () => {
    const statItems = [
      { label: 'GAMES', value: stats.totalGames, color: 'var(--text-primary)' },
      { label: 'WIN %', value: stats.totalGames > 0 ? `${getWinRate(stats)}%` : '-', color: getWinRate(stats) >= 50 ? 'var(--color-primary)' : 'var(--color-gold)' },
      { label: 'BEST RALLY', value: stats.bestRally || '-', color: 'var(--color-primary)' },
      { label: 'TROPHIES', value: `${achievementsUnlocked}/${achievementsTotal}`, color: 'var(--color-gold)' },
    ];

    return (
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {statItems.map((stat) => (
          <div key={stat.label} className="stat-card">
            <span className="stat-card__label">{stat.label}</span>
            <span className="stat-card__value" style={{ color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Main mode selection view
  if (!selectedMode) {
    return (
      <div className="screen">
        <div className="scanlines" />
        <div className="ambient-glow ambient-glow--primary" style={{ top: '10%', left: '30%' }} />

        <div className="screen__content screen-enter">
          <ScreenHeader onBack={onBack} title="Select Mode" />

          {stats.totalGames > 0 && <StatsBar />}

          {/* Mode Cards with stagger animation */}
          <div className="stagger-entrance" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <ModeCard
              icon={<IconBlockchain size={26} />}
              iconBg="#1a3a3a"
              glowColor="primary"
              title="Online Play"
              description="Battle players worldwide in real-time"
              badge={<Badge variant="success">NEW</Badge>}
              onClick={onSelectOnline}
            />

            <ModeCard
              icon={<IconGamepad size={26} />}
              iconBg="rgba(0, 212, 255, 0.15)"
              glowColor="blue"
              title="Local Multiplayer"
              description="Play against a friend on the same device"
              badge={<Badge>W/S vs I/K</Badge>}
              onClick={onSelectPvP}
            />

            <ModeCard
              icon={<IconCpu size={26} />}
              iconBg="rgba(255, 51, 102, 0.15)"
              glowColor="red"
              title="Solo Play"
              description="Test your skills at 4 difficulty levels"
              onClick={() => setSelectedMode('ai')}
            />

            <ModeCard
              icon={<IconTrophy size={26} />}
              iconBg="rgba(255, 215, 0, 0.15)"
              glowColor="gold"
              title="Quest Mode"
              description="Complete challenges to unlock achievements"
              badge={<Badge variant="success">{questProgress.completedQuests.length}/13</Badge>}
              onClick={() => setSelectedMode('quest')}
            />

            <ModeCard
              icon={<IconSparkles size={26} />}
              iconBg="rgba(138, 43, 226, 0.15)"
              glowColor="purple"
              title="Customize"
              description="Change paddle skins, ball trails, and themes"
              badge={<Badge>{unlockedCosmetics}/{totalCosmetics}</Badge>}
              onClick={onCustomize}
            />
          </div>

          {/* Achievements Preview */}
          {achievementsUnlocked > 0 && (
            <div style={{ marginTop: 'var(--space-8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: 'var(--font-display)' }}>
                  RECENT ACHIEVEMENTS
                </span>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={handleShareStats}
                  aria-label="Share your game statistics"
                  style={{ gap: 'var(--space-2)', padding: 'var(--space-1) var(--space-2)' }}
                >
                  <IconShare size={12} />
                  {shareMessage || 'SHARE'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {ACHIEVEMENTS.filter((a) => achievementState[a.id]?.unlockedAt)
                  .slice(0, 6)
                  .map((achievement) => (
                    <Badge key={achievement.id} variant="success">
                      {achievement.name}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // AI Difficulty selection
  if (selectedMode === 'ai') {
    const suggestion = getDifficultySuggestion(stats);
    const isEncouraging = suggestion.type === 'ready_for_next';

    return (
      <div className="screen">
        <div className="scanlines" />
        <div className="ambient-glow" style={{ top: '10%', left: '30%', background: 'radial-gradient(circle, rgba(255, 51, 102, 0.06) 0%, transparent 70%)' }} />

        <div className="screen__content screen-enter" style={{ maxWidth: '550px' }}>
          <ScreenHeader
            onBack={() => setSelectedMode(null)}
            title="Choose Your"
            highlight="Rival"
            highlightColor="var(--color-player2)"
          />

          {/* Difficulty Suggestion */}
          {suggestion.type && suggestion.targetDifficulty && (
            <button
              className="mode-card"
              data-glow={isEncouraging ? 'primary' : 'gold'}
              onClick={() => onSelectAI(suggestion.targetDifficulty!)}
              style={{ marginBottom: 'var(--space-4)', background: isEncouraging ? 'rgba(0, 255, 170, 0.05)' : 'rgba(255, 215, 0, 0.05)' }}
            >
              <span style={{ fontSize: 'var(--text-xl)' }}>{isEncouraging ? '⚡' : '💡'}</span>
              <div className="mode-card__content">
                <span className="mode-card__title" style={{ fontSize: 'var(--text-sm)' }}>{suggestion.message}</span>
                <span className="mode-card__description">Click to try {DIFFICULTY_INFO[suggestion.targetDifficulty].name}</span>
              </div>
              <IconChevronRight size={16} style={{ color: isEncouraging ? 'var(--color-primary)' : 'var(--color-gold)' }} />
            </button>
          )}

          {/* Difficulty Options */}
          <div className="stagger-entrance" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {(['easy', 'medium', 'hard', 'impossible'] as AIDifficulty[]).map((diff) => (
              <DifficultyButton key={diff} difficulty={diff} onSelect={onSelectAI} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quest selection
  if (selectedMode === 'quest') {
    return (
      <div className="screen">
        <div className="scanlines" />
        <div className="ambient-glow ambient-glow--primary" style={{ top: '10%', left: '30%' }} />

        <div className="screen__content screen-enter">
          <ScreenHeader
            onBack={() => setSelectedMode(null)}
            title="Quest"
            highlight="Mode"
            subtitle={`${questProgress.completedQuests.length} of 13 completed`}
          />

          {/* Quest Grid */}
          <div className="item-grid stagger-entrance">
            {QUESTS.map((quest) => (
              <QuestButton
                key={quest.id}
                quest={quest}
                questProgress={questProgress}
                onSelect={onSelectQuest}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
