// ============================================
// LAST RALLY - BADGE COMPONENT
// Status indicators and labels
// ============================================

import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'sm', style, children, ...props }, ref) => {
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        padding: '2px 8px',
        fontSize: 'var(--text-xs)',
      },
      md: {
        padding: '4px 10px',
        fontSize: 'var(--text-sm)',
      },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        background: 'var(--bg-elevated)',
        color: 'var(--text-secondary)',
      },
      success: {
        background: 'rgba(34, 197, 94, 0.15)',
        color: 'var(--color-success)',
      },
      warning: {
        background: 'rgba(245, 158, 11, 0.15)',
        color: 'var(--color-warning)',
      },
      error: {
        background: 'rgba(239, 68, 68, 0.15)',
        color: 'var(--color-error)',
      },
      info: {
        background: 'rgba(59, 130, 246, 0.15)',
        color: 'var(--color-info)',
      },
    };

    return (
      <span
        ref={ref}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontFamily: 'var(--font-ui)',
          fontWeight: 'var(--font-medium)',
          borderRadius: 'var(--radius-full)',
          whiteSpace: 'nowrap',
          ...sizeStyles[size],
          ...variantStyles[variant],
          ...style,
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
