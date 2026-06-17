import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Streams a track's audio through our own domain. This avoids cross-origin
// issues (no CORS needed) and lets us pass Range requests straight through to
// Blob, so desktop Firefox seeking/streaming works reliably.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const track = await prisma.track.findUnique({ where: { id } })
  if (!track) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Forward the browser's Range header to Blob so partial requests work.
  const range = req.headers.get('range')
  const blobRes = await fetch(track.filePath, {
    headers: range ? { Range: range } : {},
    // don't cache at the fetch layer; we set our own cache headers below
    cache: 'no-store',
  })

  if (!blobRes.ok && blobRes.status !== 206) {
    return NextResponse.json(
      { error: 'Upstream fetch failed' },
      { status: 502 },
    )
  }

  // Pass through the important headers from Blob (content-type, length,
  // range, accept-ranges) plus status (200 or 206).
  const headers = new Headers()
  const passthrough = [
    'content-type',
    'content-length',
    'content-range',
    'accept-ranges',
    'etag',
    'last-modified',
  ]
  for (const h of passthrough) {
    const v = blobRes.headers.get(h)
    if (v) headers.set(h, v)
  }
  if (!headers.has('content-type')) headers.set('content-type', 'audio/mpeg')
  if (!headers.has('accept-ranges')) headers.set('accept-ranges', 'bytes')
  headers.set('cache-control', 'public, max-age=31536000, immutable')

  return new NextResponse(blobRes.body, {
    status: blobRes.status,
    headers,
  })
}
