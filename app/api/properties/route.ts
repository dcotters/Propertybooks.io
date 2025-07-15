import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'
import { checkSubscriptionStatus, checkUsageLimits } from '../../../lib/subscription'

export async function GET() {
  try {
    console.log('GET /api/properties - Starting request')
    
    // Log all headers to see what's being sent
    const headers = await import('next/headers')
    const headersList = headers.headers()
    console.log('GET /api/properties - All headers:', Object.fromEntries(headersList.entries()))
    
    // Check for specific auth headers
    const authHeader = headersList.get('authorization')
    const cookieHeader = headersList.get('cookie')
    console.log('GET /api/properties - Authorization header:', authHeader)
    console.log('GET /api/properties - Cookie header:', cookieHeader)
    
    const session = await getServerSession(authOptions)
    
    console.log('GET /api/properties - Session:', JSON.stringify(session, null, 2))
    
    if (!session?.user?.id) {
      console.log('GET /api/properties - No session or user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/properties - Starting request')
    
    // Log all headers to see what's being sent
    const headers = await import('next/headers')
    const headersList = headers.headers()
    console.log('POST /api/properties - All headers:', Object.fromEntries(headersList.entries()))
    
    // Check for specific auth headers
    const authHeader = headersList.get('authorization')
    const cookieHeader = headersList.get('cookie')
    console.log('POST /api/properties - Authorization header:', authHeader)
    console.log('POST /api/properties - Cookie header:', cookieHeader)
    
    const session = await getServerSession(authOptions)
    
    console.log('POST /api/properties - Session:', JSON.stringify(session, null, 2))
    
    if (!session?.user?.id) {
      console.log('POST /api/properties - No session or user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription status and usage limits
    const subscription = await checkSubscriptionStatus(session.user.id)
    const usage = await checkUsageLimits(session.user.id, subscription.plan)

    if (!usage.canAddProperty && usage.limits) {
      return NextResponse.json({ 
        error: 'Property limit reached', 
        message: `You've reached the maximum number of properties (${usage.limits.properties.max}) for your ${subscription.plan} plan. Please upgrade to add more properties.`,
        upgradeRequired: true
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, address, city, state, zipCode, propertyType, purchasePrice, purchaseDate, units, monthlyRent } = body

    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        name,
        address,
        city,
        state,
        zipCode,
        propertyType,
        purchasePrice,
        purchaseDate: new Date(purchaseDate).toISOString(),
        userId: session.user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating property:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 