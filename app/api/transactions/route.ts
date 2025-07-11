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

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        property: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
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

    if (!usage.canAddTransaction && usage.limits) {
      return NextResponse.json({ 
        error: 'Transaction limit reached', 
        message: `You've reached the maximum number of transactions (${usage.limits.transactions.max}) for your ${subscription.plan} plan. Please upgrade to add more transactions.`,
        upgradeRequired: true
      }, { status: 403 })
    }

    const body = await request.json()
    const { type, amount, description, category, date, propertyId, receiptUrl } = body

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount,
        description,
        category,
        date: new Date(date),
        propertyId,
        receiptUrl,
        userId: session.user.id
      },
      include: {
        property: true
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 