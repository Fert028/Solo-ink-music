'use client'

import Link from 'next/link'
import { FiSun, FiMoon } from 'react-icons/fi'
import { FaTelegramPlane, FaVk } from 'react-icons/fa'
import { useTheme } from '../ThemeProvider'
import styles from './Header.module.scss'

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className={styles.header}>
      <div className={`container ${styles.header__inner}`}>
        <Link href="/" className={styles.header__logo}>
          <div className={styles['header__logo-mark']}>
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="18" cy="22" rx="8" ry="10" fill="var(--accent)" opacity="0.15" />
              <path
                d="M18 4 C18 4, 26 12, 26 20 C26 25.5, 22.5 30, 18 30 C13.5 30, 10 25.5, 10 20 C10 12, 18 4, 18 4Z"
                fill="var(--accent)"
              />
              <circle cx="18" cy="21" r="4" fill="var(--bg)" />
            </svg>
          </div>
          <div className={styles['header__logo-text']}>
            <span className="brand-main">Solo ink.</span>
            <span className="brand-sub">Music</span>
          </div>
        </Link>

        <nav className={styles.header__nav}>
          <div className={styles.header__social}>
            <a
              href="https://vk.com/ublmashup"
              target="_blank"
              rel="noopener noreferrer"
              className={styles['header__social-link']}
              title="ВКонтакте"
            >
              <FaVk />
            </a>
            <a
              href="https://t.me/YOUR_LINK"
              target="_blank"
              rel="noopener noreferrer"
              className={styles['header__social-link']}
              title="Telegram"
            >
              <FaTelegramPlane />
            </a>
          </div>

          <div className={styles.header__divider} />

          <button
            className={styles['header__theme-toggle']}
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
        </nav>
      </div>
    </header>
  )
}
