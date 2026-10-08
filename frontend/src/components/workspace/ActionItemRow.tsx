/**
 * File: src/components/workspace/ActionItemRow.tsx
 *
 * Purpose:
 * Single action item row displaying task title, assignee, due date, and interactive
 * completion toggle, editing mode, and deletion.
 *
 * Responsibilities:
 * - Render accessible checkbox for toggling action item completion status.
 * - Support inline edit mode for task title and assignee.
 * - Render strikethrough styling and muted colors for completed tasks.
 * - Render assignee badge and due date badge when present.
 * - Provide edit and delete action triggers.
 *
 * This component does NOT:
 * - Call actionItemService directly (delegated to parent via callbacks).
 * - Render toast notifications directly.
 */

'use client';

import React, { useState } from 'react';
import { ActionItem, UpdateActionItemInput } from '@/types/actionItem';
import { formatDate } from '@/lib/formatters';
import {
  CalendarIcon,
  UsersIcon,
  CheckIcon,
  EditIcon,
  TrashIcon,
} from '@/components/common/Icons';

export interface ActionItemRowProps {
  item: ActionItem;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onUpdate?: (id: string, input: UpdateActionItemInput) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const ActionItemRow: React.FC<ActionItemRowProps> = ({
  item,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  const [isPending, setIsPending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editAssignee, setEditAssignee] = useState(item.assignee || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleCheckboxClick = async () => {
    if (isPending || isEditing) return;
    setIsPending(true);
    try {
      await onToggle(item.id, !item.completed);
    } finally {
      setIsPending(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(item.id, {
        title: editTitle.trim(),
        assignee: editAssignee.trim() || undefined,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isPending) return;
    setIsPending(true);
    try {
      await onDelete(item.id);
    } finally {
      setIsPending(false);
    }
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSaveEdit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '0.75rem 0.9rem',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Task title..."
          required
          autoFocus
          style={{
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.35rem 0.6rem',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <input
          type="text"
          value={editAssignee}
          onChange={(e) => setEditAssignee(e.target.value)}
          placeholder="Assignee (e.g. Marcus Chen)..."
          style={{
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.35rem 0.6rem',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.2rem' }}>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setEditTitle(item.title);
              setEditAssignee(item.assignee || '');
            }}
            disabled={isSaving}
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || !editTitle.trim()}
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: 'var(--primary)',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.75rem 0.9rem',
        backgroundColor: item.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-input)',
        border: item.completed
          ? '1px solid rgba(16, 185, 129, 0.2)'
          : '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        transition: 'all var(--transition-fast)',
        opacity: isPending ? 0.6 : 1,
        position: 'relative',
      }}
    >
      {/* Custom Accessible Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={item.completed}
        aria-label={`Mark "${item.title}" as ${item.completed ? 'incomplete' : 'complete'}`}
        disabled={isPending}
        onClick={handleCheckboxClick}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: 'var(--radius-sm)',
          border: item.completed
            ? '1px solid var(--status-completed)'
            : '1px solid var(--border-medium)',
          backgroundColor: item.completed ? 'var(--status-completed)' : 'var(--bg-elevated)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '2px',
          cursor: isPending ? 'wait' : 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        {item.completed && <CheckIcon size={13} />}
      </button>

      {/* Item Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.875rem',
            lineHeight: 1.45,
            color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: item.completed ? 'line-through' : 'none',
            fontWeight: item.completed ? 400 : 500,
            wordBreak: 'break-word',
            marginBottom: item.assignee || item.dueDate ? '0.35rem' : 0,
          }}
        >
          {item.title}
        </p>

        {/* Assignee & Due Date Pills */}
        {(item.assignee || item.dueDate) && (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            {item.assignee && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-elevated)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <UsersIcon size={12} />
                {item.assignee}
              </span>
            )}

            {item.dueDate && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-elevated)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <CalendarIcon size={12} />
                {formatDate(item.dueDate)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Row Actions: Edit and Delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
        {onUpdate && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            title="Edit action item"
            aria-label="Edit action item"
            style={{
              color: 'var(--text-faint)',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-sm)',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
          >
            <EditIcon size={14} />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            title="Delete action item"
            aria-label="Delete action item"
            style={{
              color: 'var(--text-faint)',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-sm)',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
          >
            <TrashIcon size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
