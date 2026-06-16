export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { v4 as uuidv4 } from 'uuid'

async function getAudioDuration(_filePath: string): Promise<number | null> {
  // Duration would be extracted client-side or via ffprobe in production
  return null
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null
    const coverFile = formData.get('cover') as File | null
    const title = formData.get('title') as string
    const artist = formData.get('artist') as string || 'Unknown'
    const album = formData.get('album') as string || null
    const genre = formData.get('genre') as string || null
    const durationStr = formData.get('duration') as string | null
    const duration = durationStr ? parseInt(durationStr) : null

    if (!audioFile || !title) {
      return NextResponse.json({ error: 'Audio file and title are required' }, { status: 400 })
    }

    // Validate audio type
    const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/flac', 'audio/aac']
    if (!validAudioTypes.some(t => audioFile.type.includes(t.split('/')[1]))) {
      return NextResponse.json({ error: 'Invalid audio format' }, { status: 400 })
    }

    // Save audio file
    const audioExt = audioFile.name.split('.').pop() || 'mp3'
    const audioFileName = `${uuidv4()}.${audioExt}`
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    const audioPath = path.join(uploadsDir, audioFileName)
    await writeFile(audioPath, audioBuffer)

    // Save cover if provided
    let coverPath: string | null = null
    if (coverFile && coverFile.size > 0) {
      const coverExt = coverFile.name.split('.').pop() || 'jpg'
      const coverFileName = `${uuidv4()}.${coverExt}`
      const coversDir = path.join(process.cwd(), 'public', 'covers')
      await mkdir(coversDir, { recursive: true })

      const coverBuffer = Buffer.from(await coverFile.arrayBuffer())
      await writeFile(path.join(coversDir, coverFileName), coverBuffer)
      coverPath = `/covers/${coverFileName}`
    }

    // Create DB record
    const track = await prisma.track.create({
      data: {
        title,
        artist,
        album: album || null,
        genre: genre || null,
        duration,
        filePath: `/uploads/${audioFileName}`,
        coverPath,
      },
    })

    return NextResponse.json(track)
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
