import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Build a safe, readable filename like "Король и Шут - Кукла колдуна.mp3".
// Strips characters that are illegal in filenames.
function buildFileName(artist: string, title: string, sourceUrl: string): string {
  const ext = (sourceUrl.split('.').pop() || 'mp3').toLowerCase().slice(0, 4)
  const base = `${artist} - ${title}`
    .replace(/[\/\\:*?"<>|]/g, '')   // illegal filename chars
    .replace(/\s+/g, ' ')
    .trim()
  return `${base || 'track'}.${ext}`
}

// Streams a track's audio through our own domain.
//  - default: proxies with Range support (for the <audio> player)
//  - ?download=1: forces a file download with a nice filename
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

  const isDownload = req.nextUrl.searchParams.get('download') === '1'

  // For downloads we want the whole file (no Range). For playback we forward
  // the browser's Range header so seeking/streaming works.
  const range = req.headers.get('range')
  const blobRes = await fetch(track.filePath, {
    headers: !isDownload && range ? { Range: range } : {},
    cache: 'no-store',
  })

  if (!blobRes.ok && blobRes.status !== 206) {
    return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 })
  }

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

  if (isDownload) {
    const filename = buildFileName(track.artist, track.title, track.filePath)
    // filename* uses RFC 5987 encoding so non-ASCII (Cyrillic) names work.
    headers.set(
      'content-disposition',
      `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    )
    // a download is the whole file; don't advertise range
    headers.delete('content-range')
    headers.set('accept-ranges', 'none')
  } else {
    if (!headers.has('accept-ranges')) headers.set('accept-ranges', 'bytes')
  }

  headers.set('cache-control', 'public, max-age=31536000, immutable')

  return new NextResponse(blobRes.body, {
    status: isDownload ? 200 : blobRes.status,
    headers,
  })
}
