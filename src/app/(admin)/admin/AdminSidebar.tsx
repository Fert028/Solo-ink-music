'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FiMusic, FiUpload, FiHome, FiLogOut } from 'react-icons/fi'
import styles from './admin.module.scss'

const links = [
  { href: '/admin', label: 'Обзор', icon: <FiHome /> },
  { href: '/admin/tracks', label: 'Треки', icon: <FiMusic /> },
  { href: '/admin/upload', label: 'Загрузить трек', icon: <FiUpload /> },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__logo}>
        <div className={styles['sidebar__logo-mark']}>
          <svg viewBox="0 0 28 28" fill="none">
            <path d="M14 3C14 3,20 9,20 15C20 18.9,17.3 22,14 22C10.7 22,8 18.9,8 15C8 9,14 3,14 3Z" fill="var(--accent)" />
            <circle cx="14" cy="15.5" r="3.5" fill="var(--bg)" />
          </svg>
        </div>
        <div className={styles['sidebar__logo-text']}>
          <div className="brand">Solo ink.</div>
          <div className="label">Admin</div>
        </div>
      </div>

      <nav className={styles.sidebar__nav}>
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.sidebar__link} ${
              pathname === link.href ? styles.active : ''
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>

      <div className={styles.sidebar__footer}>
        <Link href="/" className={styles.sidebar__link} target="_blank">
          <FiHome />
          На сайт
        </Link>
        <button className={styles.sidebar__logout} onClick={handleLogout}>
          <FiLogOut />
          Выйти
        </button>
      </div>
    </aside>
  )
}
