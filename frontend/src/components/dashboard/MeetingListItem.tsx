/**
 * File: src/components/dashboard/MeetingListItem.tsx
 *
 * Purpose:
 * Compact row presentation component for meetings in list view.
 *
 * Responsibilities:
 * - Display single meeting as a table-like horizontal item with key columns.
 * - Render status, platform, title, duration, date, action items, and delete action.
 *
 * This component does NOT:
 * - Fetch meeting records or handle persistence.
 * - Manage search or sort algorithms.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Meeting } from '@/types/meeting';
import { Badge } from '@/components/common/Badge';
import { formatDate, formatDuration } from '@/lib/formatters';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { ClockIcon, CalendarIcon, CheckCircleIcon, TrashIcon } from '@/components/common/Icons';

export interface MeetingListItemProps {
  meeting: Meeting;
  onDelete?: (id: string) => void;
}

export const MeetingListItem: React.FC<MeetingListItemProps> = ({ meeting, onDelete }) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-medium)';
        e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
      }}
    >
      {/* Title & Platform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 340px' }}>
        <Badge
          variant={meeting.status === 'completed' ? 'completed' : meeting.status === 'processing' ? 'processing' : 'scheduled'}
          withDot
        >
          {meeting.status}
        </Badge>
        <Link href={`/meetings/${meeting.id}`} style={{ textDecoration: 'none' }}>
          <span
            style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          >
            {meeting.title}
          </span>
        </Link>
      </div>

      {/* Metadata columns */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
        {/* Date */}
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <CalendarIcon size={14} />
          {formatDate(meeting.date)}
        </span>

        {/* Duration */}
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <ClockIcon size={14} />
          {formatDuration(meeting.duration)}
        </span>

        {/* Action items */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8rem',
            color: meeting.actionItemsCount > 0 ? 'var(--status-completed)' : 'var(--text-faint)',
            minWidth: '85px',
          }}
        >
          <CheckCircleIcon size={14} />
          {meeting.completedActionItemsCount}/{meeting.actionItemsCount}
        </span>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={() => setIsDeleteOpen(true)}
            style={{
              color: 'var(--text-faint)',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-sm)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
            title="Delete meeting"
            aria-label="Delete meeting"
          >
            <TrashIcon size={15} />
          </button>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {onDelete && (
        <ConfirmDeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() => {
            onDelete(meeting.id);
            setIsDeleteOpen(false);
          }}
          title="Delete Meeting"
          description={`Are you sure you want to delete "${meeting.title}"? All transcript segments and action items will be permanently removed.`}
          confirmLabel="Delete Meeting"
        />
      )}
    </div>
  );
};
