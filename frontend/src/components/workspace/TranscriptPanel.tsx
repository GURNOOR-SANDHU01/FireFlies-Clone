/**
 * File: src/components/workspace/TranscriptPanel.tsx
 *
 * Purpose:
 * Main interactive transcript panel featuring search filter bar, auto-scroll toggle,
 * and a scrollable list of utterance lines.
 *
 * Responsibilities:
 * - Render TranscriptSearch header with match count and navigation.
 * - Render Auto-scroll toggle affordance.
 * - Map over transcript segments to render TranscriptLine items.
 * - Highlight active segment and wire up seek callbacks.
 * - Display empty state when search query returns no dialogue matches.
 *
 * This component does NOT:
 * - Own audio player state (receives activeSegmentId and onSeek from props).
 * - Make API calls.
 */

'use client';

import React from 'react';
import { TranscriptSegment } from '@/types/transcript';
import { TranscriptLine } from './TranscriptLine';
import { TranscriptSearch } from './TranscriptSearch';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchIcon } from '@/components/common/Icons';

export interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  filteredSegments: TranscriptSegment[];
  activeSegmentId: string | null;
  searchQuery: string;
  totalMatches: number;
  currentMatchIndex: number;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onSeek: (startTime: number) => void;
  onRegisterRef: (segmentId: string, el: HTMLElement | null) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  autoScroll: boolean;
  onToggleAutoScroll: (enabled: boolean) => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  segments,
  filteredSegments,
  activeSegmentId,
  searchQuery,
  totalMatches,
  currentMatchIndex,
  onSearchChange,
  onClearSearch,
  onNextMatch,
  onPrevMatch,
  onSeek,
  onRegisterRef,
  scrollContainerRef,
  autoScroll,
  onToggleAutoScroll,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '480px',
        overflow: 'hidden',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: '0.9rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(13, 18, 31, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Transcript
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-elevated)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {segments.length} utterances
            </span>
          </div>

          {/* Auto-scroll toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              color: autoScroll ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => onToggleAutoScroll(e.target.checked)}
              style={{
                accentColor: 'var(--primary)',
                cursor: 'pointer',
              }}
            />
            <span>Auto-scroll</span>
          </label>
        </div>

        {/* Search Bar */}
        <TranscriptSearch
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onClear={onClearSearch}
          totalMatches={totalMatches}
          currentMatchIndex={currentMatchIndex}
          onNextMatch={onNextMatch}
          onPrevMatch={onPrevMatch}
        />
      </div>

      {/* Scrollable Dialogue List */}
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem 0.85rem',
        }}
      >
        {segments.length === 0 ? (
          <div style={{ padding: '3rem 1rem' }}>
            <EmptyState
              icon={<SearchIcon size={24} />}
              title="No transcript available"
              description="This meeting does not have an automated transcript recorded."
            />
          </div>
        ) : filteredSegments.length === 0 ? (
          <div style={{ padding: '3rem 1rem' }}>
            <EmptyState
              icon={<SearchIcon size={24} />}
              title="No matches found"
              description={`No dialogue segments matched "${searchQuery}".`}
              actionLabel="Clear Search"
              onAction={onClearSearch}
            />
          </div>
        ) : (
          filteredSegments.map((segment) => (
            <TranscriptLine
              key={segment.id}
              segment={segment}
              isActive={segment.id === activeSegmentId}
              searchQuery={searchQuery}
              onSeek={onSeek}
              onRegisterRef={onRegisterRef}
            />
          ))
        )}
      </div>
    </div>
  );
};
