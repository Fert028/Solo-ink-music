'use client'

import { useEffect, useState, useCallback } from 'react'
import { FiMusic } from 'react-icons/fi'
import { usePlayer } from '@/components/PlayerContext'
import TrackCard from '@/components/TrackCard/TrackCard'
import type { Track } from '@/types'
import styles from './page.module.scss'

export default function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [filtered, setFiltered] = useState<Track[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { currentTrack, isPlaying, playTrack, setPlaylist } = usePlayer()

  useEffect(() => {
    fetch('/api/tracks')
      .then(r => r.json())
      .then((data: Track[]) => {
        setTracks(data)
        setFiltered(data)
        setPlaylist(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [setPlaylist])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(tracks)
      setPlaylist(tracks)
      return
    }
    const q = search.toLowerCase()
    const result = tracks.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.genre?.toLowerCase().includes(q)
    )
    setFiltered(result)
    setPlaylist(result)
  }, [search, tracks, setPlaylist])

  const handlePlay = useCallback(
    (track: Track, index: number) => {
      if (currentTrack?.id === track.id) {
        // toggle handled in Player via context
      } else {
        playTrack(track, index)
      }
    },
    [currentTrack, playTrack]
  )

  return (
    <>
      {/* Search */}
      <div className={styles.tracks__search}>
        <input
          type="text"
          placeholder="Поиск по названию, исполнителю или жанру..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Column headers */}
      {filtered.length > 0 && (
        <div className={styles.tracks__col_headers || 'tracks-col-headers'}>
          <span style={{ width: 32, flexShrink: 0 }}>#</span>
          <span style={{ width: 48, flexShrink: 0 }} />
          <span style={{ flex: 1 }}>Название</span>
          <span style={{ minWidth: 120, textAlign: 'right' }}>Жанр / Длит.</span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className={styles.tracks__empty}>
          <div style={{ animation: 'pulse 1.5s ease infinite', color: 'var(--accent)', fontSize: 40, marginBottom: 16 }}>
            ♪
          </div>
          <p>Загрузка треков...</p>
        </div>
      ) : filtered.length === 0 || undefined ? (
        <div className={styles.tracks__empty}>
          <div className={styles['tracks__empty-icon']}><FiMusic /></div>
          <p>{search ? 'Ничего не найдено' : 'Пока нет треков'}</p>
        </div>
      ) : (
        <div className={styles.tracks__list}>
          {filtered.map((track, i) => (
            <TrackCard
              key={track.id}
              track={track}
              index={i}
              isActive={currentTrack?.id === track.id}
              isPlaying={isPlaying && currentTrack?.id === track.id}
              onClick={() => handlePlay(track, i)}
            />
          ))}
        </div>
      )}
    </>
  )
}
