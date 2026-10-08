/**
 * File: src/lib/formatters.ts
 *
 * Purpose:
 * Pure utility functions for formatting dates, durations, timestamps, and user strings.
 *
 * Responsibilities:
 * - Convert numeric seconds into human-readable duration strings (e.g., "30m 45s").
 * - Convert playback seconds into digital timecodes (e.g., "04:15").
 * - Format ISO date strings into readable calendar dates and relative timestamps.
 * - Generate initials for attendee avatar placeholders.
 *
 * This file does NOT:
 * - Mutate any input parameters.
 * - Manage React state or lifecycle.
 * - Perform network operations.
 */

/**
 * Formats a duration in seconds into a friendly string like "30m 45s" or "1h 15m".
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Formats seconds into a media player timecode (MM:SS or HH:MM:SS).
 */
export function formatTimeCode(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const paddedMins = minutes.toString().padStart(2, '0');
  const paddedSecs = seconds.toString().padStart(2, '0');

  if (hours > 0) {
    const paddedHours = hours.toString().padStart(2, '0');
    return `${paddedHours}:${paddedMins}:${paddedSecs}`;
  }
  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Formats an ISO date string to a localized human-readable date (e.g., "Oct 7, 2026").
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
}

/**
 * Formats an ISO date string to a short time (e.g., "2:30 PM").
 */
export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
}

/**
 * Returns initials from a full name (e.g., "Elena Rostova" -> "ER").
 */
export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
