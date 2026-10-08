/**
 * File: src/components/dashboard/MeetingFilterBar.tsx
 *
 * Purpose:
 * Search, filter, and sorting controls toolbar for the meetings library.
 *
 * Responsibilities:
 * - Provide search input for meeting query text.
 * - Provide filter selectors for status and platform.
 * - Provide sort selector (Date, Duration, Title).
 * - Provide layout mode toggle (Grid vs List).
 *
 * This component does NOT:
 * - Perform filtering algorithms directly (delegated to parent / utility).
 * - Mutate persistent meeting collections.
 */

'use client';

import React from 'react';
import { MeetingFilterOptions, MeetingPlatform, MeetingSortField, MeetingStatus, SortOrder } from '@/types/meeting';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { SearchIcon, GridIcon, ListIcon, XIcon } from '@/components/common/Icons';

export interface MeetingFilterBarProps {
  filters: MeetingFilterOptions;
  onFilterChange: (updates: Partial<MeetingFilterOptions>) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalFilteredCount: number;
}

export const MeetingFilterBar: React.FC<MeetingFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
}) => {
  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    Boolean(filters.participant) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo) ||
    (filters.status && filters.status !== 'all') ||
    (filters.platform && filters.platform !== 'all');

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Bar & Participant Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 380px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px', minWidth: '200px' }}>
            <Input
              placeholder="Search meetings by title..."
              value={filters.searchQuery || ''}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              leftIcon={<SearchIcon size={16} />}
              rightIcon={
                filters.searchQuery ? (
                  <button
                    onClick={() => onFilterChange({ searchQuery: '' })}
                    style={{ color: 'var(--text-muted)', display: 'flex' }}
                    aria-label="Clear search"
                  >
                    <XIcon size={14} />
                  </button>
                ) : undefined
              }
            />
          </div>

          <div style={{ flex: '0 1 180px', minWidth: '160px' }}>
            <Input
              placeholder="Participant name..."
              value={filters.participant || ''}
              onChange={(e) => onFilterChange({ participant: e.target.value })}
              rightIcon={
                filters.participant ? (
                  <button
                    onClick={() => onFilterChange({ participant: '' })}
                    style={{ color: 'var(--text-muted)', display: 'flex' }}
                    aria-label="Clear participant filter"
                  >
                    <XIcon size={14} />
                  </button>
                ) : undefined
              }
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Status Dropdown */}
          <Select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange({ status: e.target.value as MeetingStatus | 'all' })}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'completed', label: 'Completed' },
              { value: 'processing', label: 'Processing' },
              { value: 'scheduled', label: 'Scheduled' },
            ]}
          />

          {/* Platform Dropdown */}
          <Select
            value={filters.platform || 'all'}
            onChange={(e) => onFilterChange({ platform: e.target.value as MeetingPlatform | 'all' })}
            options={[
              { value: 'all', label: 'All Platforms' },
              { value: 'google_meet', label: 'Google Meet' },
              { value: 'zoom', label: 'Zoom' },
              { value: 'teams', label: 'MS Teams' },
              { value: 'in_person', label: 'In-Person' },
              { value: 'audio_upload', label: 'Audio Upload' },
            ]}
          />

          {/* Sort Selector */}
          <Select
            value={`${filters.sortBy?.field || 'date'}_${filters.sortBy?.order || 'desc'}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('_') as [MeetingSortField, SortOrder];
              onFilterChange({ sortBy: { field, order } });
            }}
            options={[
              { value: 'date_desc', label: 'Date: Newest First' },
              { value: 'date_asc', label: 'Date: Oldest First' },
              { value: 'duration_desc', label: 'Duration: Longest' },
              { value: 'duration_asc', label: 'Duration: Shortest' },
              { value: 'title_asc', label: 'Title: A → Z' },
            ]}
          />

          {/* View Mode Toggle (Grid / List) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              padding: '2px',
            }}
          >
            <button
              onClick={() => onViewModeChange('grid')}
              style={{
                padding: '0.4rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'grid' ? 'var(--primary-faint)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Grid view"
              aria-label="Grid view"
            >
              <GridIcon size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              style={{
                padding: '0.4rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'list' ? 'var(--primary-faint)' : 'transparent',
                color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
              title="List view"
              aria-label="List view"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar with results count and reset */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          paddingTop: '0.35rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <span>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{totalFilteredCount}</strong> meetings
        </span>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            style={{
              color: 'var(--accent-purple)',
              fontWeight: 500,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            Clear active filters
          </button>
        )}
      </div>
    </div>
  );
};
