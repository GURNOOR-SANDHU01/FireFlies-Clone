/**
 * File: src/services/meetingDetailService.ts
 *
 * Purpose:
 * Dedicated API service layer for fetching all meeting detail data subsets
 * (meeting metadata, transcript segments, AI summaries, chapters/topics, and action items).
 *
 * Responsibilities:
 * - Dispatch HTTP requests for GET /meetings/{id}, /transcript, /summary, /topics, and /action-items.
 * - Transform raw snake_case backend payloads into frontend domain models.
 * - Safely handle missing or empty summaries without crashing the workspace.
 *
 * This file does NOT:
 * - Maintain React state or component lifecycle.
 * - Play or seek audio media.
 * - Render UI or toast notifications.
 */

import { apiClient } from './apiClient';
import { meetingService } from './meetingService';
import { actionItemService } from './actionItemService';
import { Meeting } from '@/types/meeting';
import {
  BackendTranscriptListResponse,
  BackendTranscriptSegment,
  TranscriptSegment,
} from '@/types/transcript';
import {
  BackendSummary,
  BackendTopic,
  BackendTopicListResponse,
  MeetingSummary,
  MeetingTopic,
} from '@/types/summary';
import { ActionItem } from '@/types/actionItem';

function transformTranscriptSegment(raw: BackendTranscriptSegment): TranscriptSegment {
  return {
    id: raw.id,
    meetingId: raw.meeting_id,
    speaker: raw.speaker,
    startTime: raw.start_time,
    endTime: raw.end_time,
    text: raw.text,
    sequenceOrder: raw.sequence_order,
  };
}

function transformTopic(raw: BackendTopic): MeetingTopic {
  return {
    id: raw.id,
    meetingId: raw.meeting_id,
    title: raw.title,
    description: raw.description || undefined,
    startTime: raw.start_time,
    endTime: raw.end_time,
    sequenceOrder: raw.sequence_order,
  };
}

function transformSummary(raw: BackendSummary): MeetingSummary {
  return {
    id: raw.id,
    meetingId: raw.meeting_id,
    overview: raw.overview,
    keyTakeaways: raw.key_takeaways || [],
    generatedAt: raw.generated_at,
  };
}

export const meetingDetailService = {
  /**
   * Fetches meeting metadata by ID.
   */
  async getMeeting(id: string): Promise<Meeting> {
    return meetingService.getMeetingById(id);
  },

  /**
   * Fetches the complete sequence of transcript utterances for the meeting.
   */
  async getTranscript(id: string): Promise<TranscriptSegment[]> {
    const response = await apiClient.get<BackendTranscriptListResponse>(
      `/meetings/${id}/transcript`
    );
    return (response.segments || []).map(transformTranscriptSegment);
  },

  /**
   * Fetches the executive AI summary and key takeaways for the meeting.
   */
  async getSummary(id: string): Promise<MeetingSummary | null> {
    try {
      const response = await apiClient.get<BackendSummary>(`/meetings/${id}/summary`);
      return transformSummary(response);
    } catch {
      // If summary is not yet generated or 404, gracefully return null
      return null;
    }
  },

  /**
   * Fetches chapters / topics for the meeting.
   */
  async getTopics(id: string): Promise<MeetingTopic[]> {
    const response = await apiClient.get<BackendTopicListResponse>(`/meetings/${id}/topics`);
    return (response.topics || []).map(transformTopic);
  },

  /**
   * Fetches action items associated with the meeting.
   */
  async getActionItems(id: string): Promise<ActionItem[]> {
    return actionItemService.getActionItems(id);
  },

  /**
   * Helper to fetch all meeting detail resources concurrently.
   */
  async getFullMeetingDetail(id: string): Promise<{
    meeting: Meeting;
    transcript: TranscriptSegment[];
    summary: MeetingSummary | null;
    topics: MeetingTopic[];
    actionItems: ActionItem[];
  }> {
    const [meeting, transcript, summary, topics, actionItems] = await Promise.all([
      meetingDetailService.getMeeting(id),
      meetingDetailService.getTranscript(id),
      meetingDetailService.getSummary(id),
      meetingDetailService.getTopics(id),
      meetingDetailService.getActionItems(id),
    ]);

    return {
      meeting,
      transcript,
      summary,
      topics,
      actionItems,
    };
  },
};
