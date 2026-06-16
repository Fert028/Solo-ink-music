import ClientProviders from '@/components/ClientProviders'
import Header from '@/components/Header/Header'
import Player from '@/components/Player/Player'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <Header />
      <main>{children}</main>
      <Player />
    </ClientProviders>
  )
}
