/**
 * File: src/types/summary.ts
 *
 * Purpose:
 * Defines TypeScript interfaces for meeting AI summaries, key topics, and chapters.
 *
 * Responsibilities:
 * - Define backend wire response types for summary and topic chapters.
 * - Define domain models for executive summary and topics.
 *
 * This file does NOT:
 * - Call AI APIs or LLM services.
 * - Perform summary text parsing.
 * - Render summary tabs or widgets.
 */

export interface BackendTopic {
  id: string;
  meeting_id: string;
  title: string;
  description?: string | null;
  start_time: number;
  end_time: number;
  sequence_order: number;
}

export interface BackendTopicListResponse {
  meeting_id: string;
  topics: BackendTopic[];
  total: number;
}

export interface BackendSummary {
  id: string;
  meeting_id: string;
  overview: string;
  key_takeaways: string[];
  generated_at: string;
}

export interface MeetingTopic {
  id: string;
  meetingId: string;
  title: string;
  description?: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  sequenceOrder: number;
}

export interface MeetingSummary {
  id: string;
  meetingId: string;
  overview: string;
  keyTakeaways: string[];
  generatedAt: string;
}
