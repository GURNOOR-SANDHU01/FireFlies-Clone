/**
 * File: src/components/workspace/TranscriptHighlight.tsx
 *
 * Purpose:
 * Pure component for rendering transcript text with case-insensitive search query matches highlighted.
 *
 * Responsibilities:
 * - Delegate text chunking to getHighlightedChunks.
 * - Render non-matched text as normal spans and matched text as highlighted <mark> tags.
 * - Maintain high contrast and accessible styling for search matches.
 *
 * This component does NOT:
 * - Maintain state or mutate text.
 * - Intercept click events.
 */

'use client';

import React from 'react';
import { getHighlightedChunks } from '@/hooks/useTranscriptSearch';

export interface TranscriptHighlightProps {
  text: string;
  query: string;
}

export const TranscriptHighlight: React.FC<TranscriptHighlightProps> = ({ text, query }) => {
  if (!query || !query.trim()) {
    return <span>{text}</span>;
  }

  const chunks = getHighlightedChunks(text, query);

  return (
    <span>
      {chunks.map((chunk, index) =>
        chunk.isMatch ? (
          <mark
            key={index}
            style={{
              backgroundColor: 'var(--search-highlight-bg)',
              color: 'var(--search-highlight-text)',
              borderRadius: '3px',
              padding: '1px 3px',
              fontWeight: 600,
              boxShadow: '0 0 4px var(--primary-faint)',
            }}
          >
            {chunk.text}
          </mark>

        ) : (
          <React.Fragment key={index}>{chunk.text}</React.Fragment>
        )
      )}
    </span>
  );
};
