/**
 * File: src/types/meeting.ts
 *
 * Purpose:
 * Defines TypeScript interfaces and types for meeting entities, backend contracts, filters, and mutations.
 *
 * Responsibilities:
 * - Define domain shape of a Meeting record for frontend components.
 * - Define BackendMeeting wire representation returned by FastAPI.
 * - Define status, platform, and sorting enumerations.
 * - Define input contracts for creating and updating meetings.
 * - Define filter options used across the dashboard.
 *
 * This file does NOT:
 * - Perform validation or data transformations.
 * - Fetch or store meeting records.
 * - Contain UI-specific presentation logic.
 */

export type MeetingStatus = 'completed' | 'processing' | 'scheduled';

export type MeetingPlatform = 'google_meet' | 'zoom' | 'teams' | 'in_person' | 'audio_upload';

export interface Attendee {
  id?: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  isHost?: boolean;
}

export interface BackendParticipant {
  id?: string | null;
  name: string;
  email?: string | null;
  is_host?: boolean;
}

export interface BackendMeeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  platform: MeetingPlatform;
  status: MeetingStatus;
  audio_url?: string | null;
  has_transcript: boolean;
  participants: BackendParticipant[];
  action_items_count: number;
  completed_action_items_count: number;
  transcript_segments_count: number;
  summary_preview?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendMeetingListResponse {
  items: BackendMeeting[];
  total: number;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO 8601 string
  duration: number; // in seconds
  status: MeetingStatus;
  platform: MeetingPlatform;
  audioUrl?: string;
  attendees: Attendee[];
  tags: string[];
  summaryPreview?: string;
  actionItemsCount: number;
  completedActionItemsCount: number;
  transcriptSegmentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type MeetingSortField = 'date' | 'title' | 'duration';
export type SortOrder = 'asc' | 'desc';

export interface MeetingSortOption {
  field: MeetingSortField;
  order: SortOrder;
}

export interface MeetingFilterOptions {
  searchQuery?: string;
  participant?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: MeetingStatus | 'all';
  platform?: MeetingPlatform | 'all';
  tag?: string | 'all';
  sortBy?: MeetingSortOption;
  skip?: number;
  limit?: number;
}

export interface CreateMeetingInput {
  title: string;
  date: string;
  duration?: number;
  platform: MeetingPlatform;
  participants?: Array<string | { name: string; email?: string; is_host?: boolean }>;
  transcript_text?: string;
  description?: string;
  tags?: string[];
  audioUrl?: string;
}

export interface UpdateMeetingInput {
  title?: string;
  participants?: Array<string | { name: string; email?: string; is_host?: boolean }>;
  duration?: number;
  status?: MeetingStatus;
  platform?: MeetingPlatform;
  description?: string;
  tags?: string[];
}
