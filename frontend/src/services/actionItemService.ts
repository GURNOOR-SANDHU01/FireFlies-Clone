/**
 * File: src/services/actionItemService.ts
 *
 * Purpose:
 * API service for action item tasks communicating with the FastAPI backend.
 *
 * Responsibilities:
 * - Dispatch HTTP requests for listing, creating, patching, and deleting action items.
 * - Transform BackendActionItem payloads into frontend ActionItem models.
 *
 * This file does NOT:
 * - Manage React state.
 * - Render UI or toast notifications.
 */

import { apiClient } from './apiClient';
import {
  ActionItem,
  BackendActionItem,
  BackendActionItemListResponse,
  CreateActionItemInput,
  UpdateActionItemInput,
} from '@/types/actionItem';

function transformBackendActionItem(raw: BackendActionItem): ActionItem {
  return {
    id: raw.id,
    meetingId: raw.meeting_id,
    title: raw.title,
    assignee: raw.assignee || undefined,
    dueDate: raw.due_date || undefined,
    completed: raw.completed,
    createdAt: raw.created_at,
  };
}

export const actionItemService = {
  /**
   * Fetches all action items for a given meeting.
   */
  async getActionItems(meetingId: string): Promise<ActionItem[]> {
    const response = await apiClient.get<BackendActionItemListResponse>(
      `/meetings/${meetingId}/action-items`
    );
    return response.items.map(transformBackendActionItem);
  },

  /**
   * Creates a new action item under a meeting.
   */
  async createActionItem(meetingId: string, input: CreateActionItemInput): Promise<ActionItem> {
    const response = await apiClient.post<BackendActionItem>(
      `/meetings/${meetingId}/action-items`,
      input
    );
    return transformBackendActionItem(response);
  },

  /**
   * Updates an action item (e.g. toggle completed, change assignee or title).
   */
  async updateActionItem(actionItemId: string, input: UpdateActionItemInput): Promise<ActionItem> {
    const response = await apiClient.patch<BackendActionItem>(
      `/action-items/${actionItemId}`,
      input
    );
    return transformBackendActionItem(response);
  },

  /**
   * Deletes an action item.
   */
  async deleteActionItem(actionItemId: string): Promise<void> {
    await apiClient.delete<void>(`/action-items/${actionItemId}`);
  },
};
