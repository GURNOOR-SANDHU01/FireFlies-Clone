/**
 * File: src/components/workspace/TranscriptLine.tsx
 *
 * Purpose:
 * Individual transcript utterance row displaying speaker avatar, formatted timestamp, and searchable dialogue text.
 *
 * Responsibilities:
 * - Display speaker avatar, speaker name, timecode (MM:SS), and spoken text.
 * - Visually highlight when the segment is active (currently being played by audio).
 * - Trigger audio seek when clicked or activated with Enter/Space keyboard navigation.
 * - Highlight search terms within the utterance dialogue via TranscriptHighlight.
 * - Register its DOM element with the synchronization hook for auto-scrolling.
 *
 * This component does NOT:
 * - Track audio currentTime directly (receives isActive and onSeek from parent hook).
 * - Mutate transcript segment data.
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { TranscriptSegment } from '@/types/transcript';
import { formatTimeCode } from '@/lib/formatters';
import { SpeakerAvatar } from './SpeakerAvatar';
import { TranscriptHighlight } from './TranscriptHighlight';

export interface TranscriptLineProps {
  segment: TranscriptSegment;
  isActive: boolean;
  searchQuery: string;
  onSeek: (startTime: number) => void;
  onRegisterRef?: (segmentId: string, el: HTMLElement | null) => void;
}

export const TranscriptLine: React.FC<TranscriptLineProps> = ({
  segment,
  isActive,
  searchQuery,
  onSeek,
  onRegisterRef,
}) => {
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (onRegisterRef) {
      onRegisterRef(segment.id, lineRef.current);
    }
    return () => {
      if (onRegisterRef) {
        onRegisterRef(segment.id, null);
      }
    };
  }, [segment.id, onRegisterRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSeek(segment.startTime);
    }
  };

  return (
    <div
      ref={lineRef}
      role="button"
      tabIndex={0}
      aria-label={`${segment.speaker} at ${formatTimeCode(segment.startTime)}: ${segment.text}`}
      aria-current={isActive ? 'time' : undefined}
      onClick={() => onSeek(segment.startTime)}
      onKeyDown={handleKeyDown}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.9rem',
        padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: isActive ? 'var(--primary-faint)' : 'transparent',
        borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
        transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
        cursor: 'pointer',
        position: 'relative',
        outline: 'none',
        marginBottom: '0.35rem',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}

      onFocus={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 2px var(--primary-glow)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Speaker Avatar */}
      <SpeakerAvatar name={segment.speaker} size={34} />

      {/* Utterance Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Speaker Name & Clickable Timestamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '0.25rem',
          }}
        >
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: isActive ? 'var(--primary)' : 'var(--text-primary)',
              transition: 'color var(--transition-fast)',
            }}
          >
            {segment.speaker}
          </span>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 500,
              fontFamily: 'monospace',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--primary-glow)' : 'var(--bg-elevated)',
              padding: '0.1rem 0.4rem',

              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {formatTimeCode(segment.startTime)}
          </span>

          {isActive && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                boxShadow: '0 0 8px var(--primary)',
                animation: 'pulse 1.5s infinite',
              }}
            />
          )}
        </div>

        {/* Utterance Text with Search Highlight */}
        <p
          style={{
            fontSize: '0.9rem',
            lineHeight: 1.55,
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            wordBreak: 'break-word',
          }}
        >
          <TranscriptHighlight text={segment.text} query={searchQuery} />
        </p>
      </div>
    </div>
  );
};
