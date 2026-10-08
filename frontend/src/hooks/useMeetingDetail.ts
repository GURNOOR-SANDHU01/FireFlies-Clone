/**
 * File: src/hooks/useMeetingDetail.ts
 *
 * Purpose:
 * Custom React hook orchestrating data fetching and local state management for the Meeting Detail workspace.
 *
 * Responsibilities:
 * - Concurrently fetch meeting metadata, transcript, summary, topics, and action items via meetingDetailService.
 * - Manage loading, error, and 404 (not found) states.
 * - Expose refresh / reload capabilities.
 * - Support optimistic action item toggle with rollback on API failure.
 *
 * This hook does NOT:
 * - Directly control audio playback or seek intervals.
 * - Compute transcript search highlights.
 * - Contain JSX rendering logic.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { meetingDetailService } from '@/services/meetingDetailService';
import { meetingService } from '@/services/meetingService';
import { actionItemService } from '@/services/actionItemService';
import { Meeting, UpdateMeetingInput } from '@/types/meeting';
import { TranscriptSegment } from '@/types/transcript';
import { MeetingSummary, MeetingTopic } from '@/types/summary';
import { ActionItem, UpdateActionItemInput } from '@/types/actionItem';
import { ApiError } from '@/services/apiClient';

export interface UseMeetingDetailReturn {
  meeting: Meeting | null;
  transcript: TranscriptSegment[];
  summary: MeetingSummary | null;
  topics: MeetingTopic[];
  actionItems: ActionItem[];
  isLoading: boolean;
  error: string | null;
  isNotFound: boolean;
  refresh: () => Promise<void>;
  updateMeetingMetadata: (input: UpdateMeetingInput) => Promise<Meeting>;
  deleteMeeting: () => Promise<void>;
  toggleActionItem: (actionItemId: string, completed: boolean) => Promise<boolean>;
  addActionItem: (title: string, assignee?: string, dueDate?: string) => Promise<ActionItem | null>;
  editActionItem: (actionItemId: string, input: UpdateActionItemInput) => Promise<ActionItem>;
  removeActionItem: (actionItemId: string) => Promise<void>;
}

export function useMeetingDetail(meetingId: string): UseMeetingDetailReturn {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [topics, setTopics] = useState<MeetingTopic[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!meetingId) return;

    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const data = await meetingDetailService.getFullMeetingDetail(meetingId);
      setMeeting(data.meeting);
      setTranscript(data.transcript);
      setSummary(data.summary);
      setTopics(data.topics);
      setActionItems(data.actionItems);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        setIsNotFound(true);
        setError('Meeting not found.');
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to load meeting details.');
      } else {
        setError('An unexpected error occurred while loading the meeting.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  /**
   * Optimistically toggles an action item's completed state, persisting via PATCH /action-items/{id}.
   */
  const toggleActionItem = useCallback(
    async (actionItemId: string, completed: boolean): Promise<boolean> => {
      // Optimistic update
      const previousItems = actionItems;
      setActionItems((prev) =>
        prev.map((item) => (item.id === actionItemId ? { ...item, completed } : item))
      );

      try {
        const updated = await actionItemService.updateActionItem(actionItemId, { completed });
        setActionItems((prev) =>
          prev.map((item) => (item.id === actionItemId ? updated : item))
        );
        // Also update meeting action items count if meeting is loaded
        setMeeting((prev) => {
          if (!prev) return prev;
          const delta = completed ? 1 : -1;
          return {
            ...prev,
            completedActionItemsCount: Math.max(0, prev.completedActionItemsCount + delta),
          };
        });
        return true;
      } catch (err) {
        // Rollback on failure
        setActionItems(previousItems);
        throw err;
      }
    },
    [actionItems]
  );

  /**
   * Adds a new action item under the current meeting.
   */
  const addActionItem = useCallback(
    async (title: string, assignee?: string, dueDate?: string): Promise<ActionItem | null> => {
      if (!meetingId || !title.trim()) return null;
      try {
        const created = await actionItemService.createActionItem(meetingId, {
          title: title.trim(),
          assignee: assignee?.trim() || undefined,
          due_date: dueDate || undefined,
        });
        setActionItems((prev) => [...prev, created]);
        setMeeting((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            actionItemsCount: prev.actionItemsCount + 1,
          };
        });
        return created;
      } catch (err) {
        throw err;
      }
    },
    [meetingId]
  );

  /**
   * Updates meeting metadata (title, participants, etc.) via PATCH /meetings/{id}.
   */
  const updateMeetingMetadata = useCallback(
    async (input: UpdateMeetingInput): Promise<Meeting> => {
      if (!meetingId) throw new Error('Meeting ID is missing');
      const updated = await meetingService.updateMeeting(meetingId, input);
      setMeeting(updated);
      return updated;
    },
    [meetingId]
  );

  /**
   * Deletes the meeting via DELETE /meetings/{id}.
   */
  const deleteMeeting = useCallback(async (): Promise<void> => {
    if (!meetingId) throw new Error('Meeting ID is missing');
    await meetingService.deleteMeeting(meetingId);
  }, [meetingId]);

  /**
   * Edits an action item via PATCH /action-items/{id}.
   */
  const editActionItem = useCallback(
    async (actionItemId: string, input: UpdateActionItemInput): Promise<ActionItem> => {
      const updated = await actionItemService.updateActionItem(actionItemId, input);
      setActionItems((prev) =>
        prev.map((item) => (item.id === actionItemId ? updated : item))
      );
      return updated;
    },
    []
  );

  /**
   * Deletes an action item via DELETE /action-items/{id}.
   */
  const removeActionItem = useCallback(
    async (actionItemId: string): Promise<void> => {
      const target = actionItems.find((i) => i.id === actionItemId);
      await actionItemService.deleteActionItem(actionItemId);
      setActionItems((prev) => prev.filter((item) => item.id !== actionItemId));
      setMeeting((prev) => {
        if (!prev) return prev;
        const deltaCompleted = target?.completed ? -1 : 0;
        return {
          ...prev,
          actionItemsCount: Math.max(0, prev.actionItemsCount - 1),
          completedActionItemsCount: Math.max(0, prev.completedActionItemsCount + deltaCompleted),
        };
      });
    },
    [actionItems]
  );

  return {
    meeting,
    transcript,
    summary,
    topics,
    actionItems,
    isLoading,
    error,
    isNotFound,
    refresh: loadData,
    updateMeetingMetadata,
    deleteMeeting,
    toggleActionItem,
    addActionItem,
    editActionItem,
    removeActionItem,
  };
}
