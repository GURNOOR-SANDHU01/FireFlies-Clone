/**
 * File: src/components/common/ConfirmDeleteModal.tsx
 *
 * Purpose:
 * Accessible confirmation dialog for destructive actions such as deleting meetings or action items.
 *
 * Responsibilities:
 * - Display warning message with clear explanation of permanent deletion.
 * - Provide Cancel and Confirm (Danger) buttons.
 * - Support loading state during async deletion.
 *
 * This component does NOT:
 * - Execute API calls directly (delegated to onConfirm callback).
 */

'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { TrashIcon } from './Icons';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmLabel?: string;
  isDeleting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  isDeleting = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="460px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--status-danger-bg)',
              color: 'var(--status-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TrashIcon size={20} />
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {description}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="ghost" size="md" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={onConfirm}
            isLoading={isDeleting}
            leftIcon={<TrashIcon size={16} />}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
