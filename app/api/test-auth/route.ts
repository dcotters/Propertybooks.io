import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    console.log('Test Auth - Environment variables:')
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
    console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    const session = await getServerSession()
    console.log('Test Auth - Session:', JSON.stringify(session, null, 2))
    
    return NextResponse.json({
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
        NODE_ENV: process.env.NODE_ENV
      },
      session: session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id
    })
  } catch (error) {
    console.error('Test Auth - Error:', error)
    return NextResponse.json({ error: 'Test failed', details: error }, { status: 500 })
  }
} 