// ============================================
// LAST RALLY - HOW TO PLAY v3.0
// Clean, modern design with customizable controls
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Button, Card } from './ui';
import { loadControls, saveControls, resetControls, getKeyDisplayName, ControlBindings } from '../lib/controls';

const TUTORIAL_STORAGE_KEY = 'lastrally_tutorial_seen';

function hasTutorialBeenSeen(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function markTutorialSeen(): void {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
  } catch {
    // localStorage not available
  }
}

interface TutorialProps {
  onDismiss: () => void;
}

export function Tutorial({ onDismiss }: TutorialProps) {
  const [controls, setControls] = useState<ControlBindings>(loadControls);
  const [editingAction, setEditingAction] = useState<keyof ControlBindings | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);

  const handleDismiss = () => {
    markTutorialSeen();
    onDismiss();
  };

  // Listen for key press when editing
  useEffect(() => {
    if (!editingAction) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const keyCode = e.code;

      // Don't allow Escape to be reassigned (always pause)
      if (keyCode === 'Escape' && editingAction !== 'pause') {
        setEditingAction(null);
        return;
      }

      // Update the control binding
      const newControls = {
        ...controls,
        [editingAction]: [keyCode],
      };
      setControls(newControls);
      saveControls(newControls);
      setEditingAction(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingAction, controls]);

  const handleResetControls = useCallback(() => {
    const defaultControls = resetControls();
    setControls(defaultControls);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 5, 8, 0.97)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-6)',
      }}
      onClick={handleDismiss}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2
          style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--color-primary)',
            margin: 0,
            marginBottom: 'var(--space-2)',
            textAlign: 'center',
            textShadow: '0 0 30px rgba(0, 255, 170, 0.3)',
            letterSpacing: '-0.02em',
          }}
        >
          Controls
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginBottom: 'var(--space-6)',
          }}
        >
          Move your paddle to hit the ball
        </p>

        {/* Main Controls */}
        <Card size="lg" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Move Up */}
            <ControlRow
              label="Move Up"
              keys={controls.moveUp}
              isEditing={editingAction === 'moveUp'}
              onEdit={() => showCustomize && setEditingAction('moveUp')}
              editable={showCustomize}
            />

            {/* Move Down */}
            <ControlRow
              label="Move Down"
              keys={controls.moveDown}
              isEditing={editingAction === 'moveDown'}
              onEdit={() => showCustomize && setEditingAction('moveDown')}
              editable={showCustomize}
            />

            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'var(--border-subtle)',
              margin: 'var(--space-1) 0',
            }} />

            {/* Pause */}
            <ControlRow
              label="Pause"
              keys={controls.pause}
              isEditing={editingAction === 'pause'}
              onEdit={() => showCustomize && setEditingAction('pause')}
              editable={showCustomize}
            />
          </div>
        </Card>

        {/* Game Rules */}
        <Card size="md" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <RuleItem icon="target" text="First to 5 points wins" highlight="5 points" />
            <RuleItem icon="angle" text="Hit with paddle edge for sharper angles" />
            <RuleItem icon="speed" text="Ball speeds up with each rally" />
            <RuleItem icon="touch" text="On mobile, touch and drag to move" />
          </div>
        </Card>

        {/* Customize Toggle */}
        {showCustomize ? (
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetControls}
              style={{ flex: 1 }}
            >
              Reset to Default
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCustomize(false)}
              style={{ flex: 1 }}
            >
              Done Editing
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomize(true)}
            style={{
              width: '100%',
              padding: 'var(--space-2)',
              marginBottom: 'var(--space-4)',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              transition: 'color 0.2s ease-out',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            Customize Controls
          </button>
        )}

        {/* Dismiss button */}
        <Button size="lg" fullWidth onClick={handleDismiss}>
          Let's Play
        </Button>

        <div
          style={{
            marginTop: 'var(--space-4)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          Press any key or click to start
        </div>
      </div>
    </div>
  );
}

// Control row component
function ControlRow({
  label,
  keys,
  isEditing,
  onEdit,
  editable,
}: {
  label: string;
  keys: string[];
  isEditing: boolean;
  onEdit: () => void;
  editable: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-display)',
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        {isEditing ? (
          <div
            style={{
              padding: '6px 16px',
              background: 'rgba(0, 255, 170, 0.1)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-display)',
              animation: 'pulse 1s ease-in-out infinite',
            }}
          >
            Press a key...
          </div>
        ) : (
          <>
            {keys.map((key, i) => (
              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>or</span>}
                <kbd
                  onClick={editable ? onEdit : undefined}
                  style={{
                    minWidth: '36px',
                    height: '36px',
                    padding: '0 10px',
                    background: editable ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                    border: `1px solid ${editable ? 'var(--border-strong)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-base)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: editable ? 'pointer' : 'default',
                    transition: 'all 0.2s ease-out',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                  onMouseEnter={(e) => editable && (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onMouseLeave={(e) => editable && (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                >
                  {getKeyDisplayName(key)}
                </kbd>
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// Rule item component
function RuleItem({ icon, text, highlight }: { icon: string; text: string; highlight?: string }) {
  const iconMap: Record<string, string> = {
    target: '🎯',
    angle: '📐',
    speed: '⚡',
    touch: '👆',
  };

  // Replace highlight text with styled version
  let displayText: React.ReactNode = text;
  if (highlight) {
    const parts = text.split(highlight);
    displayText = (
      <>
        {parts[0]}
        <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{highlight}</span>
        {parts[1]}
      </>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <span style={{ fontSize: 'var(--text-base)' }}>{iconMap[icon]}</span>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
        {displayText}
      </span>
    </div>
  );
}

// Hook to check if tutorial should be shown
export function useTutorial(): [boolean, () => void] {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!hasTutorialBeenSeen()) {
      setShowTutorial(true);
    }
  }, []);

  const dismissTutorial = () => {
    markTutorialSeen();
    setShowTutorial(false);
  };

  return [showTutorial, dismissTutorial];
}

// Reset tutorial (for testing)
export function resetTutorial(): void {
  try {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}
