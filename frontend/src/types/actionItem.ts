/**
 * File: src/types/actionItem.ts
 *
 * Purpose:
 * Defines TypeScript interfaces for action items generated from meetings.
 *
 * Responsibilities:
 * - Define the shape of an ActionItem entity.
 * - Define backend wire response types for action items.
 * - Model input shapes for creating and updating action items.
 *
 * This file does NOT:
 * - Mutate action item records.
 * - Execute API calls or database operations.
 * - Render UI checkbox lists.
 */

export interface BackendActionItem {
  id: string;
  meeting_id: string;
  title: string;
  assignee?: string | null;
  due_date?: string | null;
  completed: boolean;
  created_at: string;
}

export interface BackendActionItemListResponse {
  meeting_id: string;
  items: BackendActionItem[];
  total: number;
  completed_count: number;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  title: string;
  assignee?: string;
  dueDate?: string; // ISO 8601 string
  completed: boolean;
  createdAt: string;
}

export interface CreateActionItemInput {
  title: string;
  assignee?: string;
  due_date?: string;
}

export interface UpdateActionItemInput {
  title?: string;
  assignee?: string;
  completed?: boolean;
  due_date?: string;
}
