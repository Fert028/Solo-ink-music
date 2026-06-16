'use client'

import Image from 'next/image'
import { FiMusic, FiPlay, FiPause } from 'react-icons/fi'
import type { Track } from '@/types'
import styles from './TrackCard.module.scss'

interface TrackCardProps {
  track: Track
  index: number
  isActive: boolean
  isPlaying: boolean
  onClick: () => void
}

function formatDuration(sec?: number | null): string {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function TrackCard({ track, index, isActive, isPlaying, onClick }: TrackCardProps) {
  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      {/* Number / Play icon */}
      <div className={styles.card__num}>
        <span className={styles.card__index}>{index + 1}</span>
        <span className={styles['card__play-icon']}>
          {isActive && isPlaying ? <FiPause /> : <FiPlay />}
        </span>
      </div>

      {/* Cover */}
      <div className={styles.card__cover}>
        {track.coverPath ? (
          <Image src={track.coverPath} alt={track.title} width={48} height={48} />
        ) : (
          <span className={styles['card__cover-placeholder']}>
            <FiMusic />
          </span>
        )}
      </div>

      {/* Info */}
      <div className={styles.card__info}>
        <div className={styles.card__title}>{track.title}</div>
        <div className={styles.card__artist}>{track.artist}</div>
      </div>

      {/* Meta */}
      <div className={styles.card__meta}>
        {track.genre && (
          <span className={styles.card__genre}>{track.genre}</span>
        )}
        {track.duration && (
          <span className={styles.card__duration}>{formatDuration(track.duration)}</span>
        )}
        <span className={styles.card__plays}>{track.plays} ▶</span>
      </div>
    </div>
  )
}
