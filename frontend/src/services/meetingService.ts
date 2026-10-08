/**
 * File: src/services/meetingService.ts
 *
 * Purpose:
 * Service layer for meeting entity operations communicating with the FastAPI backend.
 *
 * Responsibilities:
 * - Dispatch HTTP requests for fetching, creating, updating, and deleting meetings.
 * - Translate frontend MeetingFilterOptions into backend URL query parameters.
 * - Transform BackendMeeting API response payloads into frontend Meeting domain models.
 * - Re-throw typed ApiError instances so calling hooks/UI can respond to server states.
 *
 * This file does NOT:
 * - Use mock data fallbacks (backend is the single source of truth).
 * - Manage React state or lifecycle.
 * - Render UI or toast notifications.
 */

import { apiClient } from './apiClient';
import {
  BackendMeeting,
  BackendMeetingListResponse,
  CreateMeetingInput,
  Meeting,
  MeetingFilterOptions,
  UpdateMeetingInput,
} from '@/types/meeting';

/**
 * Transforms a backend wire representation into a typed frontend Meeting model.
 */
function transformBackendMeeting(raw: BackendMeeting): Meeting {
  return {
    id: raw.id,
    title: raw.title,
    date: raw.date,
    duration: raw.duration,
    status: raw.status,
    platform: raw.platform,
    audioUrl: raw.audio_url || undefined,
    attendees: (raw.participants || []).map((p, i) => ({
      id: p.id || `att-${raw.id}-${i}`,
      name: p.name,
      email: p.email || '',
      isHost: Boolean(p.is_host),
    })),
    tags: [raw.platform.replace('_', ' ')],
    summaryPreview: raw.summary_preview || undefined,
    actionItemsCount: raw.action_items_count || 0,
    completedActionItemsCount: raw.completed_action_items_count || 0,
    transcriptSegmentsCount: raw.transcript_segments_count || 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export const meetingService = {
  /**
   * Fetches paginated meetings matching query filters from GET /api/v1/meetings.
   */
  async getMeetings(filters?: MeetingFilterOptions): Promise<{ meetings: Meeting[]; total: number }> {
    const params = new URLSearchParams();

    if (filters?.searchQuery && filters.searchQuery.trim()) {
      params.append('search', filters.searchQuery.trim());
    }
    if (filters?.participant && filters.participant.trim()) {
      params.append('participant', filters.participant.trim());
    }
    if (filters?.dateFrom) {
      params.append('date_from', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append('date_to', filters.dateTo);
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.platform && filters.platform !== 'all') {
      params.append('platform', filters.platform);
    }
    if (filters?.sortBy?.field) {
      params.append('sort_by', filters.sortBy.field);
    }
    if (filters?.sortBy?.order) {
      params.append('sort_order', filters.sortBy.order);
    }
    if (filters?.skip !== undefined) {
      params.append('skip', filters.skip.toString());
    }
    if (filters?.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<BackendMeetingListResponse>(`/meetings${queryString}`);

    return {
      meetings: response.items.map(transformBackendMeeting),
      total: response.total,
    };
  },

  /**
   * Fetches a single meeting by its ID from GET /api/v1/meetings/{id}.
   */
  async getMeetingById(id: string): Promise<Meeting> {
    const response = await apiClient.get<BackendMeeting>(`/meetings/${id}`);
    return transformBackendMeeting(response);
  },

  /**
   * Creates a new meeting via POST /api/v1/meetings.
   */
  async createMeeting(input: CreateMeetingInput): Promise<Meeting> {
    const response = await apiClient.post<BackendMeeting>('/meetings', {
      title: input.title,
      date: input.date,
      duration: input.duration || 1800,
      platform: input.platform,
      status: 'completed',
      participants: input.participants || [],
      transcript_text: input.transcript_text,
      audio_url: input.audioUrl,
    });
    return transformBackendMeeting(response);
  },

  /**
   * Updates meeting metadata via PATCH /api/v1/meetings/{id}.
   */
  async updateMeeting(id: string, input: UpdateMeetingInput): Promise<Meeting> {
    const response = await apiClient.patch<BackendMeeting>(`/meetings/${id}`, input);
    return transformBackendMeeting(response);
  },

  /**
   * Deletes a meeting by ID via DELETE /api/v1/meetings/{id}.
   */
  async deleteMeeting(id: string): Promise<void> {
    await apiClient.delete<void>(`/meetings/${id}`);
  },
};
