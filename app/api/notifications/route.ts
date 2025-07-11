import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For now, we'll generate notifications based on data
    // In a real app, you'd have a notifications table
    const notifications = await generateNotifications(user.id)

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId, read } = await request.json()

    // In a real app, you'd update the notification in the database
    // For now, we'll just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}

async function generateNotifications(userId: string) {
  const notifications = []

  // Check for overdue rent payments
  const properties = await prisma.property.findMany({
    where: { userId }
  })

  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  // Check if rent is overdue (assuming rent is due on the 1st)
  if (today.getDate() > 5) { // 5 days grace period
    const rentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'INCOME',
        category: 'Rent',
        date: {
          gte: firstOfMonth
        }
      }
    })

    const expectedRent = properties.reduce((sum, prop) => sum + (Number(prop.purchasePrice) * 0.01), 0) // Rough estimate
    const actualRent = rentTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

    if (actualRent < expectedRent * 0.8) { // If less than 80% of expected rent
      notifications.push({
        id: 'rent-overdue',
        type: 'warning',
        title: 'Rent Payment Overdue',
        message: 'Some rent payments appear to be overdue. Please check your properties.',
        date: today.toISOString(),
        read: false
      })
    }
  }

  // Check for high expenses
  const recentExpenses = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      date: {
        gte: new Date(today.getFullYear(), today.getMonth() - 1, 1) // Last month
      }
    }
  })

  const totalExpenses = recentExpenses.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalIncome = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'INCOME',
      date: {
        gte: new Date(today.getFullYear(), today.getMonth() - 1, 1)
      }
    }
  }).then(income => income.reduce((sum, t) => sum + Number(t.amount), 0))

  if (totalExpenses > totalIncome * 0.8) {
    notifications.push({
      id: 'high-expenses',
      type: 'info',
      title: 'High Expense Alert',
      message: 'Your expenses are running high compared to income. Consider reviewing your budget.',
      date: today.toISOString(),
      read: false
    })
  }

  // Check for properties without recent transactions
  for (const property of properties) {
    const lastTransaction = await prisma.transaction.findFirst({
      where: {
        propertyId: property.id,
        userId
      },
      orderBy: { date: 'desc' }
    })

    if (!lastTransaction || 
        (today.getTime() - lastTransaction.date.getTime()) > 30 * 24 * 60 * 60 * 1000) { // 30 days
      notifications.push({
        id: `property-${property.id}-inactive`,
        type: 'info',
        title: 'Property Activity',
        message: `No recent activity for ${property.name}. Consider adding transactions.`,
        date: today.toISOString(),
        read: false
      })
    }
  }

  // Add welcome notification for new users
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (user && (today.getTime() - user.createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000) { // Within 7 days
    notifications.push({
      id: 'welcome',
      type: 'success',
      title: 'Welcome to PropertyBooks!',
      message: 'Get started by adding your first property and transaction.',
      date: user.createdAt.toISOString(),
      read: false
    })
  }

  return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
} 