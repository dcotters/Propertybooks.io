import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'pl'
    const propertyId = searchParams.get('propertyId')
    const periodStart = searchParams.get('periodStart')
    const periodEnd = searchParams.get('periodEnd')
    const year = searchParams.get('year') || new Date().getFullYear().toString()

    switch (type) {
      case 'pl':
        return await generatePLStatement(session.user.id, propertyId, periodStart, periodEnd)
      case 'tax':
        return await generateTaxReport(session.user.id, propertyId, year)
      case 'cash-flow':
        return await generateCashFlow(session.user.id, propertyId, periodStart, periodEnd)
      case 'income-statement':
        return await generateIncomeStatement(session.user.id, propertyId, periodStart, periodEnd)
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error generating financial report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

async function generatePLStatement(userId: string, propertyId: string | null, periodStart: string | null, periodEnd: string | null) {
  try {
    // Set default period if not provided
    const startDate = periodStart ? new Date(periodStart) : new Date(new Date().getFullYear(), 0, 1) // Start of year
    const endDate = periodEnd ? new Date(periodEnd) : new Date()

    // Build query
    let query = supabase
      .from('transactions')
      .select(`
        *,
        property:properties(name, address),
        taxCategory:tax_categories(name)
      `)
      .eq('userId', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: true })

    if (propertyId) {
      query = query.eq('propertyId', propertyId)
    }

    const { data: transactions } = await query

    if (!transactions) {
      return NextResponse.json({ error: 'No transactions found' }, { status: 404 })
    }

    // Separate income and expenses
    const income = transactions.filter(t => t.type === 'INCOME')
    const expenses = transactions.filter(t => t.type === 'EXPENSE')

    // Calculate totals
    const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0)
    const netIncome = totalIncome - totalExpenses

    // Group expenses by tax category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.taxCategory?.name || 'Uncategorized'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push({
        description: expense.description,
        date: expense.date,
        amount: Number(expense.amount),
        paidBy: expense.paidBy || 'Unknown',
        taxCategory: category
      })
      return acc
    }, {} as Record<string, any[]>)

    // Group income by source
    const incomeBySource = income.reduce((acc, inc) => {
      const source = inc.category || 'Rent'
      if (!acc[source]) {
        acc[source] = []
      }
      acc[source].push({
        description: inc.description,
        date: inc.date,
        amount: Number(inc.amount),
        paidTo: inc.paidBy || 'Landlord'
      })
      return acc
    }, {} as Record<string, any[]>)

    const plStatement = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        profitMargin: totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0
      },
      income: {
        total: totalIncome,
        breakdown: incomeBySource,
        items: income.map(t => ({
          description: t.description,
          date: t.date,
          amount: Number(t.amount),
          paidTo: t.paidBy || 'Landlord'
        }))
      },
      expenses: {
        total: totalExpenses,
        breakdown: expensesByCategory,
        items: expenses.map(t => ({
          description: t.description,
          date: t.date,
          amount: Number(t.amount),
          paidBy: t.paidBy || 'Unknown',
          taxCategory: t.taxCategory?.name || 'Uncategorized'
        }))
      }
    }

    // Store the P&L statement
    await supabase
      .from('pl_statements')
      .insert({
        userId,
        propertyId,
        periodStart: startDate.toISOString(),
        periodEnd: endDate.toISOString(),
        totalIncome,
        totalExpenses,
        netIncome,
        details: plStatement
      })

    return NextResponse.json({ plStatement })
  } catch (error) {
    console.error('Error generating P&L statement:', error)
    return NextResponse.json({ error: 'Failed to generate P&L statement' }, { status: 500 })
  }
}

async function generateTaxReport(userId: string, propertyId: string | null, year: string) {
  try {
    const startDate = new Date(parseInt(year), 0, 1)
    const endDate = new Date(parseInt(year), 11, 31)

    // Build query
    let query = supabase
      .from('transactions')
      .select(`
        *,
        property:properties(name, address),
        taxCategory:tax_categories(name)
      `)
      .eq('userId', userId)
      .eq('type', 'EXPENSE')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: true })

    if (propertyId) {
      query = query.eq('propertyId', propertyId)
    }

    const { data: expenses } = await query

    if (!expenses) {
      return NextResponse.json({ error: 'No expenses found' }, { status: 404 })
    }

    // CRA Tax Categories mapping
    const craCategories = {
      'Advertising': 'Advertising',
      'Insurance': 'Insurance',
      'Interest & Bank Charges': 'Interest & bank charges',
      'Maintenance & Repairs': 'Repairs & maintenance',
      'Management & Administration Fees': 'Management & administration fees',
      'Motor Vehicle': 'Motor vehicle expenses',
      'Office Expenses': 'Office expenses',
      'Professional Fees': 'Professional fees',
      'Property Taxes': 'Property taxes',
      'Salaries, Wages & Benefits': 'Salaries wages benefits',
      'Travel': 'Travel',
      'Utilities': 'Utilities',
      'Other Expenses': 'Other Expenses'
    }

    // Group expenses by CRA tax category
    const expensesByTaxCategory = expenses.reduce((acc, expense) => {
      const category = expense.taxCategory?.name || 'Other Expenses'
      const craCategory = craCategories[category as keyof typeof craCategories] || 'Other Expenses'
      
      if (!acc[craCategory]) {
        acc[craCategory] = {
          total: 0,
          items: []
        }
      }
      
      acc[craCategory].total += Number(expense.amount)
      acc[craCategory].items.push({
        description: expense.description,
        date: expense.date,
        amount: Number(expense.amount),
        paidBy: expense.paidBy || 'Unknown'
      })
      
      return acc
    }, {} as Record<string, { total: number; items: any[] }>)

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    // Get income for the year
    const { data: income } = await supabase
      .from('transactions')
      .select('amount')
      .eq('userId', userId)
      .eq('type', 'INCOME')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())

    const totalIncome = income?.reduce((sum, i) => sum + Number(i.amount), 0) || 0

    const taxReport = {
      year: parseInt(year),
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      summary: {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses
      },
      taxExpenses: expensesByTaxCategory,
      taxCategories: Object.keys(expensesByTaxCategory).map(category => ({
        category,
        amount: expensesByTaxCategory[category].total,
        itemCount: expensesByTaxCategory[category].items.length
      }))
    }

    return NextResponse.json({ taxReport })
  } catch (error) {
    console.error('Error generating tax report:', error)
    return NextResponse.json({ error: 'Failed to generate tax report' }, { status: 500 })
  }
}

