'use client'

import { createContext, useContext, useState, useRef, useCallback } from 'react'
import type { Track } from '@/types'

interface PlayerContextValue {
  currentTrack: Track | null
  playlist: Track[]
  isPlaying: boolean
  currentIndex: number
  setPlaylist: (tracks: Track[]) => void
  playTrack: (track: Track, index: number) => void
  togglePlay: () => void
  playNext: () => void
  playPrev: () => void
  audioRef: React.RefObject<HTMLAudioElement | null>
}

const PlayerContext = createContext<PlayerContextValue>({
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  currentIndex: -1,
  setPlaylist: () => {},
  playTrack: () => {},
  togglePlay: () => {},
  playNext: () => {},
  playPrev: () => {},
  audioRef: { current: null },
})

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [playlist, setPlaylistState] = useState<Track[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const setPlaylist = useCallback((tracks: Track[]) => {
    setPlaylistState(tracks)
  }, [])

  const playTrack = useCallback((track: Track, index: number) => {
    setCurrentTrack(track)
    setCurrentIndex(index)
    setIsPlaying(true)
  }, [])

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const playNext = useCallback(() => {
    if (playlist.length === 0) return
    const next = (currentIndex + 1) % playlist.length
    playTrack(playlist[next], next)
  }, [playlist, currentIndex, playTrack])

  const playPrev = useCallback(() => {
    if (playlist.length === 0) return
    const prev = (currentIndex - 1 + playlist.length) % playlist.length
    playTrack(playlist[prev], prev)
  }, [playlist, currentIndex, playTrack])

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        playlist,
        isPlaying,
        currentIndex,
        setPlaylist,
        playTrack,
        togglePlay,
        playNext,
        playPrev,
        audioRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => useContext(PlayerContext)
