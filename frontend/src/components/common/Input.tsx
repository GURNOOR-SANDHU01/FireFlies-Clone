/**
 * File: src/components/common/Input.tsx
 *
 * Purpose:
 * Form input component with prefix/suffix icon slots and consistent dark focus styling.
 *
 * Responsibilities:
 * - Render an HTML input element styled for the workspace theme.
 * - Support optional left and right icon decorators.
 * - Forward standard input attributes and events.
 *
 * This component does NOT:
 * - Perform form submission logic.
 * - Store values outside of React props.
 */

'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, rightIcon, className = '', wrapperClassName = '', style, ...props }, ref) => {
    return (
      <div
        className={wrapperClassName}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {leftIcon && (
          <span
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={className}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '0.55rem 0.85rem',
            paddingLeft: leftIcon ? '2.4rem' : '0.85rem',
            paddingRight: rightIcon ? '2.4rem' : '0.85rem',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-focus)';
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--primary-faint)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-medium)';
            e.currentTarget.style.boxShadow = 'none';
            props.onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && (
          <span
            style={{
              position: 'absolute',
              right: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