async function generateCashFlow(userId: string, propertyId: string | null, periodStart: string | null, periodEnd: string | null) {
  try {
    const startDate = periodStart ? new Date(periodStart) : new Date(new Date().getFullYear(), 0, 1)
    const endDate = periodEnd ? new Date(periodEnd) : new Date()

    // Get all transactions for the period
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('userId', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: true })

    if (propertyId) {
      query = query.eq('propertyId', propertyId)
    }

    const { data: transactions } = await query

    if (!transactions) {
      return NextResponse.json({ error: 'No transactions found' }, { status: 404 })
    }

    // Group by month
    const monthlyCashFlow = transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.date).toISOString().slice(0, 7) // YYYY-MM
      
      if (!acc[month]) {
        acc[month] = {
          income: 0,
          expenses: 0,
          netCashFlow: 0,
          transactions: []
        }
      }
      
      const amount = Number(transaction.amount)
      
      if (transaction.type === 'INCOME') {
        acc[month].income += amount
        acc[month].netCashFlow += amount
      } else {
        acc[month].expenses += amount
        acc[month].netCashFlow -= amount
      }
      
      acc[month].transactions.push({
        date: transaction.date,
        description: transaction.description,
        type: transaction.type,
        amount: amount,
        category: transaction.category
      })
      
      return acc
    }, {} as Record<string, any>)

    const cashFlowReport = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      monthlyBreakdown: monthlyCashFlow,
      summary: {
        totalIncome: transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0),
        totalExpenses: transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0),
        netCashFlow: transactions.reduce((sum, t) => {
          const amount = Number(t.amount)
          return t.type === 'INCOME' ? sum + amount : sum - amount
        }, 0)
      }
    }

    return NextResponse.json({ cashFlowReport })
  } catch (error) {
    console.error('Error generating cash flow report:', error)
    return NextResponse.json({ error: 'Failed to generate cash flow report' }, { status: 500 })
  }
}

async function generateIncomeStatement(userId: string, propertyId: string | null, periodStart: string | null, periodEnd: string | null) {
  try {
    const startDate = periodStart ? new Date(periodStart) : new Date(new Date().getFullYear(), 0, 1)
    const endDate = periodEnd ? new Date(periodEnd) : new Date()

    // Get properties for context
    let propertiesQuery = supabase
      .from('properties')
      .select('*')
      .eq('userId', userId)

    if (propertyId) {
      propertiesQuery = propertiesQuery.eq('id', propertyId)
    }

    const { data: properties } = await propertiesQuery

    // Get transactions
    let transactionsQuery = supabase
      .from('transactions')
      .select('*')
      .eq('userId', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: true })

    if (propertyId) {
      transactionsQuery = transactionsQuery.eq('propertyId', propertyId)
    }

    const { data: transactions } = await transactionsQuery

    if (!transactions) {
      return NextResponse.json({ error: 'No transactions found' }, { status: 404 })
    }

    const income = transactions.filter(t => t.type === 'INCOME')
    const expenses = transactions.filter(t => t.type === 'EXPENSE')

    const incomeStatement = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      properties: properties?.map(p => ({
        id: p.id,
        name: p.name,
        address: p.address,
        monthlyRent: p.monthlyRent,
        estimatedValue: p.estimatedValue
      })) || [],
      revenue: {
        total: income.reduce((sum, t) => sum + Number(t.amount), 0),
        breakdown: income.reduce((acc, t) => {
          const category = t.category || 'Rent'
          acc[category] = (acc[category] || 0) + Number(t.amount)
          return acc
        }, {} as Record<string, number>)
      },
      expenses: {
        total: expenses.reduce((sum, t) => sum + Number(t.amount), 0),
        breakdown: expenses.reduce((acc, t) => {
          const category = t.category || 'Other'
          acc[category] = (acc[category] || 0) + Number(t.amount)
          return acc
        }, {} as Record<string, number>)
      },
      netIncome: income.reduce((sum, t) => sum + Number(t.amount), 0) - 
                 expenses.reduce((sum, t) => sum + Number(t.amount), 0)
    }

    return NextResponse.json({ incomeStatement })
  } catch (error) {
    console.error('Error generating income statement:', error)
    return NextResponse.json({ error: 'Failed to generate income statement' }, { status: 500 })
  }
} 