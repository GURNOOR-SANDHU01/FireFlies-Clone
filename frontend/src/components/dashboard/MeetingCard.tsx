/**
 * File: src/components/dashboard/MeetingCard.tsx
 *
 * Purpose:
 * Reusable UI card component for displaying a single meeting in grid view.
 *
 * Responsibilities:
 * - Display meeting title, date, duration, platform, and summary preview.
 * - Render attendee avatars and action item counts.
 * - Provide interactive click to open meeting workspace.
 * - Trigger delete callback on delete button click.
 *
 * This component does NOT:
 * - Fetch meeting data or execute API calls.
 * - Perform database operations.
 * - Contain business logic or filter algorithms.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Meeting, MeetingPlatform } from '@/types/meeting';
import { Badge, BadgeVariant } from '@/components/common/Badge';
import { formatDate, formatDuration, getInitials } from '@/lib/formatters';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import {
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  TrashIcon,
  SparklesIcon,
  MicIcon,
  VideoIcon,
} from '@/components/common/Icons';

export interface MeetingCardProps {
  meeting: Meeting;
  onDelete?: (id: string) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onDelete }) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const getPlatformBadge = (platform: MeetingPlatform): { label: string; variant: BadgeVariant; icon: React.ReactNode } => {
    switch (platform) {
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

  const platformInfo = getPlatformBadge(meeting.platform);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-medium)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
        {/* Header Metadata: Platform & Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Badge variant={platformInfo.variant}>
              <span style={{ display: 'flex', marginRight: '2px' }}>{platformInfo.icon}</span>
              {platformInfo.label}
            </Badge>
            <Badge variant={meeting.status === 'completed' ? 'completed' : meeting.status === 'processing' ? 'processing' : 'scheduled'} withDot>
              {meeting.status}
            </Badge>
          </div>

          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDeleteOpen(true);
              }}
              style={{
                color: 'var(--text-faint)',
                padding: '0.3rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'color var(--transition-fast)',
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

        {/* Meeting Title Link */}
        <Link href={`/meetings/${meeting.id}`} style={{ display: 'block', textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              marginBottom: '0.5rem',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          >
            {meeting.title}
          </h3>
        </Link>

        {/* Date and Duration Line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: '0.85rem',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CalendarIcon size={14} />
            {formatDate(meeting.date)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ClockIcon size={14} />
            {formatDuration(meeting.duration)}
          </span>
        </div>

        {/* AI Summary Snippet */}
        {meeting.summaryPreview && (
          <div
            style={{
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              marginBottom: '0.85rem',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <span style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: '2px' }}>
              <SparklesIcon size={14} />
            </span>
            <span
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {meeting.summaryPreview}
            </span>
          </div>
        )}

        {/* Tags */}
        {meeting.tags && meeting.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.85rem' }}>
            {meeting.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Attendees & Action Items Indicator */}
      <div
        style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(9, 13, 22, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Attendee Avatars */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {meeting.attendees.slice(0, 3).map((att, idx) => (
            <div
              key={att.id}
              title={att.name}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: idx === 0 ? 'var(--primary)' : 'var(--border-medium)',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: idx > 0 ? '-6px' : 0,
                border: '2px solid var(--bg-card)',
              }}
            >
              {getInitials(att.name)}
            </div>
          ))}
          {meeting.attendees.length > 3 && (
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
                fontSize: '0.65rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '-6px',
                border: '2px solid var(--bg-card)',
              }}
            >
              +{meeting.attendees.length - 3}
            </div>
          )}
        </div>

        {/* Action Items Counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            color: meeting.actionItemsCount > 0 ? 'var(--status-completed)' : 'var(--text-faint)',
          }}
        >
          <CheckCircleIcon size={14} />
          <span>
            {meeting.completedActionItemsCount}/{meeting.actionItemsCount} actions
          </span>
        </div>
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
