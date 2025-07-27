import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { analyzeReceipt } from '../../../../lib/ai-analysis'
import { supabase } from '../../../../lib/supabase'

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
    const country = formData.get('country') as string || 'US'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (images only)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Upload to S3 first
    const { uploadFile, generateFileKey } = await import('../../../../lib/s3')
    const key = generateFileKey(session.user.id, file.name, 'receipt')
    
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

    // Analyze the receipt using AI
    const analysis = await analyzeReceipt(uploadResult.url!, country)

    // Save the receipt image as a document
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        type: 'MAINTENANCE_REPAIR_RECEIPT',
        url: uploadResult.url!,
        size: file.size,
        userId: session.user.id,
      })
      .select()
      .single()

    if (documentError) {
      console.error('Error saving receipt document:', documentError)
    }

    return NextResponse.json({
      success: true,
      analysis,
      document: document || null
    })

  } catch (error) {
    console.error('Error in receipt analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyze receipt' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { imageUrl, country = 'US' } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Analyze the receipt using AI
    const analysis = await analyzeReceipt(imageUrl, country)

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error) {
    console.error('Error analyzing receipt URL:', error)
    return NextResponse.json(
      { error: 'Failed to analyze receipt' },
      { status: 500 }
    )
  }
} 