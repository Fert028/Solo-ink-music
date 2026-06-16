import type { Metadata } from 'next'
import '../styles/globals.scss'

export const metadata: Metadata = {
  title: 'Solo ink. Music',
  description: 'Музыкальная онлайн-платформа Solo ink. Music',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" data-theme="dark" suppressHydrationWarning>
      <head />
      <body>{children}</body>
    </html>
  )
}
