import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = headers()
    const cookieHeader = headersList.get('cookie')
    
    console.log('Test Cookies - Cookie header:', cookieHeader)
    
    // Parse cookies
    const cookies: Record<string, string> = {}
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=')
        if (name && value) {
          cookies[name] = value
        }
      })
    }
    
    console.log('Test Cookies - Parsed cookies:', cookies)
    
    return NextResponse.json({
      cookieHeader,
      parsedCookies: cookies,
      hasNextAuthCookie: !!cookies['next-auth.session-token'] || !!cookies['__Secure-next-auth.session-token'],
      nextAuthCookieName: cookies['next-auth.session-token'] ? 'next-auth.session-token' : 
                         cookies['__Secure-next-auth.session-token'] ? '__Secure-next-auth.session-token' : 'none'
    })
  } catch (error) {
    console.error('Test Cookies - Error:', error)
    return NextResponse.json({ error: 'Test failed', details: error }, { status: 500 })
  }
} 