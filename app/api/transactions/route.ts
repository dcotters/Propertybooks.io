import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'
import { checkSubscriptionStatus, checkUsageLimits } from '../../../lib/subscription'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('GET /api/transactions - Session:', JSON.stringify(session, null, 2))
    
    if (!session?.user?.id) {
      console.log('GET /api/transactions - No session or user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        property:properties(*)
      `)
      .eq('userId', session.user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Simple mapping for demo: map category to taxCategory by country
function mapCategoryToTaxCategory(category: string, country: string): string {
  // Example mappings (expand as needed)
  const usMap: Record<string, string> = {
    'Repairs': 'Repairs (Schedule E)',
    'Mortgage Interest': 'Mortgage Interest (Schedule E)',
    'Property Taxes': 'Taxes (Schedule E)',
    'Insurance': 'Insurance (Schedule E)',
    'Utilities': 'Utilities (Schedule E)',
    'Advertising': 'Advertising (Schedule E)',
    'Management Fees': 'Management Fees (Schedule E)',
    'Other': 'Other (Schedule E)',
    'Rent': 'Rental Income (Schedule E)'
  };
  const caMap: Record<string, string> = {
    'Repairs': 'Repairs (T776)',
    'Mortgage Interest': 'Interest (T776)',
    'Property Taxes': 'Property Taxes (T776)',
    'Insurance': 'Insurance (T776)',
    'Utilities': 'Utilities (T776)',
    'Advertising': 'Advertising (T776)',
    'Management Fees': 'Management and Administration (T776)',
    'Other': 'Other (T776)',
    'Rent': 'Gross Rental Income (T776)'
  };
  if (country === 'CA') return caMap[category] || 'Other (T776)';
  return usMap[category] || 'Other (Schedule E)';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('POST /api/transactions - Session:', JSON.stringify(session, null, 2))
    
    if (!session?.user?.id) {
      console.log('POST /api/transactions - No session or user ID found')
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

    // Fetch user's country for tax categorization
    const { data: user } = await supabase
      .from('users')
      .select('country')
      .eq('id', session.user.id)
      .single()
    const country = user?.country || 'US';

    const taxCategory = mapCategoryToTaxCategory(category, country);

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        type,
        amount,
        description,
        category,
        taxCategory, // Store mapped tax category
        date: new Date(date).toISOString(),
        propertyId,
        receiptUrl,
        userId: session.user.id
      })
      .select(`
        *,
        property:properties(*)
      `)
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 