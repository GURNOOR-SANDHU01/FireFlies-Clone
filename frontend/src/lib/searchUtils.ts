/**
 * File: src/lib/searchUtils.ts
 *
 * Purpose:
 * Pure utility functions for search highlighting and snippet matching.
 *
 * Responsibilities:
 * - Split text into matched and non-matched chunks for UI highlights.
 * - Find match indices in transcript and summary text.
 *
 * This file does NOT:
 * - Render DOM elements directly.
 * - Store active search state.
 * - Query network or database resources.
 */

export interface HighlightChunk {
  text: string;
  isMatch: boolean;
}

/**
 * Splits a text into segments of matched and unmatched chunks based on a query.
 */
export function getHighlightedChunks(text: string, query: string): HighlightChunk[] {
  if (!text) return [];
  if (!query || query.trim() === '') {
    return [{ text, isMatch: false }];
  }

  const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      isMatch: part.toLowerCase() === query.trim().toLowerCase()
    }));
}
