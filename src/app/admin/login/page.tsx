'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '24px',
  } as React.CSSProperties,
  card: {
    width: '100%',
    maxWidth: '400px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '18px',
    padding: '40px',
  } as React.CSSProperties,
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Неверный логин или пароль')
      }
    } catch {
      setError('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  const inputSt: React.CSSProperties = {
    background: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
  }

  const labelSt: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '6px',
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 12px' }}>
            <ellipse cx="24" cy="30" rx="10" ry="12" fill="var(--accent)" opacity="0.15" />
            <path d="M24 6C24 6,34 16,34 26C34 32.6,29.5 38,24 38C18.5 38,14 32.6,14 26C14 16,24 6,24 6Z" fill="var(--accent)" />
            <circle cx="24" cy="27" r="5" fill="var(--bg)" />
          </svg>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--accent)' }}>
            Solo ink.
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Панель управления
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelSt} htmlFor="username">Логин</label>
            <input id="username" type="text" placeholder="admin" value={username}
              onChange={e => setUsername(e.target.value)} style={inputSt} required autoComplete="username" />
          </div>
          <div>
            <label style={labelSt} htmlFor="password">Пароль</label>
            <input id="password" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} style={inputSt} required autoComplete="current-password" />
          </div>
          {error && (
            <div style={{ color: '#E05252', background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} style={{
            padding: '12px', background: loading ? 'var(--border)' : 'var(--accent)',
            color: loading ? 'var(--text-secondary)' : '#0A0A0F',
            border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
            fontFamily: 'Inter, sans-serif', cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '4px', transition: 'all 0.2s',
          }}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
