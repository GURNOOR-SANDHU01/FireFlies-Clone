/**
 * File: src/hooks/useAudioPlayer.ts
 *
 * Purpose:
 * Custom React hook isolating media player state and controlling playback time, duration, and seek.
 *
 * Responsibilities:
 * - Maintain HTMLAudioElement reference.
 * - Track currentTime, duration, playing state, seeking state, volume, and playback rate.
 * - Provide play(), pause(), togglePlay(), and seek() functions.
 * - Gracefully support both real audio elements and simulated timer playback when no audio file is present.
 *
 * This hook does NOT:
 * - Match transcript segments or calculate active lines (delegated to useTranscriptSync).
 * - Render player UI components.
 * - Fetch meeting or audio resources.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseAudioPlayerOptions {
  src?: string;
  initialDuration?: number;
}

export interface UseAudioPlayerReturn {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isSeeking: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (timeInSeconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  skipBy: (deltaSeconds: number) => void;
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}): UseAudioPlayerReturn {
  const { src, initialDuration = 0 } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(initialDuration);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1);

  // Effective duration derives from initialDuration or metadata duration
  const effectiveDuration = duration > 0 ? duration : (initialDuration || 0);

  // Fallback timer reference when audio element has no playable media file
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSyntheticPlayingRef = useRef<boolean>(false);

  // Stop synthetic timer
  const stopSyntheticTimer = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    isSyntheticPlayingRef.current = false;
  }, []);

  // Start synthetic timer
  const startSyntheticTimer = useCallback(() => {
    stopSyntheticTimer();
    isSyntheticPlayingRef.current = true;
    const intervalMs = 250;
    fallbackTimerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (intervalMs / 1000) * playbackRate;
        if (duration > 0 && next >= duration) {
          stopSyntheticTimer();
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
    }, intervalMs);
  }, [duration, playbackRate, stopSyntheticTimer]);

  // Synchronize audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isSeeking && !isSyntheticPlayingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
      stopSyntheticTimer();
    };

    const onEnded = () => {
      setIsPlaying(false);
      stopSyntheticTimer();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      stopSyntheticTimer();
    };
  }, [isSeeking, stopSyntheticTimer]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (audio && src) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // If browser blocks autoplay or source fails, fallback to synthetic ticker
          setIsPlaying(true);
          startSyntheticTimer();
        });
    } else {
      setIsPlaying(true);
      startSyntheticTimer();
    }
  }, [src, startSyntheticTimer]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    stopSyntheticTimer();
    setIsPlaying(false);
  }, [stopSyntheticTimer]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const seek = useCallback(
    (timeInSeconds: number) => {
      const clamped = Math.max(0, effectiveDuration > 0 ? Math.min(timeInSeconds, effectiveDuration) : timeInSeconds);
      setIsSeeking(true);
      setCurrentTime(clamped);

      const audio = audioRef.current;
      if (audio) {
        try {
          audio.currentTime = clamped;
        } catch {
          // Ignore if audio element not yet loaded
        }
      }

      setIsSeeking(false);
    },
    [effectiveDuration]
  );

  const skipBy = useCallback(
    (deltaSeconds: number) => {
      seek(currentTime + deltaSeconds);
    },
    [currentTime, seek]
  );

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(vol, 1));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      audioRef.current.muted = clamped === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      const restored = volume === 0 ? 0.75 : volume;
      setVolumeState(restored);
      if (audioRef.current) {
        audioRef.current.muted = false;
        audioRef.current.volume = restored;
      }
    } else {
      setIsMuted(true);
      if (audioRef.current) {
        audioRef.current.muted = true;
      }
    }
  }, [isMuted, volume]);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  return {
    audioRef,
    currentTime,
    duration: effectiveDuration,
    isPlaying,
    isSeeking,
    volume,
    isMuted,
    playbackRate,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    skipBy,
  };
}
