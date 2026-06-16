'use client'

import { ThemeProvider } from './ThemeProvider'
import { PlayerProvider } from './PlayerContext'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PlayerProvider>
        {children}
      </PlayerProvider>
    </ThemeProvider>
  )
}
