import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import ClientProviders from '@/components/ClientProviders'
import AdminSidebar from './AdminSidebar'
import styles from './admin.module.scss'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    redirect('/admin/login')
  }

  return (
    <ClientProviders>
      <div className={styles.layout}>
        <AdminSidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </ClientProviders>
  )
}
