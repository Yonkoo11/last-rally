// ============================================
// LAST RALLY - BUTTON COMPONENT
// Clean, minimal, accessible - CSS class-based
// ============================================

import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', style, children, ...props }, ref) => {
    // Build class names
    const classes = [
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        style={{
          width: fullWidth ? '100%' : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
