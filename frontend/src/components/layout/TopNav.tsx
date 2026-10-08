/**
 * File: src/components/layout/TopNav.tsx
 *
 * Purpose:
 * Header navigation bar for workspace context, quick action triggers, and user profile.
 *
 * Responsibilities:
 * - Display active workspace name and switch breadcrumb.
 * - Provide "+ New Meeting" primary action button triggering callback.
 * - Display user avatar and environment indicator.
 *
 * This component does NOT:
 * - Manage meetings data or perform mutations directly.
 * - Define modal dialog content or forms.
 */

'use client';

import React from 'react';
import { Button } from '@/components/common/Button';
import { PlusIcon, SunIcon, MoonIcon } from '@/components/common/Icons';
import { useTheme } from '@/context/ThemeContext';

export interface TopNavProps {
  onNewMeetingClick?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onNewMeetingClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-canvas)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        flexShrink: 0,
        transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
      }}
    >
      {/* Workspace Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-faint)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8rem',
            border: '1px solid var(--border-medium)',
          }}
        >
          E
        </div>
        <div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Elena&apos;s Workspace
          </span>
          <span
            style={{
              marginLeft: '0.5rem',
              fontSize: '0.7rem',
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            Pro Plan
          </span>
        </div>
      </div>

      {/* Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
          aria-label={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--border-medium)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusIcon size={16} />}
          onClick={onNewMeetingClick}
        >
          New Meeting
        </Button>

        {/* User Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingLeft: '0.75rem',
            borderLeft: '1px solid var(--border-subtle)',
          }}
        >
          <div
            title="Elena Rostova (Account Profile)"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-purple)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.35)',
              cursor: 'default',
            }}
          >
            ER
          </div>
        </div>
      </div>
    </header>
  );
};

