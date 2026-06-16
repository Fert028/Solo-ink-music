'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FiUpload, FiMusic, FiX, FiCheck, FiImage } from 'react-icons/fi'
import styles from '../admin.module.scss'

export default function UploadPage() {
  const router = useRouter()
  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [genre, setGenre] = useState('')
  const [duration, setDuration] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleAudioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAudioFile(file)

    // Extract title from filename
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setTitle(nameWithoutExt)
    }

    // Get duration
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.onloadedmetadata = () => {
      setDuration(Math.round(audio.duration))
      URL.revokeObjectURL(url)
    }
  }, [title])

  const handleCoverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    const url = URL.createObjectURL(file)
    setCoverPreview(url)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioFile || !title) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('audio', audioFile)
      if (coverFile) formData.append('cover', coverFile)
      formData.append('title', title)
      formData.append('artist', artist || 'Unknown')
      if (album) formData.append('album', album)
      if (genre) formData.append('genre', genre)
      if (duration) formData.append('duration', duration.toString())

      const res = await fetch('/api/upload', { method: 'POST', body: formData })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/tracks')
          router.refresh()
        }, 1500)
      } else {
        const data = await res.json()
        setError(data.error || 'Ошибка загрузки')
      }
    } catch {
      setError('Ошибка соединения')
    } finally {
      setUploading(false)
    }
  }

  if (success) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#52C47E', fontSize: 56, marginBottom: 16 }}><FiCheck /></div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
            Трек успешно загружен!
          </div>
          <div style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Перенаправление...</div>
        </div>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    display: 'block',
    marginBottom: 6,
  }

  return (
    <div>
      <div className={styles.page__header}>
        <h1 className={styles.page__title}>Загрузить трек</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        {/* Audio file */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Аудио файл *</label>
          <div
            onClick={() => audioInputRef.current?.click()}
            style={{
              border: `2px dashed ${audioFile ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 12,
              padding: '32px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: audioFile ? 'var(--accent-muted)' : 'var(--surface)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ color: audioFile ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 32, marginBottom: 8 }}>
              {audioFile ? <FiMusic /> : <FiUpload />}
            </div>
            {audioFile ? (
              <>
                <div style={{ fontWeight: 600, color: 'var(--accent)', fontSize: 14 }}>{audioFile.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
                  {(audioFile.size / 1024 / 1024).toFixed(1)} MB
                  {duration && ` · ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Нажмите для выбора файла</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>MP3, OGG, WAV, FLAC, AAC</div>
              </>
            )}
          </div>
          <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioChange} style={{ display: 'none' }} />
        </div>

        {/* Cover */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Обложка (необязательно)</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div
              onClick={() => coverInputRef.current?.click()}
              style={{
                width: 80, height: 80,
                border: `1px dashed ${coverPreview ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--surface)',
              }}
            >
              {coverPreview
                ? <img src={coverPreview} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <FiImage style={{ color: 'var(--text-secondary)', fontSize: 24 }} />
              }
            </div>
            {coverPreview && (
              <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>
                <FiX />
              </button>
            )}
            {!coverPreview && (
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                PNG, JPG · Рекомендуется 500×500px
              </span>
            )}
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
        </div>

        {/* Grid of text fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Название *</label>
            <input
              style={inputStyle}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Название трека"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Исполнитель</label>
            <input
              style={inputStyle}
              value={artist}
              onChange={e => setArtist(e.target.value)}
              placeholder="Имя исполнителя"
            />
          </div>
          <div>
            <label style={labelStyle}>Альбом</label>
            <input
              style={inputStyle}
              value={album}
              onChange={e => setAlbum(e.target.value)}
              placeholder="Название альбома"
            />
          </div>
          <div>
            <label style={labelStyle}>Жанр</label>
            <input
              style={inputStyle}
              value={genre}
              onChange={e => setGenre(e.target.value)}
              placeholder="Например: Indie, Hip-hop..."
            />
          </div>
        </div>

        {error && (
          <div style={{ color: '#E05252', background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!audioFile || !title || uploading}
          style={{
            width: '100%', padding: '12px 20px',
            background: !audioFile || !title || uploading ? 'var(--border)' : 'var(--accent)',
            color: !audioFile || !title || uploading ? 'var(--text-secondary)' : '#0A0A0F',
            border: 'none', borderRadius: 10,
            fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
            cursor: !audioFile || !title || uploading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          {uploading ? (
            <>Загрузка...</>
          ) : (
            <><FiUpload /> Загрузить трек</>
          )}
        </button>
      </form>
    </div>
  )
}
