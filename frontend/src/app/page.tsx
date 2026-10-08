/**
 * File: src/app/page.tsx
 *
 * Purpose:
 * Primary Meetings Library dashboard page route in Next.js App Router.
 *
 * Responsibilities:
 * - Orchestrate meetings state using useMeetings hook.
 * - Render dashboard header, statistics cards, filter toolbar, and meeting collections.
 * - Support grid and list layout toggling.
 * - Render loading, error, and empty state fallbacks.
 *
 * This page does NOT:
 * - Execute direct fetch calls (delegated to useMeetings / meetingService).
 * - Contain low-level UI styling tokens (delegated to components & CSS tokens).
 * - Implement filtering or sorting algorithms (delegated to lib/meetingFilters).
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useMeetings } from '@/hooks/useMeetings';
import { MeetingStats } from '@/components/dashboard/MeetingStats';
import { MeetingFilterBar } from '@/components/dashboard/MeetingFilterBar';
import { MeetingCard } from '@/components/dashboard/MeetingCard';
import { MeetingListItem } from '@/components/dashboard/MeetingListItem';
import { EmptyState } from '@/components/common/EmptyState';
import { CalendarIcon } from '@/components/common/Icons';
import { Toast } from '@/components/common/Toast';

export default function MeetingsDashboardPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    filteredMeetings,
    isLoading,
    error,
    filters,
    stats,
    toast,
    dismissToast,
    updateFilters,
    resetFilters,
    deleteMeeting,
    refreshMeetings,
  } = useMeetings();

  // Listen for meeting creation events dispatched by the top navigation modal
  useEffect(() => {
    const handleMeetingCreated = () => {
      refreshMeetings();
    };
    window.addEventListener('meeting-created', handleMeetingCreated);
    return () => window.removeEventListener('meeting-created', handleMeetingCreated);
  }, [refreshMeetings]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Title & Subtitle */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontSize: '1.65rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
          }}
        >
          Meetings Library
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginTop: '0.25rem',
          }}
        >
          Search across recorded conversations, explore AI summaries, and monitor action items.
        </p>
      </div>

      {/* Aggregate Metrics Bar */}
      <MeetingStats stats={stats} />

      {/* Search & Filter Toolbar */}
      <MeetingFilterBar
        filters={filters}
        onFilterChange={updateFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalFilteredCount={filteredMeetings.length}
      />

      {/* Content Area */}
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5rem 0',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid var(--border-medium)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Loading meetings library...
          </span>
          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      ) : error ? (
        <div
          style={{
            backgroundColor: 'var(--status-danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--status-danger)',
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Failed to load meetings</p>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={() => refreshMeetings()}
            style={{
              backgroundColor: 'var(--status-danger)',
              color: '#ffffff',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            Retry
          </button>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={28} />}
          title="No meetings found"
          description={
            filters.searchQuery || filters.status !== 'all' || filters.platform !== 'all'
              ? 'No meetings matched your current filters or search query. Try clearing your filters.'
              : 'Your workspace has no recorded meetings yet. Add your first meeting to get started!'
          }
          actionLabel={
            filters.searchQuery || filters.status !== 'all' || filters.platform !== 'all'
              ? 'Reset Filters'
              : undefined
          }
          onAction={resetFilters}
        />
      ) : viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onDelete={deleteMeeting}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredMeetings.map((meeting) => (
            <MeetingListItem
              key={meeting.id}
              meeting={meeting}
              onDelete={deleteMeeting}
            />
          ))}
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={dismissToast}
        />
      )}
    </div>
  );
}
