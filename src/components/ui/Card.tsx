// ============================================
// LAST RALLY - CARD COMPONENT
// Premium depth with layered shadows - CSS class-based
// ============================================

import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    // Build class names
    const classes = [
      'card',
      variant !== 'default' && `card--${variant}`,
      `card--${size}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
