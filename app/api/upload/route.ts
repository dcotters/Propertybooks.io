import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { uploadFile, generateFileKey } from '@/lib/s3'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const propertyId = formData.get('propertyId') as string
    const documentType = formData.get('type') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, PDF, DOC, DOCX' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Generate S3 key
    const key = generateFileKey(session.user.id, file.name, documentType)

    // Upload to S3
    const uploadResult = await uploadFile({
      key,
      body: buffer,
      contentType: file.type,
    })

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Save document record to database
    const document = await prisma.document.create({
      data: {
        name: file.name,
        type: documentType as any,
        url: uploadResult.url!,
        size: file.size,
        propertyId: propertyId || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        url: document.url,
        size: document.size,
        type: document.type,
      },
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 