/**
 * File: src/components/workspace/EditMeetingModal.tsx
 *
 * Purpose:
 * Dialog modal allowing users to edit meeting metadata (Title and Participants).
 *
 * Responsibilities:
 * - Provide form inputs for editing meeting title.
 * - Manage list of participants (add new participants, remove existing ones).
 * - Submit updated metadata to parent callback with loading and error states.
 *
 * This component does NOT:
 * - Execute API calls directly (delegated to onSave callback).
 * - Mutate transcript segments or audio files.
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Meeting, UpdateMeetingInput } from '@/types/meeting';
import { PlusIcon, TrashIcon, UsersIcon } from '@/components/common/Icons';

export interface EditMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  onSave: (input: UpdateMeetingInput) => Promise<void>;
}

interface ParticipantEntry {
  name: string;
  email?: string;
  is_host?: boolean;
}

interface EditMeetingFormProps {
  meeting: Meeting;
  onClose: () => void;
  onSave: (input: UpdateMeetingInput) => Promise<void>;
}

const EditMeetingForm: React.FC<EditMeetingFormProps> = ({ meeting, onClose, onSave }) => {
  const [title, setTitle] = useState(meeting.title);
  const [participants, setParticipants] = useState<ParticipantEntry[]>(() =>
    meeting.attendees.map((att) => ({
      name: att.name,
      email: att.email || undefined,
      is_host: att.isHost || false,
    }))
  );
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddParticipant = () => {
    if (!newName.trim()) return;
    setParticipants((prev) => [
      ...prev,
      {
        name: newName.trim(),
        email: newEmail.trim() || undefined,
        is_host: prev.length === 0,
      },
    ]);
    setNewName('');
    setNewEmail('');
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Meeting title cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        participants: participants.map((p) => ({
          name: p.name,
          email: p.email,
          is_host: p.is_host,
        })),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update meeting metadata.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--status-danger-bg)',
            color: 'var(--status-danger)',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Meeting Title Input */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: '0.4rem',
          }}
        >
          Meeting Title *
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Q4 Strategy Alignment"
          required
        />
      </div>

      {/* Participants Management */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: '0.4rem',
          }}
        >
          Participants ({participants.length})
        </label>

        {/* Current Participants List */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            maxHeight: '180px',
            overflowY: 'auto',
            marginBottom: '0.75rem',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: participants.length > 0 ? '0.5rem' : '1rem',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {participants.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              No participants listed. Add participants below.
            </span>
          ) : (
            participants.map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.65rem',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.825rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <UsersIcon size={14} className="text-muted" />
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</span>
                  {p.email && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      ({p.email})
                    </span>
                  )}
                  {p.is_host && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        backgroundColor: 'var(--primary-faint)',
                        color: 'var(--primary)',
                        padding: '0.05rem 0.35rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      Host
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveParticipant(idx)}
                  title="Remove participant"
                  style={{
                    color: 'var(--text-faint)',
                    padding: '0.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
                >
                  <TrashIcon size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Participant Input Row */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Name (e.g. Elena Rostova)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddParticipant();
              }
            }}
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddParticipant();
              }
            }}
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddParticipant}
            disabled={!newName.trim()}
            leftIcon={<PlusIcon size={14} />}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
        <Button variant="ghost" size="md" type="button" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export const EditMeetingModal: React.FC<EditMeetingModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Meeting Details" maxWidth="560px">
      <EditMeetingForm meeting={meeting} onClose={onClose} onSave={onSave} />
    </Modal>
  );
};
