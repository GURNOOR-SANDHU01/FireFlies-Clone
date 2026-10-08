/**
 * File: src/components/workspace/AudioPlayer.tsx
 *
 * Purpose:
 * Standalone media player component providing audio playback controls, timecode display, and interactive seek bar.
 *
 * Responsibilities:
 * - Render Play/Pause toggle with prominent visual affordance.
 * - Render skip forward/backward buttons (-10s / +10s).
 * - Render scrubbable seek progress bar reflecting currentTime and duration.
 * - Render formatted digital timecodes (MM:SS / HH:MM:SS).
 * - Support volume control, mute toggle, and playback speed switching (1x, 1.25x, 1.5x, 2x).
 * - Mount hidden HTMLAudioElement bound to useAudioPlayer ref.
 *
 * This component does NOT:
 * - Own media player state (receives state from useAudioPlayer).
 * - Match transcript lines (delegated to useTranscriptSync).
 */

'use client';

import React, { useState } from 'react';
import { formatTimeCode } from '@/lib/formatters';
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from '@/components/common/Icons';

export interface AudioPlayerProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  onTogglePlay: () => void;
  onSeek: (timeInSeconds: number) => void;
  onSkipBy: (deltaSeconds: number) => void;
  onSetVolume: (volume: number) => void;
  onToggleMute: () => void;
  onSetPlaybackRate: (rate: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  audioSrc?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTime,
  duration,
  isPlaying,
  volume,
  isMuted,
  playbackRate,
  onTogglePlay,
  onSeek,
  onSkipBy,
  onSetVolume,
  onToggleMute,
  onSetPlaybackRate,
  audioRef,
  audioSrc,
}) => {
  const [isHoveringBar, setIsHoveringBar] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
  };

  const speedOptions = [1, 1.25, 1.5, 2];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.85rem 1.25rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
      }}
    >
      {/* Hidden audio element bound to hook */}
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {/* Top Row: Seek Bar & Timecodes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            minWidth: '42px',
          }}
        >
          {formatTimeCode(currentTime)}
        </span>

        {/* Custom Seek Bar Slider */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            height: '24px',
          }}
          onMouseEnter={() => setIsHoveringBar(true)}
          onMouseLeave={() => setIsHoveringBar(false)}
        >
          {/* Track background */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: isHoveringBar ? '6px' : '4px',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              transition: 'height var(--transition-fast)',
            }}
          >
            {/* Filled progress */}
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'var(--accent-gradient)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 80ms linear',
              }}
            />
          </div>

          {/* Interactive Range Input overlay */}
          <input
            type="range"
            min={0}
            max={duration > 0 ? duration : 100}
            step={0.1}
            value={currentTime}
            onChange={handleSliderChange}
            aria-label="Audio seek bar"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              margin: 0,
            }}
          />
        </div>

        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            minWidth: '42px',
            textAlign: 'right',
          }}
        >
          {formatTimeCode(duration)}
        </span>
      </div>

      {/* Bottom Row: Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {/* Left: Skip & Play/Pause */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Skip Back 10s */}
          <button
            type="button"
            onClick={() => onSkipBy(-10)}
            title="Rewind 10 seconds"
            aria-label="Rewind 10 seconds"
            style={{
              color: 'var(--text-muted)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              transition: 'color var(--transition-fast), background-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <SkipBackIcon size={18} />
          </button>

          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause audio' : 'Play audio'}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              transition: 'transform var(--transition-fast), background-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>

          {/* Skip Forward 10s */}
          <button
            type="button"
            onClick={() => onSkipBy(10)}
            title="Fast forward 10 seconds"
            aria-label="Fast forward 10 seconds"
            style={{
              color: 'var(--text-muted)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              transition: 'color var(--transition-fast), background-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <SkipForwardIcon size={18} />
          </button>
        </div>

        {/* Right: Volume & Speed Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Volume Control */}
          <div
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              type="button"
              onClick={onToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              style={{
                color: isMuted ? 'var(--status-danger)' : 'var(--text-muted)',
                padding: '0.35rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = isMuted ? 'var(--status-danger)' : 'var(--text-muted)')
              }
            >
              {isMuted || volume === 0 ? <VolumeMuteIcon size={17} /> : <VolumeIcon size={17} />}
            </button>

            {/* Hover Volume Slider */}
            {showVolumeSlider && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.65rem',
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: '6px',
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'center',
                  width: '90px',
                }}
              >
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onSetVolume(parseFloat(e.target.value))}
                  aria-label="Volume slider"
                  style={{
                    width: '100%',
                    accentColor: 'var(--primary)',
                    cursor: 'pointer',
                  }}
                />
              </div>
            )}
          </div>

          {/* Speed Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {speedOptions.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => onSetPlaybackRate(speed)}
                title={`Playback rate ${speed}x`}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: playbackRate === speed ? 600 : 500,
                  color: playbackRate === speed ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor:
                    playbackRate === speed ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  padding: '0.15rem 0.35rem',
                  borderRadius: 'var(--radius-sm)',
                  border: playbackRate === speed ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
