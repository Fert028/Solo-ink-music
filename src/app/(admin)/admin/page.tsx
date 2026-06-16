export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiMusic, FiUpload, FiBarChart2 } from 'react-icons/fi'
import styles from './admin.module.scss'

async function getStats() {
  try {
    const [totalTracks, totalPlays, recentTracks] = await Promise.all([
      prisma.track.count(),
      prisma.track.aggregate({ _sum: { plays: true } }),
      prisma.track.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])
    return {
      totalTracks,
      totalPlays: totalPlays._sum.plays || 0,
      recentTracks,
    }
  } catch {
    return { totalTracks: 0, totalPlays: 0, recentTracks: [] }
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <div className={styles.page__header}>
        <h1 className={styles.page__title}>Панель управления</h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {[
          { icon: <FiMusic />, label: 'Всего треков', value: stats.totalTracks },
          { icon: <FiBarChart2 />, label: 'Всего прослушиваний', value: stats.totalPlays },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '24px',
          }}>
            <div style={{ color: 'var(--accent)', fontSize: 24, marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--accent)' }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 32,
      }}>
        <Link href="/admin/upload" style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--accent)', color: '#0A0A0F',
          padding: '14px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          textDecoration: 'none', transition: '0.2s',
        }}>
          <FiUpload /> Загрузить трек
        </Link>
        <Link href="/admin/tracks" style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)',
          padding: '14px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          textDecoration: 'none', transition: '0.2s',
        }}>
          <FiMusic /> Управление треками
        </Link>
      </div>

      {stats.recentTracks.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
            Последние треки
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.recentTracks.map((track) => (
              <div key={track.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '12px 16px',
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{track.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>{track.artist}</div>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{track.plays} ▶</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
