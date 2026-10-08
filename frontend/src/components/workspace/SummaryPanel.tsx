/**
 * File: src/components/workspace/SummaryPanel.tsx
 *
 * Purpose:
 * Executive AI summary panel displaying the high-level meeting overview and key takeaways.
 *
 * Responsibilities:
 * - Display AI overview narrative paragraph.
 * - Render Key Takeaways section via Takeaways component.
 * - Display AI badge indicator.
 * - Handle empty or loading state when summary is absent.
 *
 * This component does NOT:
 * - Generate LLM text or call external AI endpoints.
 * - Manage audio player state.
 */

'use client';

import React from 'react';
import { MeetingSummary } from '@/types/summary';
import { Takeaways } from './Takeaways';
import { SparklesIcon } from '@/components/common/Icons';

export interface SummaryPanelProps {
  summary: MeetingSummary | null;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ summary }) => {
  if (!summary) {
    return (
      <div
        style={{
          padding: '2rem 1rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <p>No AI summary generated for this meeting yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview Card */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '0.75rem',
          }}
        >
          <span style={{ color: 'var(--accent-purple)' }}>
            <SparklesIcon size={16} />
          </span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Executive Overview
          </h3>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 500,
              color: 'var(--accent-purple)',
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              marginLeft: 'auto',
            }}
          >
            AI Generated
          </span>
        </div>

        <p
          style={{
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '1rem 1.15rem',
          }}
        >
          {summary.overview}
        </p>
      </div>

      {/* Key Takeaways Card */}
      <div>
        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
          }}
        >
          Key Takeaways
        </h3>
        <Takeaways takeaways={summary.keyTakeaways} />
      </div>
    </div>
  );
};
