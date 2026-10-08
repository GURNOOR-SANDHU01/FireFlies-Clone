/**
 * File: src/components/workspace/TopicsPanel.tsx
 *
 * Purpose:
 * Chapters and topics breakdown panel allowing users to jump directly to conversational segments.
 *
 * Responsibilities:
 * - Display chapter list with timecodes, titles, and optional descriptions.
 * - Call audio seek handler when a chapter timecode or row is clicked.
 * - Highlight chapter corresponding to active audio timecode.
 *
 * This component does NOT:
 * - Own audio player state (delegates seeking to onSeek prop).
 * - Mutate topic data.
 */

'use client';

import React from 'react';
import { MeetingTopic } from '@/types/summary';
import { formatTimeCode } from '@/lib/formatters';
import { ClockIcon } from '@/components/common/Icons';

export interface TopicsPanelProps {
  topics: MeetingTopic[];
  currentTime: number;
  onSeek: (startTime: number) => void;
}

export const TopicsPanel: React.FC<TopicsPanelProps> = ({ topics, currentTime, onSeek }) => {
  if (!topics || topics.length === 0) {
    return (
      <div
        style={{
          padding: '2rem 1rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <p>No chapters or topics recorded for this meeting.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {topics.map((topic) => {
        const isCurrentTopic =
          currentTime >= topic.startTime && currentTime < topic.endTime;

        return (
          <div
            key={topic.id}
            role="button"
            tabIndex={0}
            onClick={() => onSeek(topic.startTime)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSeek(topic.startTime);
              }
            }}
            aria-label={`Jump to ${topic.title} at ${formatTimeCode(topic.startTime)}`}
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: isCurrentTopic ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)',
              border: isCurrentTopic
                ? '1px solid rgba(99, 102, 241, 0.35)'
                : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isCurrentTopic) {
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isCurrentTopic) {
                e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: topic.description ? '0.35rem' : 0,
              }}
            >
              <h4
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isCurrentTopic ? 'var(--primary)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {topic.title}
              </h4>

              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  color: isCurrentTopic ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isCurrentTopic
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'var(--bg-elevated)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  flexShrink: 0,
                }}
              >
                <ClockIcon size={12} />
                {formatTimeCode(topic.startTime)}
              </span>
            </div>

            {topic.description && (
              <p
                style={{
                  fontSize: '0.8rem',
                  lineHeight: 1.45,
                  color: 'var(--text-muted)',
                }}
              >
                {topic.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
