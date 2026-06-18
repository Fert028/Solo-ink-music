// import { NextRequest, NextResponse } from 'next/server'
// import { put, del } from '@vercel/blob'
// import { v4 as uuidv4 } from 'uuid'
// import { prisma } from '@/lib/prisma'

// export const dynamic = 'force-dynamic'

// // Allowlist: MIME -> canonical extension. Extension is derived from the
// // validated type, never from the user-supplied filename. This is what
// // actually prevents writing/serving an .html/.svg as an "audio" file.
// const AUDIO_TYPES: Record<string, string> = {
//   'audio/mpeg': 'mp3',
//   'audio/mp3': 'mp3',
//   'audio/ogg': 'ogg',
//   'audio/wav': 'wav',
//   'audio/x-wav': 'wav',
//   'audio/flac': 'flac',
//   'audio/x-flac': 'flac',
//   'audio/aac': 'aac',
//   'audio/mp4': 'm4a',
// }

// const IMAGE_TYPES: Record<string, string> = {
//   'image/jpeg': 'jpg',
//   'image/png': 'png',
//   'image/webp': 'webp',
//   'image/gif': 'gif',
// }

// const MAX_AUDIO_SIZE = 50 * 1024 * 1024 // 50 MB
// const MAX_COVER_SIZE = 5 * 1024 * 1024 // 5 MB

// export async function POST(req: NextRequest) {
//   // Track what we uploaded so we can roll back if the DB write fails.
//   const uploadedUrls: string[] = []

//   try {
//     const formData = await req.formData()

//     const audioFile = formData.get('audio')
//     const coverFile = formData.get('cover')
//     const titleRaw = formData.get('title')
//     const artistRaw = formData.get('artist')
//     const albumRaw = formData.get('album')
//     const genreRaw = formData.get('genre')
//     const durationRaw = formData.get('duration')

//     // --- Validate text fields (don't trust `as string` casts) ---
//     const title = typeof titleRaw === 'string' ? titleRaw.trim() : ''
//     if (!title) {
//       return NextResponse.json({ error: 'Title is required' }, { status: 400 })
//     }
//     const artist =
//       typeof artistRaw === 'string' && artistRaw.trim() ? artistRaw.trim() : 'Unknown'
//     const album = typeof albumRaw === 'string' && albumRaw.trim() ? albumRaw.trim() : null
//     const genre = typeof genreRaw === 'string' && genreRaw.trim() ? genreRaw.trim() : null

//     let duration: number | null = null
//     if (typeof durationRaw === 'string' && durationRaw.trim()) {
//       const parsed = parseInt(durationRaw, 10)
//       duration = Number.isFinite(parsed) && parsed >= 0 ? parsed : null
//     }

//     // --- Validate audio file ---
//     if (!(audioFile instanceof File)) {
//       return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
//     }
//     const audioExt = AUDIO_TYPES[audioFile.type]
//     if (!audioExt) {
//       return NextResponse.json({ error: 'Invalid audio format' }, { status: 400 })
//     }
//     if (audioFile.size === 0) {
//       return NextResponse.json({ error: 'Audio file is empty' }, { status: 400 })
//     }
//     if (audioFile.size > MAX_AUDIO_SIZE) {
//       return NextResponse.json({ error: 'Audio file is too large' }, { status: 413 })
//     }

//     // --- Validate cover file (if present) ---
//     let validatedCover: { file: File; ext: string } | null = null
//     if (coverFile instanceof File && coverFile.size > 0) {
//       const coverExt = IMAGE_TYPES[coverFile.type]
//       if (!coverExt) {
//         return NextResponse.json({ error: 'Invalid cover format' }, { status: 400 })
//       }
//       if (coverFile.size > MAX_COVER_SIZE) {
//         return NextResponse.json({ error: 'Cover image is too large' }, { status: 413 })
//       }
//       validatedCover = { file: coverFile, ext: coverExt }
//     }

//     // --- Upload audio to Vercel Blob ---
//     // contentType is set explicitly so the file is always served as audio,
//     // never as something executable.
//     const audioBlob = await put(
//       `uploads/${uuidv4()}.${audioExt}`,
//       audioFile,
//       { access: 'public', contentType: audioFile.type, addRandomSuffix: false },
//     )
//     uploadedUrls.push(audioBlob.url)

//     // --- Upload cover to Vercel Blob (if present) ---
//     let coverUrl: string | null = null
//     if (validatedCover) {
//       const coverBlob = await put(
//         `covers/${uuidv4()}.${validatedCover.ext}`,
//         validatedCover.file,
//         { access: 'public', contentType: validatedCover.file.type, addRandomSuffix: false },
//       )
//       uploadedUrls.push(coverBlob.url)
//       coverUrl = coverBlob.url
//     }

//     // --- Create DB record (store the full Blob URL) ---
//     const track = await prisma.track.create({
//       data: {
//         title,
//         artist,
//         album,
//         genre,
//         duration,
//         filePath: audioBlob.url,
//         coverPath: coverUrl,
//       },
//     })

//     return NextResponse.json(track, { status: 201 })
//   } catch (err) {
//     console.error('Upload error:', err)
//     // Roll back any blobs we uploaded before the failure so we don't leak files.
//     if (uploadedUrls.length > 0) {
//       await del(uploadedUrls).catch((delErr) =>
//         console.error('Cleanup failed:', delErr),
//       )
//     }
//     return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
//   }
// }




import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024 // 50 MB

const ALLOWED_TYPES = [
  // audio
  'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav',
  'audio/x-wav', 'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/mp4',
  // images (covers)
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
]

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        const session = await getSession()
        if (!session.isLoggedIn) {
          throw new Error('Unauthorized')
        }
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_SIZE,
          addRandomSuffix: false,
        }
      },
      onUploadCompleted: async () => {
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (err) {
    console.error('Upload token error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Upload failed' },
      { status: 400 },
    )
  }
}
