/**
 * File: src/components/common/Badge.tsx
 *
 * Purpose:
 * Small visual pill/indicator for statuses, categories, platforms, and metadata tags.
 *
 * Responsibilities:
 * - Render compact tags with distinct color styles based on semantic intent.
 * - Support dot indicator for active/live status.
 *
 * This component does NOT:
 * - Trigger business events.
 * - Determine domain status logic.
 */

import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'completed'
  | 'processing'
  | 'scheduled'
  | 'primary'
  | 'neutral'
  | 'meet'
  | 'zoom'
  | 'teams'
  | 'audio';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  withDot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  withDot = false,
  className = '',
  style,
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
    default: {
      bg: 'var(--bg-elevated)',
      text: 'var(--text-secondary)',
      border: 'var(--border-subtle)',
      dot: 'var(--text-muted)',
    },
    neutral: {
      bg: 'var(--bg-elevated)',
      text: 'var(--text-muted)',
      border: 'var(--border-subtle)',
      dot: 'var(--text-muted)',
    },
    primary: {
      bg: 'var(--primary-faint)',
      text: 'var(--accent-purple)',
      border: 'rgba(139, 92, 246, 0.25)',
      dot: 'var(--primary)',
    },
    completed: {
      bg: 'var(--status-completed-bg)',
      text: 'var(--status-completed)',
      border: 'rgba(16, 185, 129, 0.25)',
      dot: 'var(--status-completed)',
    },
    processing: {
      bg: 'var(--status-processing-bg)',
      text: 'var(--status-processing)',
      border: 'rgba(245, 158, 11, 0.25)',
      dot: 'var(--status-processing)',
    },
    scheduled: {
      bg: 'var(--status-scheduled-bg)',
      text: 'var(--status-scheduled)',
      border: 'rgba(56, 189, 248, 0.25)',
      dot: 'var(--status-scheduled)',
    },
    meet: {
      bg: 'rgba(26, 115, 232, 0.12)',
      text: 'var(--platform-meet)',
      border: 'rgba(26, 115, 232, 0.25)',
      dot: 'var(--platform-meet)',
    },
    zoom: {
      bg: 'rgba(45, 140, 255, 0.12)',
      text: 'var(--platform-zoom)',
      border: 'rgba(45, 140, 255, 0.25)',
      dot: 'var(--platform-zoom)',
    },
    teams: {
      bg: 'rgba(80, 89, 201, 0.15)',
      text: 'var(--platform-teams)',
      border: 'rgba(80, 89, 201, 0.3)',
      dot: 'var(--platform-teams)',
    },
    audio: {
      bg: 'rgba(168, 85, 247, 0.12)',
      text: 'var(--platform-audio)',
      border: 'rgba(168, 85, 247, 0.25)',
      dot: 'var(--platform-audio)',
    },
  };

  const current = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.55rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        lineHeight: 1.2,
        ...style,
      }}
    >
      {withDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: current.dot,
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
};
