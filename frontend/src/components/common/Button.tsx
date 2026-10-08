/**
 * File: src/components/common/Button.tsx
 *
 * Purpose:
 * Reusable button primitive supporting consistent visual variants, sizes, and states.
 *
 * Responsibilities:
 * - Render an interactive HTML button with styling variants (primary, secondary, outline, ghost, danger).
 * - Handle loading and disabled states gracefully.
 * - Accept leading and trailing icon slots.
 *
 * This component does NOT:
 * - Perform business logic or execute API queries.
 * - Maintain application state outside of its immediate click handler.
 */

'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  style,
  ...props
}) => {
  // Variant styles
  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: 'var(--accent-gradient)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
    },
    secondary: {
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-medium)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-medium)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid transparent',
    },
    danger: {
      background: 'var(--status-danger-bg)',
      color: 'var(--status-danger)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
    },
  };

  // Size styles
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: {
      padding: '0.35rem 0.65rem',
      fontSize: '0.8rem',
      borderRadius: 'var(--radius-sm)',
      gap: '0.35rem',
    },
    md: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      borderRadius: 'var(--radius-md)',
      gap: '0.5rem',
    },
    lg: {
      padding: '0.75rem 1.4rem',
      fontSize: '1rem',
      borderRadius: 'var(--radius-md)',
      gap: '0.65rem',
    },
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button disabled={disabled || isLoading} style={baseStyle} className={className} {...props}>
      {isLoading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
};
