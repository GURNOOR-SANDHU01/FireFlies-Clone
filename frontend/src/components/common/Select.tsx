/**
 * File: src/components/common/Select.tsx
 *
 * Purpose:
 * Dropdown select element styled for dark workspace theme.
 *
 * Responsibilities:
 * - Render an HTML select element with standardized options and dark styling.
 * - Accept options list or nested option children.
 *
 * This component does NOT:
 * - Manage asynchronous select options.
 * - Contain domain filter logic.
 */

'use client';

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  label?: string;
  wrapperClassName?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  children,
  label,
  className = '',
  wrapperClassName = '',
  style,
  ...props
}) => {
  return (
    <div
      className={wrapperClassName}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}
    >
      {label && (
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <select
          className={className}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '0.55rem 2rem 0.55rem 0.85rem',
            fontSize: '0.875rem',
            outline: 'none',
            cursor: 'pointer',
            transition: 'border-color var(--transition-fast)',
            ...style,
          }}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {opt.label}
                </option>
              ))
            : children}

        </select>
        <span
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>
    </div>
  );
};
