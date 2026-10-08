/**
 * File: src/components/dashboard/NewMeetingModal.tsx
 *
 * Purpose:
 * Modal form for creating a new meeting record in the workspace connected to FastAPI.
 *
 * Responsibilities:
 * - Collect meeting inputs (title, platform, duration, participants, transcript_text).
 * - Validate required input before submission.
 * - Call onSubmit callback with formatted CreateMeetingInput payload.
 * - Reset local form fields upon closure.
 *
 * This component does NOT:
 * - Execute API calls or database insertions directly.
 * - Manage meetings state or list caches.
 */

'use client';

import React, { useState } from 'react';
import { CreateMeetingInput, MeetingPlatform } from '@/types/meeting';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';

export interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateMeetingInput) => Promise<unknown>;
}

export const NewMeetingModal: React.FC<NewMeetingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [participantsInput, setParticipantsInput] = useState('');
  const [transcriptInput, setTranscriptInput] = useState('');
  const [platform, setPlatform] = useState<MeetingPlatform>('google_meet');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Meeting title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const participants = participantsInput
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    try {
      await onSubmit({
        title: title.trim(),
        platform,
        duration: durationMinutes * 60,
        date: new Date().toISOString(),
        participants: participants.length > 0 ? participants : ['Elena Rostova'],
        transcript_text: transcriptInput.trim() || undefined,
      });

      // Reset form
      setTitle('');
      setParticipantsInput('');
      setTranscriptInput('');
      setPlatform('google_meet');
      setDurationMinutes(30);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save meeting';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Meeting" maxWidth="580px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {error && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--status-danger-bg)',
              color: 'var(--status-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.825rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Meeting Title *
          </label>
          <Input
            placeholder="e.g. Q4 Executive Review & Objectives"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Participants */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Participants (comma-separated)
          </label>
          <Input
            placeholder="e.g. Aman, Rahul, Elena Rostova"
            value={participantsInput}
            onChange={(e) => setParticipantsInput(e.target.value)}
          />
        </div>

        {/* Platform & Duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Platform
            </label>
            <Select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as MeetingPlatform)}
              options={[
                { value: 'google_meet', label: 'Google Meet' },
                { value: 'zoom', label: 'Zoom' },
                { value: 'teams', label: 'MS Teams' },
                { value: 'in_person', label: 'In-Person' },
                { value: 'audio_upload', label: 'Audio Upload' },
              ]}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Duration (minutes)
            </label>
            <Input
              type="number"
              min={1}
              max={480}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Optional Transcript Text */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Transcript Text (optional)
            </label>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Paste dialogue: Speaker: Text
            </span>
          </div>
          <textarea
            placeholder="Aman: Welcome to our strategy review session.&#10;Rahul: Latency is down to 400ms across test streams.&#10;Aman: We will schedule stakeholder review by Monday."
            value={transcriptInput}
            onChange={(e) => setTranscriptInput(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.825rem',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'monospace',
              lineHeight: 1.45,
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Meeting
          </Button>
        </div>
      </form>
    </Modal>
  );
};
