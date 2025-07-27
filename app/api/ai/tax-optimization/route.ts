import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { analyzeTaxOptimization, categorizeExpense } from '../../../../lib/ai-analysis'
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

    const { country = 'US', propertyId } = await request.json()

    // Fetch user's properties and transactions
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('userId', session.user.id)

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('userId', session.user.id)

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Perform tax optimization analysis
    const taxAnalysis = await analyzeTaxOptimization(
      country,
      properties || [],
      transactions || []
    )

    // Save analysis to database
    const { error: saveError } = await supabase
      .from('ai_analyses')
      .insert({
        userId: session.user.id,
        analysisType: 'TAX_OPTIMIZATION',
        mode: 'tax_optimization',
        summary: taxAnalysis,
        insights: JSON.stringify(taxAnalysis)
      })

    if (saveError) {
      console.error('Error saving tax analysis:', saveError)
    }

    return NextResponse.json({
      success: true,
      analysis: taxAnalysis
    })

  } catch (error) {
    console.error('Error in tax optimization analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyze tax optimization' },
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

    const { description, amount, country = 'US' } = await request.json()

    if (!description || !amount) {
      return NextResponse.json(
        { error: 'Description and amount are required' },
        { status: 400 }
      )
    }

    // Categorize the expense using AI
    const categorization = await categorizeExpense(description, amount, country)

    return NextResponse.json({
      success: true,
      categorization
    })

  } catch (error) {
    console.error('Error categorizing expense:', error)
    return NextResponse.json(
      { error: 'Failed to categorize expense' },
      { status: 500 }
    )
  }
} 