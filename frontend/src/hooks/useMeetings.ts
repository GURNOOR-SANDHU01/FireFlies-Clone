/**
 * File: src/hooks/useMeetings.ts
 *
 * Purpose:
 * Custom React hook managing meeting data fetching, debounced search/filtering, and CRUD mutations
 * directly with the FastAPI backend.
 *
 * Responsibilities:
 * - Load meetings from GET /api/v1/meetings using the meetingService.
 * - Debounce search query and filter changes before issuing API requests.
 * - Manage loading, error, and total meeting collection states.
 * - Provide mutation handlers (create, update, delete) with toast feedback.
 *
 * This hook does NOT:
 * - Use local mock data fallbacks (backend is the single source of truth).
 * - Render UI components.
 * - Contain low-level fetch or styling logic.
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CreateMeetingInput, Meeting, MeetingFilterOptions, UpdateMeetingInput } from '@/types/meeting';
import { meetingService } from '@/services/meetingService';

const DEFAULT_FILTERS: MeetingFilterOptions = {
  searchQuery: '',
  participant: '',
  dateFrom: '',
  dateTo: '',
  status: 'all',
  platform: 'all',
  sortBy: { field: 'date', order: 'desc' },
  skip: 0,
  limit: 50,
};

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export function useMeetings(initialFilters: MeetingFilterOptions = DEFAULT_FILTERS) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MeetingFilterOptions>(initialFilters);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Debounced filter reference
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch meetings directly from FastAPI backend
  const fetchMeetings = useCallback(async (activeFilters: MeetingFilterOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await meetingService.getMeetings(activeFilters);
      setMeetings(data.meetings);
      setTotalCount(data.total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to backend';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced effect whenever filters change
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce search/input keystrokes by 350ms
    const delay = filters.searchQuery || filters.participant ? 350 : 50;

    debounceTimerRef.current = setTimeout(() => {
      fetchMeetings(filters);
    }, delay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters, fetchMeetings]);

  // Create meeting mutation
  const createMeeting = useCallback(
    async (input: CreateMeetingInput): Promise<Meeting> => {
      try {
        const created = await meetingService.createMeeting(input);
        setMeetings((prev) => [created, ...prev]);
        setTotalCount((prev) => prev + 1);
        showToast(`Meeting "${created.title}" created successfully!`, 'success');
        return created;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create meeting';
        showToast(message, 'error');
        throw err;
      }
    },
    [showToast]
  );

  // Update meeting mutation (e.g. title, participants, status)
  const updateMeeting = useCallback(
    async (id: string, input: UpdateMeetingInput): Promise<Meeting> => {
      try {
        const updated = await meetingService.updateMeeting(id, input);
        setMeetings((prev) => prev.map((m) => (m.id === id ? updated : m)));
        showToast('Meeting metadata updated successfully!', 'success');
        return updated;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update meeting';
        showToast(message, 'error');
        throw err;
      }
    },
    [showToast]
  );

  // Delete meeting mutation
  const deleteMeeting = useCallback(
    async (id: string): Promise<void> => {
      const targetMeeting = meetings.find((m) => m.id === id);
      try {
        await meetingService.deleteMeeting(id);
        setMeetings((prev) => prev.filter((m) => m.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        showToast(`Deleted meeting "${targetMeeting?.title || id}"`, 'success');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete meeting';
        showToast(message, 'error');
        throw err;
      }
    },
    [meetings, showToast]
  );

  // Partial update of filter state
  const updateFilters = useCallback((partial: Partial<MeetingFilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Dashboard metrics derived from loaded meetings
  const stats = useMemo(() => {
    const total = totalCount || meetings.length;
    const totalDurationSeconds = meetings.reduce((acc, m) => acc + (m.duration || 0), 0);
    const totalActionItems = meetings.reduce((acc, m) => acc + (m.actionItemsCount || 0), 0);
    const completedActionItems = meetings.reduce(
      (acc, m) => acc + (m.completedActionItemsCount || 0),
      0
    );

    return {
      totalMeetings: total,
      totalHours: Math.round((totalDurationSeconds / 3600) * 10) / 10,
      totalActionItems,
      completedActionItems,
    };
  }, [meetings, totalCount]);

  return {
    meetings,
    filteredMeetings: meetings, // Server is source of truth for filtering and sorting
    totalCount,
    isLoading,
    error,
    filters,
    stats,
    toast,
    dismissToast,
    updateFilters,
    resetFilters,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    refreshMeetings: () => fetchMeetings(filters),
  };
}
