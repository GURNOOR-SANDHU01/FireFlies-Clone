/**
 * File: src/components/workspace/MeetingWorkspace.tsx
 *
 * Purpose:
 * Primary meeting workspace orchestrating the AudioPlayer, TranscriptPanel,
 * and the right-side AI Intelligence Panel (Summary, Takeaways, Chapters, Action Items),
 * as well as meeting editing and deletion triggers.
 *
 * Responsibilities:
 * - Render MeetingHeader with metadata, participant badges, edit/delete actions, and export actions.
 * - Render pinned AudioPlayer control bar.
 * - Render TranscriptPanel with search highlighting, next/prev navigation, and playback synchronization.
 * - Render Right-Side Intelligence Panel with tabbed navigation (Summary, Action Items, Chapters).
 * - Wire up action item creation, editing, deletion, and completion callbacks.
 * - Implement responsive 2-column workspace layout adapting gracefully to mobile/tablet viewports.
 *
 * This component does NOT:
 * - Fetch meeting API data directly (receives models from page / useMeetingDetail).
 * - Mutate backend databases directly.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Meeting, UpdateMeetingInput } from '@/types/meeting';
import { TranscriptSegment } from '@/types/transcript';
import { MeetingSummary, MeetingTopic } from '@/types/summary';
import { ActionItem, UpdateActionItemInput } from '@/types/actionItem';
import { UseAudioPlayerReturn } from '@/hooks/useAudioPlayer';
import { UseTranscriptSyncReturn } from '@/hooks/useTranscriptSync';
import { UseTranscriptSearchReturn } from '@/hooks/useTranscriptSearch';
import { MeetingHeader } from './MeetingHeader';
import { AudioPlayer } from './AudioPlayer';
import { TranscriptPanel } from './TranscriptPanel';
import { SummaryPanel } from './SummaryPanel';
import { TopicsPanel } from './TopicsPanel';
import { ActionItemsPanel } from './ActionItemsPanel';
import { SparklesIcon, CheckCircleIcon, ClockIcon } from '@/components/common/Icons';

export interface MeetingWorkspaceProps {
  meeting: Meeting;
  transcript: TranscriptSegment[];
  summary: MeetingSummary | null;
  topics: MeetingTopic[];
  actionItems: ActionItem[];
  audioPlayer: UseAudioPlayerReturn;
  transcriptSync: UseTranscriptSyncReturn;
  transcriptSearch: UseTranscriptSearchReturn;
  onUpdateMeeting?: (input: UpdateMeetingInput) => Promise<void>;
  onDeleteMeeting?: () => Promise<void>;
  onToggleActionItem: (id: string, completed: boolean) => Promise<boolean>;
  onAddActionItem?: (title: string, assignee?: string, dueDate?: string) => Promise<ActionItem | null>;
  onEditActionItem?: (id: string, input: UpdateActionItemInput) => Promise<ActionItem>;
  onRemoveActionItem?: (id: string) => Promise<void>;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export type IntelligenceTab = 'summary' | 'action_items' | 'chapters';

export const MeetingWorkspace: React.FC<MeetingWorkspaceProps> = ({
  meeting,
  transcript,
  summary,
  topics,
  actionItems,
  audioPlayer,
  transcriptSync,
  transcriptSearch,
  onUpdateMeeting,
  onDeleteMeeting,
  onToggleActionItem,
  onAddActionItem,
  onEditActionItem,
  onRemoveActionItem,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<IntelligenceTab>('summary');

  const pendingActionItemsCount = actionItems.filter((i) => !i.completed).length;

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      onShowToast?.('Meeting link copied to clipboard', 'info');
    }
  };

  const handleExportTranscript = () => {
    const textContent = transcript
      .map((seg) => `[${seg.speaker}]: ${seg.text}`)
      .join('\n\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meeting.title.replace(/[^a-zA-Z0-9-_]/g, '_')}_transcript.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast?.('Transcript exported to text file', 'success');
  };

  // Synchronize search match navigation with audio and scroll position
  const currentMatch = transcriptSearch.currentMatch;
  useEffect(() => {
    if (currentMatch) {
      transcriptSync.scrollToSegment(currentMatch.segmentId);
      transcriptSync.handleSeekToSegment(currentMatch.startTime);
    }
  }, [currentMatch, transcriptSync]);

  return (
    <div
      className="animate-fade-in"
      style={{
        maxWidth: '1500px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Workspace Header */}
      <MeetingHeader
        meeting={meeting}
        onShareLink={handleShareLink}
        onExportTranscript={handleExportTranscript}
        onUpdateMeeting={onUpdateMeeting}
        onDeleteMeeting={onDeleteMeeting}
      />

      {/* Persistent Audio Media Player */}
      <AudioPlayer
        currentTime={audioPlayer.currentTime}
        duration={audioPlayer.duration || meeting.duration}
        isPlaying={audioPlayer.isPlaying}
        volume={audioPlayer.volume}
        isMuted={audioPlayer.isMuted}
        playbackRate={audioPlayer.playbackRate}
        onTogglePlay={audioPlayer.togglePlay}
        onSeek={audioPlayer.seek}
        onSkipBy={audioPlayer.skipBy}
        onSetVolume={audioPlayer.setVolume}
        onToggleMute={audioPlayer.toggleMute}
        onSetPlaybackRate={audioPlayer.setPlaybackRate}
        audioRef={audioPlayer.audioRef}
        audioSrc={meeting.audioUrl}
      />

      {/* Main Split Workspace Grid */}
      <div
        className="meeting-workspace-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Interactive Transcript Panel */}
        <div style={{ minHeight: '520px', height: '620px', display: 'flex', flexDirection: 'column' }}>
          <TranscriptPanel
            segments={transcript}
            filteredSegments={transcriptSearch.filteredSegments}
            activeSegmentId={transcriptSync.activeSegmentId}
            searchQuery={transcriptSearch.searchQuery}
            totalMatches={transcriptSearch.totalMatches}
            currentMatchIndex={transcriptSearch.currentMatchIndex}
            onSearchChange={transcriptSearch.setSearchQuery}
            onClearSearch={transcriptSearch.clearSearch}
            onNextMatch={transcriptSearch.nextMatch}
            onPrevMatch={transcriptSearch.prevMatch}
            onSeek={transcriptSync.handleSeekToSegment}
            onRegisterRef={transcriptSync.registerLineRef}
            scrollContainerRef={transcriptSync.scrollContainerRef}
            autoScroll={transcriptSync.autoScroll}
            onToggleAutoScroll={transcriptSync.setAutoScroll}
          />
        </div>

        {/* Right Column: Intelligence Panel */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            height: '620px',
            overflow: 'hidden',
          }}
        >
          {/* Intelligence Panel Navigation Tabs */}
          <div
            style={{
              padding: '0.65rem 1rem',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'rgba(13, 18, 31, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
            }}
          >
            {/* Tab: Summary */}
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.825rem',
                fontWeight: activeTab === 'summary' ? 600 : 500,
                color: activeTab === 'summary' ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor:
                  activeTab === 'summary' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                border: activeTab === 'summary' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              <SparklesIcon size={14} />
              AI Summary
            </button>

            {/* Tab: Action Items */}
            <button
              type="button"
              onClick={() => setActiveTab('action_items')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.825rem',
                fontWeight: activeTab === 'action_items' ? 600 : 500,
                color: activeTab === 'action_items' ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor:
                  activeTab === 'action_items' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                border: activeTab === 'action_items' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              <CheckCircleIcon size={14} />
              Action Items
              {pendingActionItemsCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--status-completed)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.05rem 0.35rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {pendingActionItemsCount}
                </span>
              )}
            </button>

            {/* Tab: Chapters */}
            <button
              type="button"
              onClick={() => setActiveTab('chapters')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.825rem',
                fontWeight: activeTab === 'chapters' ? 600 : 500,
                color: activeTab === 'chapters' ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor:
                  activeTab === 'chapters' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                border: activeTab === 'chapters' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              <ClockIcon size={14} />
              Chapters ({topics.length})
            </button>
          </div>

          {/* Tab Content Panel (Scrollable) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
            {activeTab === 'summary' && <SummaryPanel summary={summary} />}
            {activeTab === 'action_items' && (
              <ActionItemsPanel
                actionItems={actionItems}
                onToggleActionItem={onToggleActionItem}
                onAddActionItem={onAddActionItem}
                onUpdateActionItem={onEditActionItem}
                onDeleteActionItem={onRemoveActionItem}
                onShowToast={onShowToast}
              />
            )}
            {activeTab === 'chapters' && (
              <TopicsPanel
                topics={topics}
                currentTime={audioPlayer.currentTime}
                onSeek={transcriptSync.handleSeekToSegment}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
