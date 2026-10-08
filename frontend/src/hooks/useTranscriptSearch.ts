/**
 * File: src/hooks/useTranscriptSearch.ts
 *
 * Purpose:
 * Custom React hook and pure utilities for case-insensitive transcript text searching and match highlighting.
 *
 * Responsibilities:
 * - Maintain search query state and compute matching transcript segments.
 * - Compute total occurrences count and active match index.
 * - Provide next/previous match navigation.
 * - Provide pure text splitting utility for visual highlighting without mutating original data.
 *
 * This hook does NOT:
 * - Mutate transcript segment objects.
 * - Make server requests (search is strictly client-side).
 * - Render JSX components.
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { TranscriptSegment } from '@/types/transcript';

export interface TextChunk {
  text: string;
  isMatch: boolean;
}

/**
 * Pure utility function to split a string into chunks of matched and unmatched text.
 * Case-insensitive, safely escapes regex special characters.
 */
export function getHighlightedChunks(text: string, query: string): TextChunk[] {
  if (!query || !query.trim() || !text) {
    return [{ text, isMatch: false }];
  }

  const trimmedQuery = query.trim();
  // Escape regex special chars: [ ] / { } ( ) * + ? . \ ^ $ |
  const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      isMatch: part.toLowerCase() === trimmedQuery.toLowerCase(),
    }));
}

export interface SearchMatchLocation {
  segmentId: string;
  startTime: number;
}

export interface UseTranscriptSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  totalMatches: number;
  currentMatchIndex: number;
  nextMatch: () => void;
  prevMatch: () => void;
  currentMatch: SearchMatchLocation | null;
  matchingSegmentIds: Set<string>;
  filteredSegments: TranscriptSegment[];
  isFiltering: boolean;
  filterOnlyMatches: boolean;
  setFilterOnlyMatches: (filterOnly: boolean) => void;
}

export function useTranscriptSearch(segments: TranscriptSegment[]): UseTranscriptSearchReturn {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [filterOnlyMatches, setFilterOnlyMatches] = useState<boolean>(false);

  // Compute all match instances across all segments
  const { allMatches, matchingSegmentIds } = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    const ids = new Set<string>();
    const matches: SearchMatchLocation[] = [];

    if (!trimmed || !segments || segments.length === 0) {
      return { allMatches: matches, matchingSegmentIds: ids };
    }

    segments.forEach((seg) => {
      const textLower = seg.text.toLowerCase();
      let startIndex = 0;
      let hasMatch = false;

      while ((startIndex = textLower.indexOf(trimmed, startIndex)) !== -1) {
        hasMatch = true;
        matches.push({
          segmentId: seg.id,
          startTime: seg.startTime,
        });
        startIndex += trimmed.length;
      }

      if (hasMatch) {
        ids.add(seg.id);
      }
    });

    return { allMatches: matches, matchingSegmentIds: ids };
  }, [segments, searchQuery]);

  const totalMatches = allMatches.length;

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentMatchIndex(0);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentMatchIndex(0);
  }, []);

  const nextMatch = useCallback(() => {
    if (totalMatches === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % totalMatches);
  }, [totalMatches]);

  const prevMatch = useCallback(() => {
    if (totalMatches === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + totalMatches) % totalMatches);
  }, [totalMatches]);

  const currentMatch = useMemo(() => {
    if (totalMatches === 0 || currentMatchIndex >= totalMatches) return null;
    return allMatches[currentMatchIndex];
  }, [allMatches, totalMatches, currentMatchIndex]);

  // Optionally filter segments to only those containing matches when filterOnlyMatches is toggled
  const filteredSegments = useMemo(() => {
    if (!filterOnlyMatches || !searchQuery.trim()) {
      return segments;
    }
    return segments.filter((seg) => matchingSegmentIds.has(seg.id));
  }, [segments, filterOnlyMatches, searchQuery, matchingSegmentIds]);

  return {
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    clearSearch,
    totalMatches,
    currentMatchIndex: totalMatches > 0 ? currentMatchIndex + 1 : 0,
    nextMatch,
    prevMatch,
    currentMatch,
    matchingSegmentIds,
    filteredSegments,
    isFiltering: Boolean(searchQuery.trim()),
    filterOnlyMatches,
    setFilterOnlyMatches,
  };
}
