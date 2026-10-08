/**
 * File: src/components/common/Toast.tsx
 *
 * Purpose:
 * Lightweight floating toast alert for success and failure notifications.
 *
 * Responsibilities:
 * - Render an animated notification banner for API feedback.
 * - Provide auto-dismiss and close action.
 *
 * This component does NOT:
 * - Make API calls.
 * - Manage application domain state.
 */

'use client';

import React, { useEffect } from 'react';
import { CheckCircleIcon, XIcon } from './Icons';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  durationMs = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  const isSuccess = type === 'success';
  const isError = type === 'error';

  const borderColor = isSuccess
    ? 'rgba(16, 185, 129, 0.4)'
    : isError
    ? 'rgba(239, 68, 68, 0.4)'
    : 'rgba(99, 102, 241, 0.4)';

  const iconColor = isSuccess
    ? 'var(--status-completed)'
    : isError
    ? 'var(--status-danger)'
    : 'var(--primary)';

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        backgroundColor: 'var(--bg-elevated)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        maxWidth: '400px',
      }}
    >
      <span
        style={{
          color: iconColor,
          display: 'flex',
          flexShrink: 0,
        }}
      >
        <CheckCircleIcon size={18} />
      </span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          color: 'var(--text-muted)',
          display: 'flex',
          padding: '0.2rem',
          borderRadius: 'var(--radius-sm)',
        }}
        aria-label="Dismiss toast"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
};
