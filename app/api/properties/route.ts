import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../../lib/prisma'
import { checkSubscriptionStatus, checkUsageLimits } from '../../../lib/subscription'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const properties = await prisma.property.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

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

    const property = await prisma.property.create({
      data: {
        name,
        address,
        city,
        state,
        zipCode,
        propertyType,
        purchasePrice,
        purchaseDate: new Date(purchaseDate),
        userId: session.user.id
      }
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 