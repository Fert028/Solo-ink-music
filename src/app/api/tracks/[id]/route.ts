import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const trackId = parseInt(id)

  try {
    await prisma.track.delete({ where: { id: trackId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const trackId = parseInt(id)
  const body = await req.json()

  try {
    const track = await prisma.track.update({
      where: { id: trackId },
      data: {
        title: body.title,
        artist: body.artist,
        album: body.album,
        genre: body.genre,
      },
    })
    return NextResponse.json(track)
  } catch {
    return NextResponse.json({ error: 'Failed to update track' }, { status: 500 })
  }
}
