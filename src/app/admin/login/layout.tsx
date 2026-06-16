import ClientProviders from '@/components/ClientProviders'

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>
}
