'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  FiSkipBack, FiSkipForward, FiPlay, FiPause,
  FiVolume2, FiVolume1, FiVolumeX, FiMusic
} from 'react-icons/fi'
import { usePlayer } from '../PlayerContext'
import styles from './Player.module.scss'

function formatTime(sec: number): string {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Player() {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrev } = usePlayer()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)

  // Sync play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPlaying])

  // Change src when track changes.
  // Instead of pointing <audio> straight at the Blob URL (which makes the
  // browser stream via HTTP range requests — flaky on desktop Firefox and
  // causes the "playback aborted" / stops-after-a-second bug), we download the
  // whole file once and play it from an in-memory object URL. No range
  // requests, no streaming hiccups. Files are only a few MB, so this is cheap.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    let objectUrl: string | null = null
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(currentTrack.filePath)
        if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`)
        const blob = await res.blob()
        if (cancelled) return // track changed again before download finished
        objectUrl = URL.createObjectURL(blob)
        audio.src = objectUrl
        audio.load()
        if (isPlaying) audio.play().catch(() => {})
      } catch (err) {
        console.error('Audio load error:', err)
      }
    }

    load()

    // increment plays
    fetch(`/api/tracks/${currentTrack.id}/play`, { method: 'POST' }).catch(() => {})

    // Cleanup: free the previous object URL when the track changes or unmounts.
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id])

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setDuration(audio.duration)
  }, [])

  const handleEnded = useCallback(() => {
    playNext()
  }, [playNext])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * duration
  }, [duration])

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (audioRef.current) {
      audioRef.current.volume = val
      setIsMuted(val === 0)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isMuted) {
      audio.volume = volume || 0.5
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }, [isMuted, volume])

  const VolumeIcon = isMuted || volume === 0
    ? FiVolumeX
    : volume < 0.5
      ? FiVolume1
      : FiVolume2

  const progress = duration ? (currentTime / duration) * 100 : 0

  if (!currentTrack) return null

  return (
    <div className={styles.player}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      <div className={styles.player__inner}>
        {/* Track info */}
        <div className={styles.player__info}>
          {currentTrack.coverPath ? (
            <div className={styles.player__cover}>
              <Image
                src={currentTrack.coverPath}
                alt={currentTrack.title}
                width={52}
                height={52}
              />
            </div>
          ) : (
            <div className={styles['player__cover-placeholder']}>
              <FiMusic />
            </div>
          )}
          <div className={styles.player__meta}>
            <div className={styles.player__title}>{currentTrack.title}</div>
            <div className={styles.player__artist}>{currentTrack.artist}</div>
          </div>
          <div className={`${styles.player__wave} ${!isPlaying ? styles.paused : ''}`}>
            {[...Array(5)].map((_, i) => <span key={i} />)}
          </div>
        </div>

        {/* Controls */}
        <div className={styles.player__controls}>
          <div className={styles.player__buttons}>
            <button
              className={styles.player__btn}
              onClick={playPrev}
              title="Предыдущий"
            >
              <FiSkipBack />
            </button>
            <button
              className={`${styles.player__btn} ${styles['player__btn--play']}`}
              onClick={togglePlay}
              title={isPlaying ? 'Пауза' : 'Воспроизвести'}
            >
              {isPlaying ? <FiPause /> : <FiPlay style={{ marginLeft: 2 }} />}
            </button>
            <button
              className={styles.player__btn}
              onClick={playNext}
              title="Следующий"
            >
              <FiSkipForward />
            </button>
          </div>

          <div className={styles.player__progress}>
            <span className={styles.player__time}>{formatTime(currentTime)}</span>
            <div
              className={styles['player__bar-wrapper']}
              onClick={handleSeek}
            >
              <div
                className={styles['player__bar-fill']}
                style={{ width: `${progress}%` }}
              />
              <div
                className={styles['player__bar-thumb']}
                style={{ left: `${progress}%` }}
              />
            </div>
            <span className={`${styles.player__time} ${styles['player__time--right']}`}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className={styles.player__volume}>
          <button
            className={styles['player__volume-icon']}
            onClick={toggleMute}
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            <VolumeIcon />
          </button>
          <input
            type="range"
            className={styles['player__volume-slider']}
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
          />
        </div>
      </div>
    </div>
  )
}
