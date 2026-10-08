/**
 * File: src/components/workspace/Takeaways.tsx
 *
 * Purpose:
 * Visual component displaying key meeting takeaways in an executive bulleted format.
 *
 * Responsibilities:
 * - Render bulleted list of key takeaways extracted by backend AI summarizer.
 * - Display stylish bullet icons and readable typography.
 *
 * This component does NOT:
 * - Call AI APIs or LLM services.
 * - Mutate takeaway items.
 */

'use client';

import React from 'react';
import { SparklesIcon } from '@/components/common/Icons';

export interface TakeawaysProps {
  takeaways: string[];
}

export const Takeaways: React.FC<TakeawaysProps> = ({ takeaways }) => {
  if (!takeaways || takeaways.length === 0) {
    return (
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        No key takeaways generated for this meeting.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {takeaways.map((takeaway, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            padding: '0.6rem 0.85rem',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
          }}
        >
          <span
            style={{
              color: 'var(--accent-purple)',
              marginTop: '3px',
              flexShrink: 0,
            }}
          >
            <SparklesIcon size={14} />
          </span>
          <span>{takeaway}</span>
        </div>
      ))}
    </div>
  );
};
