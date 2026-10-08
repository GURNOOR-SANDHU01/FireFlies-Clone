/**
 * File: src/components/workspace/SpeakerAvatar.tsx
 *
 * Purpose:
 * Visual avatar badge for meeting speakers with deterministic color styling and initials.
 *
 * Responsibilities:
 * - Generate consistent color palettes based on speaker name.
 * - Render speaker initials in a circular badge.
 * - Support customizable size.
 *
 * This component does NOT:
 * - Manage audio state.
 * - Render transcript text.
 */

'use client';

import React from 'react';
import { getInitials } from '@/lib/formatters';

export interface SpeakerAvatarProps {
  name: string;
  size?: number;
}

// Curated palette of harmonious avatar backgrounds
const AVATAR_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#14b8a6', // Teal
];

function getSpeakerColor(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const SpeakerAvatar: React.FC<SpeakerAvatarProps> = ({ name, size = 32 }) => {
  const initials = getInitials(name);
  const bgColor = getSpeakerColor(name);

  return (
    <div
      title={name}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: '#ffffff',
        fontSize: `${Math.max(10, Math.floor(size * 0.4))}px`,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  );
};
