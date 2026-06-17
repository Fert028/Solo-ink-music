// export const dynamic = 'force-dynamic'

// import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function GET() {
//   try {
//     const tracks = await prisma.track.findMany({
//       orderBy: { createdAt: 'desc' },
//     })
//     return NextResponse.json(tracks)
//   } catch {
//     return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 })
//   }
// }


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

// Only accept URLs that actually live in your Vercel Blob store, so a logged-in
// client can't store arbitrary external URLs as a track.
const BLOB_HOST_SUFFIX = '.public.blob.vercel-storage.com'

function isBlobUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' && u.hostname.endsWith(BLOB_HOST_SUFFIX)
  } catch {
    return false
  }
}

// GET /api/tracks — list all tracks (used by the admin table and the homepage)
export async function GET() {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tracks)
  } catch (err) {
    console.error('List tracks error:', err)
    return NextResponse.json({ error: 'Failed to load tracks' }, { status: 500 })
  }
}

// POST /api/tracks — create a track record from already-uploaded blob URLs
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const filePath = typeof body.filePath === 'string' ? body.filePath : ''
    const coverPath =
      typeof body.coverPath === 'string' && body.coverPath ? body.coverPath : null

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!isBlobUrl(filePath)) {
      return NextResponse.json({ error: 'Invalid audio URL' }, { status: 400 })
    }
    if (coverPath && !isBlobUrl(coverPath)) {
      return NextResponse.json({ error: 'Invalid cover URL' }, { status: 400 })
    }

    const artist =
      typeof body.artist === 'string' && body.artist.trim()
        ? body.artist.trim()
        : 'Unknown'
    const album =
      typeof body.album === 'string' && body.album.trim() ? body.album.trim() : null
    const genre =
      typeof body.genre === 'string' && body.genre.trim() ? body.genre.trim() : null

    let duration: number | null = null
    if (body.duration != null) {
      const parsed = parseInt(String(body.duration), 10)
      duration = Number.isFinite(parsed) && parsed >= 0 ? parsed : null
    }

    const track = await prisma.track.create({
      data: { title, artist, album, genre, duration, filePath, coverPath },
    })

    return NextResponse.json(track, { status: 201 })
  } catch (err) {
    console.error('Create track error:', err)
    return NextResponse.json({ error: 'Failed to save track' }, { status: 500 })
  }
}

