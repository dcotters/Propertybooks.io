import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '../../../lib/supabase'
import { checkSubscriptionStatus, checkUsageLimits } from '../../../lib/subscription'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
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
    const session = await getServerSession()
    
    if (!session?.user?.id) {
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