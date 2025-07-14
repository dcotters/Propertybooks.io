import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
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
  const notifications: Array<{
    id: string
    type: string
    title: string
    message: string
    date: string
    read: boolean
  }> = []

  // Check for overdue rent payments
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .eq('userId', userId)

  if (propertiesError) {
    console.error('Error fetching properties:', propertiesError)
    return notifications
  }

  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
  
  // Check if rent is overdue (assuming rent is due on the 1st)
  if (today.getDate() > 5) { // 5 days grace period
    const { data: rentTransactions, error: rentError } = await supabase
      .from('transactions')
      .select('*')
      .eq('userId', userId)
      .eq('type', 'INCOME')
      .eq('category', 'Rent')
      .gte('date', firstOfMonth)

    if (!rentError) {
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
  }

  // Check for high expenses
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString()
  
  const { data: recentExpenses, error: expensesError } = await supabase
    .from('transactions')
    .select('*')
    .eq('userId', userId)
    .eq('type', 'EXPENSE')
    .gte('date', lastMonth)

  if (!expensesError) {
    const totalExpenses = recentExpenses.reduce((sum, t) => sum + Number(t.amount), 0)
    
    const { data: recentIncome, error: incomeError } = await supabase
      .from('transactions')
      .select('*')
      .eq('userId', userId)
      .eq('type', 'INCOME')
      .gte('date', lastMonth)

    if (!incomeError) {
      const totalIncome = recentIncome.reduce((sum, t) => sum + Number(t.amount), 0)

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
    }
  }

  // Check for properties without recent transactions
  for (const property of properties) {
    const { data: lastTransaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('propertyId', property.id)
      .eq('userId', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (transactionError && transactionError.code !== 'PGRST116') {
      console.error('Error fetching last transaction:', transactionError)
      continue
    }

    if (!lastTransaction || 
        (today.getTime() - new Date(lastTransaction.date).getTime()) > 30 * 24 * 60 * 60 * 1000) { // 30 days
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
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (!userError && user && (today.getTime() - new Date(user.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000) { // Within 7 days
    notifications.push({
      id: 'welcome',
      type: 'success',
      title: 'Welcome to PropertyBooks!',
      message: 'Get started by adding your first property and transaction.',
      date: user.createdAt,
      read: false
    })
  }

  return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
} 