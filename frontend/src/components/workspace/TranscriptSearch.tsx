/**
 * File: src/components/workspace/TranscriptSearch.tsx
 *
 * Purpose:
 * Interactive search bar component for querying dialogue text across transcript lines.
 *
 * Responsibilities:
 * - Provide search text input with instant feedback.
 * - Render match counter (e.g. "3 matches" or "2 of 5").
 * - Provide next/previous match navigation controls.
 * - Provide one-click clear search button.
 *
 * This component does NOT:
 * - Mutate transcript segments.
 * - Manage audio playback.
 */

'use client';

import React from 'react';
import { SearchIcon, XIcon, ChevronDownIcon } from '@/components/common/Icons';

export interface TranscriptSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear: () => void;
  totalMatches: number;
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
}

export const TranscriptSearch: React.FC<TranscriptSearchProps> = ({
  searchQuery,
  onSearchChange,
  onClear,
  totalMatches,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'var(--bg-input)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.4rem 0.75rem',
        transition: 'border-color var(--transition-fast)',
        flex: 1,
        minWidth: '220px',
      }}
      onFocusCapture={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary)';
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
    >
      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
        <SearchIcon size={16} />
      </span>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search transcript dialogue..."
        aria-label="Search transcript"
        style={{
          background: 'none',
          border: 'none',
          outline: 'none',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          width: '100%',
        }}
      />

      {/* Match Count Indicator & Next/Prev Controls */}
      {searchQuery.trim() && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 500,
              color: totalMatches > 0 ? '#fbbf24' : 'var(--text-muted)',
              backgroundColor: totalMatches > 0 ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {totalMatches > 0
              ? `${currentMatchIndex} of ${totalMatches}`
              : '0 matches'}
          </span>

          {totalMatches > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <button
                type="button"
                onClick={onPrevMatch}
                title="Previous match"
                aria-label="Previous match"
                style={{
                  color: 'var(--text-muted)',
                  padding: '2px',
                  borderRadius: '3px',
                  display: 'flex',
                  transform: 'rotate(180deg)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <ChevronDownIcon size={14} />
              </button>
              <button
                type="button"
                onClick={onNextMatch}
                title="Next match"
                aria-label="Next match"
                style={{
                  color: 'var(--text-muted)',
                  padding: '2px',
                  borderRadius: '3px',
                  display: 'flex',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <ChevronDownIcon size={14} />
              </button>
            </div>
          )}

          {/* Clear button */}
          <button
            type="button"
            onClick={onClear}
            title="Clear search"
            aria-label="Clear search"
            style={{
              color: 'var(--text-muted)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-sm)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <XIcon size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
