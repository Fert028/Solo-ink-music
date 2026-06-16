import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tracks)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 })
  }
}
