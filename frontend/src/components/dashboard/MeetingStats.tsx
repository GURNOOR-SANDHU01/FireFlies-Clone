/**
 * File: src/components/dashboard/MeetingStats.tsx
 *
 * Purpose:
 * Presentational metric cards displaying workspace overview stats.
 *
 * Responsibilities:
 * - Render aggregated cards (Total Meetings, Recorded Hours, Action Items, Done Rate).
 * - Format numeric metrics neatly with contextual icons.
 *
 * This component does NOT:
 * - Aggregate statistics internally (receives computed props from parent/hook).
 * - Query external APIs.
 */

import React from 'react';
import { CalendarIcon, ClockIcon, CheckCircleIcon, SparklesIcon } from '@/components/common/Icons';

export interface MeetingStatsProps {
  stats: {
    totalMeetings: number;
    totalHours: number;
    totalActionItems: number;
    completedActionItems: number;
  };
}

export const MeetingStats: React.FC<MeetingStatsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Total Meetings',
      value: stats.totalMeetings.toString(),
      subtext: 'Indexed & transcribed',
      icon: <CalendarIcon size={20} />,
      color: 'var(--primary)',
      bg: 'var(--primary-faint)',
    },
    {
      label: 'Audio Recorded',
      value: `${stats.totalHours} hrs`,
      subtext: 'Synced with transcript',
      icon: <ClockIcon size={20} />,
      color: 'var(--status-scheduled)',
      bg: 'var(--status-scheduled-bg)',
    },
    {
      label: 'Action Items',
      value: `${stats.completedActionItems} / ${stats.totalActionItems}`,
      subtext: `${
        stats.totalActionItems > 0
          ? Math.round((stats.completedActionItems / stats.totalActionItems) * 100)
          : 0
      }% completed`,
      icon: <CheckCircleIcon size={20} />,
      color: 'var(--status-completed)',
      bg: 'var(--status-completed-bg)',
    },
    {
      label: 'AI Summaries',
      value: stats.totalMeetings.toString(),
      subtext: 'Chapters & takeaways generated',
      icon: <SparklesIcon size={20} />,
      color: 'var(--accent-purple)',
      bg: 'var(--primary-faint)',
    },

  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            transition: 'border-color var(--transition-fast)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: card.bg,
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {card.icon}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {card.label}
            </div>
            <div
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                marginTop: '0.2rem',
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
              {card.subtext}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
