'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiTrash2, FiEdit2, FiMusic, FiUpload, FiX, FiCheck } from 'react-icons/fi'
import type { Track } from '@/types'
import styles from '../admin.module.scss'

interface EditState {
  id: number
  title: string
  artist: string
  album: string
  genre: string
}

export default function AdminTracksPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [editing, setEditing] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchTracks = useCallback(async () => {
    const res = await fetch('/api/tracks')
    const data: Track[] = await res.json()
    setTracks(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchTracks() }, [fetchTracks])

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот трек?')) return
    setDeleting(id)
    await fetch(`/api/tracks/${id}`, { method: 'DELETE' })
    setTracks(prev => prev.filter(t => t.id !== id))
    setDeleting(null)
  }

  const startEdit = (track: Track) => {
    setEditing({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album || '',
      genre: track.genre || '',
    })
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    const res = await fetch(`/api/tracks/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    if (res.ok) {
      const updated: Track = await res.json()
      setTracks(prev => prev.map(t => t.id === updated.id ? updated : t))
      setEditing(null)
    }
    setSaving(false)
  }

  const cellInput = (val: string, key: keyof Omit<EditState, 'id'>) => (
    <input
      value={val}
      onChange={e => setEditing(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--accent)',
        borderRadius: 6,
        padding: '4px 8px',
        color: 'var(--text-primary)',
        fontSize: 13,
        width: '100%',
        outline: 'none',
        fontFamily: 'Inter, sans-serif',
      }}
    />
  )

  return (
    <div>
      <div className={styles.page__header}>
        <h1 className={styles.page__title}>Треки</h1>
        <Link href="/admin/upload" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--accent)', color: '#0A0A0F',
          padding: '10px 18px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          textDecoration: 'none',
        }}>
          <FiUpload /> Загрузить
        </Link>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 48 }}>Загрузка...</div>
      ) : tracks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-secondary)' }}>
          <FiMusic style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }} />
          <p>Нет треков. <Link href="/admin/upload" style={{ color: 'var(--accent)' }}>Загрузить первый</Link></p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['', 'Название', 'Исполнитель', 'Жанр', 'Прослуш.', ''].map((h, i) => (
                  <th key={i} style={{
                    padding: '8px 12px', textAlign: 'left',
                    fontSize: 11, color: 'var(--text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    fontWeight: 500,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tracks.map(track => {
                const isEditing = editing?.id === track.id
                return (
                  <tr key={track.id} style={{
                    borderBottom: '1px solid var(--border)',
                    background: isEditing ? 'var(--accent-muted)' : 'transparent',
                    transition: 'background 0.15s',
                  }}>
                    {/* Cover */}
                    <td style={{ padding: '10px 12px', width: 52 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 8,
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--accent)', fontSize: 16,
                      }}>
                        {track.coverPath
                          ? <Image src={track.coverPath} alt={track.title} width={40} height={40} style={{ objectFit: 'cover' }} />
                          : <FiMusic />
                        }
                      </div>
                    </td>

                    {/* Title */}
                    <td style={{ padding: '10px 12px', maxWidth: 200 }}>
                      {isEditing
                        ? cellInput(editing.title, 'title')
                        : <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{track.title}</span>
                      }
                    </td>

                    {/* Artist */}
                    <td style={{ padding: '10px 12px' }}>
                      {isEditing
                        ? cellInput(editing.artist, 'artist')
                        : <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{track.artist}</span>
                      }
                    </td>

                    {/* Genre */}
                    <td style={{ padding: '10px 12px' }}>
                      {isEditing
                        ? cellInput(editing.genre, 'genre')
                        : track.genre && (
                          <span style={{
                            fontSize: 11, color: 'var(--text-secondary)',
                            background: 'var(--surface-raised)',
                            border: '1px solid var(--border)',
                            padding: '2px 8px', borderRadius: 999,
                          }}>{track.genre}</span>
                        )
                      }
                    </td>

                    {/* Plays */}
                    <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {track.plays}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={handleSave} disabled={saving} style={{
                            color: '#52C47E', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
                          }}><FiCheck /></button>
                          <button onClick={() => setEditing(null)} style={{
                            color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
                          }}><FiX /></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => startEdit(track)} style={{
                            color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
                            transition: 'color 0.15s',
                          }} title="Редактировать"><FiEdit2 /></button>
                          <button
                            onClick={() => handleDelete(track.id)}
                            disabled={deleting === track.id}
                            style={{
                              color: deleting === track.id ? 'var(--border)' : '#E05252',
                              background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
                            }}
                            title="Удалить"
                          ><FiTrash2 /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
