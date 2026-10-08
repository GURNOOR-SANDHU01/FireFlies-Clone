/**
 * File: src/hooks/useTranscriptSync.ts
 *
 * Purpose:
 * Custom React hook managing bidirectional synchronization between media playback time and transcript lines.
 *
 * Responsibilities:
 * - Audio -> Transcript: Derive the active transcript segment from audio currentTime.
 * - Auto-scroll: Smoothly scroll the newly active transcript line into viewport when the active segment changes.
 * - Transcript -> Audio: Dispatch seek requests when transcript timestamps or lines are clicked.
 * - Keep line references and container reference without triggering excessive re-renders.
 *
 * This hook does NOT:
 * - Directly control audio play/pause hardware states.
 * - Mutate transcript segments.
 * - Render JSX components.
 */

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TranscriptSegment } from '@/types/transcript';

export interface UseTranscriptSyncOptions {
  segments: TranscriptSegment[];
  currentTime: number;
  seek: (timeInSeconds: number) => void;
  defaultAutoScroll?: boolean;
}

export interface UseTranscriptSyncReturn {
  activeSegmentId: string | null;
  activeSegment: TranscriptSegment | null;
  handleSeekToSegment: (startTime: number) => void;
  registerLineRef: (segmentId: string, el: HTMLElement | null) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  autoScroll: boolean;
  setAutoScroll: (enabled: boolean) => void;
  scrollToSegment: (segmentId: string) => void;
}

export function useTranscriptSync({
  segments,
  currentTime,
  seek,
  defaultAutoScroll = true,
}: UseTranscriptSyncOptions): UseTranscriptSyncReturn {
  const [autoScroll, setAutoScroll] = useState<boolean>(defaultAutoScroll);
  const lineRefs = useRef<Map<string, HTMLElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastActiveIdRef = useRef<string | null>(null);

  /**
   * Determine the active segment based on current audio time.
   * Handles utterance duration and brief pauses between speakers.
   */
  const activeSegment = useMemo(() => {
    if (!segments || segments.length === 0) return null;

    // Direct match: startTime <= currentTime < endTime
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const nextSeg = segments[i + 1];

      // If within this segment's active range
      if (currentTime >= seg.startTime && currentTime < seg.endTime) {
        return seg;
      }

      // If in pause between current and next segment, keep current segment active
      if (
        nextSeg &&
        currentTime >= seg.endTime &&
        currentTime < nextSeg.startTime
      ) {
        return seg;
      }
    }

    // Edge cases: if before the first segment
    if (currentTime < segments[0].startTime) {
      return segments[0];
    }

    // If past the last segment
    const lastSeg = segments[segments.length - 1];
    if (currentTime >= lastSeg.startTime) {
      return lastSeg;
    }

    return null;
  }, [segments, currentTime]);

  const activeSegmentId = activeSegment ? activeSegment.id : null;

  /**
   * Registers a transcript line DOM element.
   */
  const registerLineRef = useCallback((segmentId: string, el: HTMLElement | null) => {
    if (el) {
      lineRefs.current.set(segmentId, el);
    } else {
      lineRefs.current.delete(segmentId);
    }
  }, []);

  /**
   * Smoothly scrolls a specific segment line into view within the transcript panel container.
   */
  const scrollToSegment = useCallback((segmentId: string) => {
    const el = lineRefs.current.get(segmentId);
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, []);

  /**
   * Auto-scroll effect: only fires when the ACTIVE segment changes,
   * avoiding costly DOM layout shifts on every 100ms audio tick.
   */
  useEffect(() => {
    if (!activeSegmentId) return;

    if (activeSegmentId !== lastActiveIdRef.current) {
      lastActiveIdRef.current = activeSegmentId;

      if (autoScroll) {
        scrollToSegment(activeSegmentId);
      }
    }
  }, [activeSegmentId, autoScroll, scrollToSegment]);

  /**
   * Transcript -> Audio seek handler.
   */
  const handleSeekToSegment = useCallback(
    (startTime: number) => {
      seek(startTime);
    },
    [seek]
  );

  return {
    activeSegmentId,
    activeSegment,
    handleSeekToSegment,
    registerLineRef,
    scrollContainerRef,
    autoScroll,
    setAutoScroll,
    scrollToSegment,
  };
}
