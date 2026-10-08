/**
 * File: src/lib/meetingFilters.ts
 *
 * Purpose:
 * Pure, deterministic utility functions for searching, filtering, and sorting meeting lists.
 *
 * Responsibilities:
 * - Filter meetings based on query strings across title, description, tags, and attendees.
 * - Filter meetings by status, platform, and tags.
 * - Sort meetings deterministically by date, duration, or title.
 * - Combine multiple filters into a single pipeline.
 *
 * This file does NOT:
 * - Store or modify application state.
 * - Rely on React hooks or browser DOM.
 * - Execute API calls or database operations.
 */

import { Meeting, MeetingFilterOptions, MeetingSortOption } from '@/types/meeting';

/**
 * Filter an array of meetings based on search query, status, platform, and tags.
 */
export function filterMeetings(meetings: Meeting[], filters: MeetingFilterOptions): Meeting[] {
  let result = [...meetings];

  // 1. Text Search Query
  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter((meeting) => {
      const matchTitle = meeting.title.toLowerCase().includes(q);
      const matchDesc = meeting.description ? meeting.description.toLowerCase().includes(q) : false;
      const matchSummary = meeting.summaryPreview ? meeting.summaryPreview.toLowerCase().includes(q) : false;
      const matchTags = meeting.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchAttendees = meeting.attendees.some((att) =>
        att.name.toLowerCase().includes(q) || (att.email ? att.email.toLowerCase().includes(q) : false)
      );

      return matchTitle || matchDesc || matchSummary || matchTags || matchAttendees;
    });
  }

  // 2. Status Filter
  if (filters.status && filters.status !== 'all') {
    result = result.filter((meeting) => meeting.status === filters.status);
  }

  // 3. Platform Filter
  if (filters.platform && filters.platform !== 'all') {
    result = result.filter((meeting) => meeting.platform === filters.platform);
  }

  // 4. Tag Filter
  if (filters.tag && filters.tag !== 'all') {
    result = result.filter((meeting) => meeting.tags.includes(filters.tag as string));
  }

  return result;
}

/**
 * Sorts an array of meetings based on a specified sort field and direction.
 */
export function sortMeetings(meetings: Meeting[], sortBy?: MeetingSortOption): Meeting[] {
  if (!sortBy) return meetings;

  const { field, order } = sortBy;
  const modifier = order === 'asc' ? 1 : -1;

  return [...meetings].sort((a, b) => {
    switch (field) {
      case 'date': {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return (timeA - timeB) * modifier;
      }
      case 'duration': {
        return (a.duration - b.duration) * modifier;
      }
      case 'title': {
        return a.title.localeCompare(b.title) * modifier;
      }
      default:
        return 0;
    }
  });
}

/**
 * Convenience pipeline combining both filtering and sorting operations.
 */
export function applyMeetingFilters(
  meetings: Meeting[],
  filters: MeetingFilterOptions
): Meeting[] {
  const filtered = filterMeetings(meetings, filters);
  return sortMeetings(filtered, filters.sortBy);
}
