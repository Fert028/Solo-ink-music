export interface Track {
  id: number
  title: string
  artist: string
  album?: string | null
  genre?: string | null
  duration?: number | null
  filePath: string
  coverPath?: string | null
  plays: number
  createdAt: string
  updatedAt: string
}

export type Theme = 'dark' | 'light'
