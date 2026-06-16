import { prisma } from '@/lib/prisma'
import styles from './page.module.scss'
import TrackList from './TrackList'

async function getTrackCount() {
  try {
    return await prisma.track.count()
  } catch {
    return 0
  }
}

export default async function HomePage() {
  const trackCount = await getTrackCount()

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.hero__label}>Независимая музыка</p>
          <h1 className={styles.hero__title}>
            Слушай. Чувствуй.<br />
            <span>Открывай новое.</span>
          </h1>
          <p className={styles.hero__subtitle}>
            Авторская музыка без авторских ограничений.
            Треки созданы для свободного прослушивания.
          </p>
          {trackCount > 0 && (
            <div className={styles.hero__stats}>
              <div className={styles.hero__stat}>
                <div className={styles['hero__stat-value']}>{trackCount}</div>
                <div className={styles['hero__stat-label']}>Треков</div>
              </div>
              <div className={styles.hero__stat}>
                <div className={styles['hero__stat-value']}>∞</div>
                <div className={styles['hero__stat-label']}>Свободное прослушивание</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Track list */}
      <section className={styles.tracks}>
        <div className="container">
          <div className={styles.tracks__header}>
            <h2 className={styles.tracks__title}>Все треки</h2>
            {trackCount > 0 && (
              <span className={styles.tracks__count}>{trackCount} треков</span>
            )}
          </div>
          <TrackList />
        </div>
      </section>
    </div>
  )
}
