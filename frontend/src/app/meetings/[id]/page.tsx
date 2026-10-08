/**
 * File: src/app/meetings/[id]/page.tsx
 *
 * Purpose:
 * Meeting detail workspace route at /meetings/[id] in Next.js App Router.
 *
 * Responsibilities:
 * - Extract meetingId from route parameters via useParams inside a Suspense boundary.
 * - Coordinate data loading with useMeetingDetail hook.
 * - Coordinate media player state via useAudioPlayer hook.
 * - Coordinate exact audio <-> transcript synchronization via useTranscriptSync hook.
 * - Coordinate case-insensitive dialogue search via useTranscriptSearch hook.
 * - Render loading skeletons, 404 not found states, and API error states without fallback data.
 * - Render floating toast notifications for user actions.
 *
 * This file does NOT:
 * - Direct HTTP fetch calls inside JSX (delegated to services).
 * - Contain multiple sources of truth for audio time.
 */

'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMeetingDetail } from '@/hooks/useMeetingDetail';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useTranscriptSync } from '@/hooks/useTranscriptSync';
import { useTranscriptSearch } from '@/hooks/useTranscriptSearch';
import { MeetingWorkspace } from '@/components/workspace/MeetingWorkspace';
import { Toast } from '@/components/common/Toast';
import { EmptyState } from '@/components/common/EmptyState';
import { ChevronLeftIcon, CalendarIcon } from '@/components/common/Icons';

function MeetingWorkspaceSkeleton() {
  return (
    <div
      className="animate-fade-in"
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1rem 0',
      }}
    >
      {/* Header Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div
          style={{
            width: '140px',
            height: '18px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)',
          }}
        />
        <div
          style={{
            width: '55%',
            height: '32px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
          }}
        />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div
            style={{
              width: '100px',
              height: '24px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-full)',
            }}
          />
          <div
            style={{
              width: '120px',
              height: '24px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-full)',
            }}
          />
        </div>
      </div>

      {/* Audio Player Skeleton */}
      <div
        style={{
          height: '80px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      />

      {/* Grid Panels Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            height: '520px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        />
        <div
          style={{
            height: '520px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        />
      </div>
    </div>
  );
}

function MeetingDetailContent() {
  const router = useRouter();
  const params = useParams();
  const meetingId = (params?.id as string) || '';

  const {
    meeting,
    transcript,
    summary,
    topics,
    actionItems,
    isLoading,
    error,
    isNotFound,
    refresh,
    updateMeetingMetadata,
    deleteMeeting,
    toggleActionItem,
    addActionItem,
    editActionItem,
    removeActionItem,
  } = useMeetingDetail(meetingId);

  // Dedicated Audio Player Hook (Single Source of Truth for currentTime)
  const audioPlayer = useAudioPlayer({
    src: meeting?.audioUrl,
    initialDuration: meeting?.duration || 0,
  });

  // Dedicated Transcript <-> Audio Synchronization Hook
  const transcriptSync = useTranscriptSync({
    segments: transcript,
    currentTime: audioPlayer.currentTime,
    seek: audioPlayer.seek,
  });

  // Dedicated Client-side Search Hook
  const transcriptSearch = useTranscriptSearch(transcript);

  // Toast feedback state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleUpdateMeeting = async (input: { title?: string; participants?: Array<string | { name: string; email?: string; is_host?: boolean }> }) => {
    try {
      await updateMeetingMetadata(input);
      showToast('Meeting details updated successfully', 'success');
    } catch {
      showToast('Failed to update meeting details', 'error');
    }
  };

  const handleDeleteMeeting = async () => {
    try {
      await deleteMeeting();
      showToast('Meeting deleted successfully', 'success');
      router.push('/');
    } catch {
      showToast('Failed to delete meeting', 'error');
    }
  };

  // 1. Loading Skeleton State
  if (isLoading) {
    return <MeetingWorkspaceSkeleton />;
  }

  // 2. 404 Not Found State
  if (isNotFound) {
    return (
      <div
        className="animate-fade-in"
        style={{
          maxWidth: '600px',
          margin: '4rem auto',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <EmptyState
          icon={<CalendarIcon size={32} />}
          title="Meeting Not Found"
          description={`The requested meeting "${meetingId}" does not exist in your workspace database or may have been deleted.`}
          actionLabel="Back to Meetings Library"
          onAction={() => router.push('/')}
        />
      </div>
    );
  }

  // 3. API Error State
  if (error || !meeting) {
    return (
      <div
        className="animate-fade-in"
        style={{
          maxWidth: '600px',
          margin: '4rem auto',
          padding: '2rem',
          backgroundColor: 'var(--status-danger-bg)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          color: 'var(--status-danger)',
        }}
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Unable to Load Meeting Workspace
        </h2>
        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          {error || 'Failed to retrieve meeting data from the server.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => refresh()}
            style={{
              backgroundColor: 'var(--status-danger)',
              color: '#ffffff',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            Retry Connection
          </button>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <ChevronLeftIcon size={14} />
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  // 4. Normal Populated Workspace
  return (
    <>
      <MeetingWorkspace
        meeting={meeting}
        transcript={transcript}
        summary={summary}
        topics={topics}
        actionItems={actionItems}
        audioPlayer={audioPlayer}
        transcriptSync={transcriptSync}
        transcriptSearch={transcriptSearch}
        onUpdateMeeting={handleUpdateMeeting}
        onDeleteMeeting={handleDeleteMeeting}
        onToggleActionItem={toggleActionItem}
        onAddActionItem={addActionItem}
        onEditActionItem={editActionItem}
        onRemoveActionItem={removeActionItem}
        onShowToast={showToast}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default function MeetingDetailPage() {
  return (
    <Suspense fallback={<MeetingWorkspaceSkeleton />}>
      <MeetingDetailContent />
    </Suspense>
  );
}
