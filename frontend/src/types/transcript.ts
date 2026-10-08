/**
 * File: src/types/transcript.ts
 *
 * Purpose:
 * Defines TypeScript interfaces for meeting transcripts, speaker metadata, and timestamp ranges.
 *
 * Responsibilities:
 * - Define the shape of individual transcript segments and speaker info.
 * - Define backend wire response types for transcript endpoints.
 * - Model timestamp ranges for playback synchronization.
 * - Define search highlight structures for matching query occurrences.
 *
 * This file does NOT:
 * - Perform transcript synchronization logic.
 * - Perform regex matching or text parsing.
 * - Render transcript UI components.
 */

export interface BackendTranscriptSegment {
  id: string;
  meeting_id: string;
  speaker: string;
  start_time: number;
  end_time: number;
  text: string;
  sequence_order: number;
}

export interface BackendTranscriptListResponse {
  meeting_id: string;
  segments: BackendTranscriptSegment[];
  total_segments: number;
}

export interface TranscriptSegment {
  id: string;
  meetingId: string;
  speaker: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
  sequenceOrder: number;
}

export interface SearchMatch {
  segmentId: string;
  startOffset: number;
  endOffset: number;
  matchedText: string;
}
