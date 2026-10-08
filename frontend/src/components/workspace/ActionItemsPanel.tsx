/**
 * File: src/components/workspace/ActionItemsPanel.tsx
 *
 * Purpose:
 * Action items checklist panel tracking meeting tasks, completion progress, and quick additions.
 *
 * Responsibilities:
 * - Display completion progress bar and counter (e.g. "2 of 4 completed").
 * - Filter items by All, Pending, and Completed.
 * - Render ActionItemRow items.
 * - Provide inline form to add a new action item.
 * - Handle errors and report state updates to parent.
 *
 * This component does NOT:
 * - Directly execute HTTP mutations (delegated to onToggle and onAdd callbacks).
 * - Own audio player state.
 */

'use client';

import React, { useState } from 'react';
import { ActionItem, UpdateActionItemInput } from '@/types/actionItem';
import { ActionItemRow } from './ActionItemRow';
import { PlusIcon, CheckCircleIcon } from '@/components/common/Icons';

export interface ActionItemsPanelProps {
  actionItems: ActionItem[];
  onToggleActionItem: (actionItemId: string, completed: boolean) => Promise<boolean>;
  onAddActionItem?: (title: string, assignee?: string, dueDate?: string) => Promise<ActionItem | null>;
  onUpdateActionItem?: (actionItemId: string, input: UpdateActionItemInput) => Promise<ActionItem>;
  onDeleteActionItem?: (actionItemId: string) => Promise<void>;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ActionItemsPanel: React.FC<ActionItemsPanelProps> = ({
  actionItems,
  onToggleActionItem,
  onAddActionItem,
  onUpdateActionItem,
  onDeleteActionItem,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedCount = actionItems.filter((i) => i.completed).length;
  const totalCount = actionItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const filteredItems = actionItems.filter((item) => {
    if (filter === 'pending') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await onToggleActionItem(id, completed);
      onShowToast?.(
        completed ? 'Action item marked completed' : 'Action item marked pending',
        'success'
      );
    } catch {
      onShowToast?.('Failed to update action item. Please try again.', 'error');
    }
  };

  const handleUpdate = async (id: string, input: UpdateActionItemInput) => {
    if (!onUpdateActionItem) return;
    try {
      await onUpdateActionItem(id, input);
      onShowToast?.('Action item updated', 'success');
    } catch {
      onShowToast?.('Failed to update action item', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDeleteActionItem) return;
    try {
      await onDeleteActionItem(id);
      onShowToast?.('Action item deleted', 'success');
    } catch {
      onShowToast?.('Failed to delete action item', 'error');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !onAddActionItem) return;

    setIsSubmitting(true);
    try {
      await onAddActionItem(newTitle.trim(), newAssignee.trim() || undefined);
      setNewTitle('');
      setNewAssignee('');
      setIsAdding(false);
      onShowToast?.('New action item created', 'success');
    } catch {
      onShowToast?.('Failed to create action item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Progress Metric Card */}
      <div
        style={{
          padding: '0.9rem 1rem',
          backgroundColor: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            <CheckCircleIcon size={16} />
            Execution Progress
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {completedCount} of {totalCount} completed ({Math.round(progressPercent)}%)
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div
          style={{
            height: '6px',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: 'var(--status-completed)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 250ms ease-in-out',
            }}
          />
        </div>
      </div>

      {/* Filter Tabs & Add Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['all', 'pending', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              style={{
                fontSize: '0.75rem',
                fontWeight: filter === tab ? 600 : 500,
                color: filter === tab ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor:
                  filter === tab ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                textTransform: 'capitalize',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {onAddActionItem && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--primary)',
              backgroundColor: 'var(--primary-faint)',
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <PlusIcon size={13} />
            Add Task
          </button>
        )}
      </div>

      {/* Inline Add Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: '0.85rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <input
            type="text"
            placeholder="Task description..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.45rem 0.65rem',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Assignee (optional, e.g. Marcus Chen)"
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.45rem 0.65rem',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              disabled={isSubmitting}
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newTitle.trim()}
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: 'var(--primary)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                cursor: isSubmitting ? 'wait' : 'pointer',
              }}
            >
              {isSubmitting ? 'Saving...' : 'Add Action Item'}
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredItems.length === 0 ? (
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '1.5rem 0',
            }}
          >
            {totalCount === 0
              ? 'No action items created for this meeting.'
              : `No ${filter} action items.`}
          </p>
        ) : (
          filteredItems.map((item) => (
            <ActionItemRow
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onUpdate={onUpdateActionItem ? handleUpdate : undefined}
              onDelete={onDeleteActionItem ? handleDelete : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
};
