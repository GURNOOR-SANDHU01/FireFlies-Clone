/**
 * File: src/components/workspace/MeetingHeader.tsx
 *
 * Purpose:
 * Meeting workspace top header containing back navigation, meeting title, metadata pills,
 * participant badges, and workspace actions (Edit details, Delete meeting, Share, Export).
 *
 * Responsibilities:
 * - Render navigation back to dashboard (/ or /meetings).
 * - Display meeting title and editable affordances.
 * - Display platform badge, status badge, formatted date, and total duration.
 * - Display attendee avatars with tooltips.
 * - Provide Edit details modal for title and participant updates.
 * - Provide Confirm Delete modal with safe permanent deletion flow.
 * - Provide copy link and export transcript action triggers.
 *
 * This component does NOT:
 * - Control audio player state.
 * - Mutate action item records.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Meeting, UpdateMeetingInput } from '@/types/meeting';
import { Badge, BadgeVariant } from '@/components/common/Badge';
import { formatDate, formatDuration, getInitials } from '@/lib/formatters';
import { EditMeetingModal } from './EditMeetingModal';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import {
  ChevronLeftIcon,
  CalendarIcon,
  ClockIcon,
  ShareIcon,
  DownloadIcon,
  VideoIcon,
  MicIcon,
  EditIcon,
  TrashIcon,
} from '@/components/common/Icons';

export interface MeetingHeaderProps {
  meeting: Meeting;
  onShareLink?: () => void;
  onExportTranscript?: () => void;
  onUpdateMeeting?: (input: UpdateMeetingInput) => Promise<void>;
  onDeleteMeeting?: () => Promise<void>;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  meeting,
  onShareLink,
  onExportTranscript,
  onUpdateMeeting,
  onDeleteMeeting,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getPlatformInfo = (): { label: string; variant: BadgeVariant; icon: React.ReactNode } => {
    switch (meeting.platform) {
      case 'google_meet':
        return { label: 'Google Meet', variant: 'meet', icon: <VideoIcon size={12} /> };
      case 'zoom':
        return { label: 'Zoom', variant: 'zoom', icon: <VideoIcon size={12} /> };
      case 'teams':
        return { label: 'MS Teams', variant: 'teams', icon: <VideoIcon size={12} /> };
      case 'audio_upload':
        return { label: 'Audio Upload', variant: 'audio', icon: <MicIcon size={12} /> };
      default:
        return { label: 'In Person', variant: 'neutral', icon: <MicIcon size={12} /> };
    }
  };

  const platformInfo = getPlatformInfo();

  const handleConfirmDelete = async () => {
    if (!onDeleteMeeting) return;
    setIsDeleting(true);
    try {
      await onDeleteMeeting();
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '1.25rem',
      }}
    >
      {/* Top Breadcrumb & Action Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Back Link */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: 'var(--text-muted)',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ChevronLeftIcon size={16} />
          <span>Back to Meetings</span>
        </Link>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onUpdateMeeting && (
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              title="Edit meeting title and participants"
              aria-label="Edit meeting"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <EditIcon size={14} />
              <span>Edit Details</span>
            </button>
          )}

          {onShareLink && (
            <button
              type="button"
              onClick={onShareLink}
              title="Share meeting workspace link"
              aria-label="Share meeting"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <ShareIcon size={14} />
              <span>Share</span>
            </button>
          )}

          {onExportTranscript && (
            <button
              type="button"
              onClick={onExportTranscript}
              title="Export transcript as text"
              aria-label="Export transcript"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <DownloadIcon size={14} />
              <span>Export</span>
            </button>
          )}

          {onDeleteMeeting && (
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              title="Delete meeting permanently"
              aria-label="Delete meeting"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: 'var(--status-danger)',
                backgroundColor: 'var(--status-danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--status-danger-bg)';
              }}
            >
              <TrashIcon size={14} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Title Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
              }}
            >
              {meeting.title}
            </h1>
            {onUpdateMeeting && (
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                title="Edit title"
                style={{
                  color: 'var(--text-faint)',
                  padding: '0.2rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
              >
                <EditIcon size={16} />
              </button>
            )}
          </div>

          {/* Metadata Badges & Timestamps */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Badge variant={platformInfo.variant}>
                <span style={{ display: 'flex', marginRight: '2px' }}>{platformInfo.icon}</span>
                {platformInfo.label}
              </Badge>
              <Badge
                variant={
                  meeting.status === 'completed'
                    ? 'completed'
                    : meeting.status === 'processing'
                    ? 'processing'
                    : 'scheduled'
                }
                withDot
              >
                {meeting.status}
              </Badge>
            </div>

            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CalendarIcon size={14} />
              {formatDate(meeting.date)}
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ClockIcon size={14} />
              {formatDuration(meeting.duration)}
            </span>
          </div>
        </div>

        {/* Participants Avatars List */}
        {meeting.attendees && meeting.attendees.length > 0 && (
          <div
            onClick={() => onUpdateMeeting && setIsEditOpen(true)}
            title="Click to edit participants"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-card)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              cursor: onUpdateMeeting ? 'pointer' : 'default',
              transition: 'border-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              if (onUpdateMeeting) e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              if (onUpdateMeeting) e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Participants ({meeting.attendees.length}):
            </span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {meeting.attendees.map((att, idx) => (
                <div
                  key={att.id || idx}
                  title={`${att.name}${att.email ? ` (${att.email})` : ''}${
                    att.isHost ? ' — Host' : ''
                  }`}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: att.isHost ? 'var(--primary)' : 'var(--bg-elevated)',
                    border: '2px solid var(--bg-card)',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: idx > 0 ? '-6px' : 0,
                  }}
                >
                  {getInitials(att.name)}
                </div>
              ))}
            </div>
            {onUpdateMeeting && (
              <span style={{ color: 'var(--text-faint)', display: 'flex', marginLeft: '2px' }}>
                <EditIcon size={12} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Edit Meeting Details Modal */}
      {onUpdateMeeting && (
        <EditMeetingModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          meeting={meeting}
          onSave={onUpdateMeeting}
        />
      )}

      {/* Delete Confirmation Modal */}
      {onDeleteMeeting && (
        <ConfirmDeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Meeting"
          description={`Are you sure you want to delete "${meeting.title}"? This will permanently remove the meeting, all audio recordings, transcripts, summaries, and action items. This action cannot be undone.`}
          confirmLabel="Delete Meeting"
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
