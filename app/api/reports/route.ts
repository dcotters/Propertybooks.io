import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'income-statement'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const propertyId = searchParams.get('propertyId')

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build date filter
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Build property filter
    const propertyFilter = propertyId ? { propertyId } : {}

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        ...dateFilter,
        ...propertyFilter
      },
      include: {
        property: true
      },
      orderBy: { date: 'desc' }
    })

    let report: any = {}

    switch (reportType) {
      case 'income-statement':
        report = generateIncomeStatement(transactions)
        break
      case 'cash-flow':
        report = generateCashFlow(transactions)
        break
      case 'tax-summary':
        report = generateTaxSummary(transactions)
        break
      case 'property-performance':
        report = generatePropertyPerformance(transactions)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

function generateIncomeStatement(transactions: any[]) {
  const income = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const netIncome = income - expenses

  const expenseByCategory = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
      return acc
    }, {} as Record<string, number>)

  return {
    type: 'income-statement',
    summary: {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome
    },
    income: transactions.filter(t => t.type === 'INCOME'),
    expenses: transactions.filter(t => t.type === 'EXPENSE'),
    expenseByCategory,
    period: {
      start: transactions.length > 0 ? transactions[transactions.length - 1].date : null,
      end: transactions.length > 0 ? transactions[0].date : null
    }
  }
}

function generateCashFlow(transactions: any[]) {
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.toISOString().slice(0, 7) // YYYY-MM format
    if (!acc[month]) {
      acc[month] = { income: 0, expenses: 0, net: 0 }
    }
    
    if (t.type === 'INCOME') {
      acc[month].income += Number(t.amount)
    } else {
      acc[month].expenses += Number(t.amount)
    }
    
    acc[month].net = acc[month].income - acc[month].expenses
    return acc
  }, {} as Record<string, any>)

  return {
    type: 'cash-flow',
    monthlyData,
    summary: {
      totalIncome: Object.values(monthlyData).reduce((sum: number, month: any) => sum + month.income, 0),
      totalExpenses: Object.values(monthlyData).reduce((sum: number, month: any) => sum + month.expenses, 0),
      averageMonthlyNet: Object.keys(monthlyData).length > 0 
        ? Object.values(monthlyData).reduce((sum: number, month: any) => sum + month.net, 0) / Object.keys(monthlyData).length 
        : 0
    }
  }
}

function generateTaxSummary(transactions: any[]) {
  const deductibleExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && isDeductibleExpense(t.category))
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const rentalIncome = transactions
    .filter(t => t.type === 'INCOME' && t.category === 'Rent')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return {
    type: 'tax-summary',
    summary: {
      totalRentalIncome: rentalIncome,
      totalDeductibleExpenses: deductibleExpenses,
      netRentalIncome: rentalIncome - deductibleExpenses
    },
    deductibleExpenses: transactions.filter(t => t.type === 'EXPENSE' && isDeductibleExpense(t.category)),
    nonDeductibleExpenses: transactions.filter(t => t.type === 'EXPENSE' && !isDeductibleExpense(t.category))
  }
}

function generatePropertyPerformance(transactions: any[]) {
  const propertyData = transactions.reduce((acc, t) => {
    const propertyId = t.propertyId || 'general'
    const propertyName = t.property?.name || 'General'
    
    if (!acc[propertyId]) {
      acc[propertyId] = {
        id: propertyId,
        name: propertyName,
        income: 0,
        expenses: 0,
        net: 0,
        transactions: []
      }
    }
    
    acc[propertyId].transactions.push(t)
    
    if (t.type === 'INCOME') {
      acc[propertyId].income += Number(t.amount)
    } else {
      acc[propertyId].expenses += Number(t.amount)
    }
    
    acc[propertyId].net = acc[propertyId].income - acc[propertyId].expenses
    return acc
  }, {} as Record<string, any>)

  return {
    type: 'property-performance',
    properties: Object.values(propertyData),
    summary: {
      totalProperties: Object.keys(propertyData).length,
      totalIncome: Object.values(propertyData).reduce((sum: any, prop: any) => sum + prop.income, 0),
      totalExpenses: Object.values(propertyData).reduce((sum: any, prop: any) => sum + prop.expenses, 0),
      totalNet: Object.values(propertyData).reduce((sum: any, prop: any) => sum + prop.net, 0)
    }
  }
}

function isDeductibleExpense(category: string): boolean {
  const deductibleCategories = [
    'Maintenance',
    'Repairs',
    'Utilities',
    'Insurance',
    'Property Tax',
    'HOA Fees',
    'Property Management',
    'Advertising',
    'Legal Fees',
    'Accounting Fees'
  ]
  return deductibleCategories.includes(category)
} 