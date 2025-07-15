import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'
import { analyzeProperty } from '../../../lib/ai-analysis'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'portfolio-summary'
    const propertyId = searchParams.get('propertyId')
    const dateRange = searchParams.get('dateRange') || 'last-12-months'

    // Fetch user data
    const { data: user } = await supabase
      .from('User')
      .select('*')
      .eq('id', session.user.id)
      .single()

    // Fetch properties
    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })

    // Fetch transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('userId', session.user.id)
      .order('date', { ascending: false })

    if (!properties || !transactions) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    let reportData: any = {}

    switch (reportType) {
      case 'portfolio-summary':
        reportData = await generatePortfolioSummary(properties, transactions, user)
        break
      case 'property-analysis':
        if (!propertyId) {
          return NextResponse.json({ error: 'Property ID required' }, { status: 400 })
        }
        const property = properties.find(p => p.id === propertyId)
        if (!property) {
          return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }
        reportData = await generatePropertyAnalysis(property, transactions, user)
        break
      case 'income-statement':
        reportData = await generateIncomeStatement(properties, transactions, user, dateRange)
        break
      case 'cash-flow':
        reportData = await generateCashFlowReport(properties, transactions, user, dateRange)
        break
      case 'tax-summary':
        reportData = await generateTaxSummary(properties, transactions, user, dateRange)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generatePortfolioSummary(properties: any[], transactions: any[], user: any) {
  const totalProperties = properties.length
  const totalValue = properties.reduce((sum, p) => sum + (p.estimatedValue || p.purchasePrice), 0)
  const totalMonthlyRent = properties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0)
  
  const monthlyIncome = transactions
    .filter(t => t.type === 'INCOME' && new Date(t.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, t) => sum + t.amount, 0)
  
  const monthlyExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && new Date(t.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const netIncome = monthlyIncome - monthlyExpenses
  const occupancyRate = properties.length > 0 ? 
    (properties.filter(p => p.status === 'active').length / properties.length) * 100 : 0

  return {
    reportType: 'Portfolio Summary',
    generatedAt: new Date().toISOString(),
    user: {
      name: user.name,
      email: user.email
    },
    portfolioMetrics: {
      totalProperties,
      totalValue: Math.round(totalValue),
      totalMonthlyRent: Math.round(totalMonthlyRent),
      monthlyIncome: Math.round(monthlyIncome),
      monthlyExpenses: Math.round(monthlyExpenses),
      netIncome: Math.round(netIncome),
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      averageROI: totalValue > 0 ? Math.round((netIncome * 12 / totalValue) * 100 * 100) / 100 : 0
    },
    topPerformers: properties
      .map(p => ({
        name: p.name,
        address: p.address,
        monthlyRent: p.monthlyRent || 0,
        estimatedValue: p.estimatedValue || p.purchasePrice,
        roi: p.monthlyRent && p.estimatedValue ? 
          Math.round((p.monthlyRent * 12 / p.estimatedValue) * 100 * 100) / 100 : 0
      }))
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 3),
    recentActivity: transactions.slice(0, 10).map(t => ({
      date: t.date,
      type: t.type,
      amount: t.amount,
      description: t.description,
      property: properties.find(p => p.id === t.propertyId)?.name || 'N/A'
    }))
  }
}

async function generatePropertyAnalysis(property: any, transactions: any[], user: any) {
  // Get AI analysis
  const propertyData = {
    name: property.name,
    address: property.address,
    city: property.city,
    state: property.state,
    country: property.country || 'US',
    propertyType: property.propertyType,
    purchasePrice: property.purchasePrice,
    estimatedValue: property.estimatedValue || property.purchasePrice,
    monthlyRent: property.monthlyRent || 0,
    yearBuilt: property.yearBuilt || 2000,
    squareFootage: property.squareFootage || 1000,
    bedrooms: property.bedrooms || 2,
    bathrooms: property.bathrooms || 1,
    units: property.units || 1,
    monthlyExpenses: 0 // Calculate from transactions
  }

  const propertyTransactions = transactions.filter(t => t.propertyId === property.id)
  const monthlyExpenses = propertyTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 12

  propertyData.monthlyExpenses = monthlyExpenses

  const aiAnalysis = await analyzeProperty(propertyData)

  return {
    reportType: 'Property Analysis',
    generatedAt: new Date().toISOString(),
    user: {
      name: user.name,
      email: user.email
    },
    property: {
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      propertyType: property.propertyType,
      purchasePrice: property.purchasePrice,
      estimatedValue: property.estimatedValue,
      monthlyRent: property.monthlyRent,
      yearBuilt: property.yearBuilt,
      squareFootage: property.squareFootage,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms
    },
    aiAnalysis,
    financialMetrics: {
      annualRent: property.monthlyRent * 12,
      annualExpenses: monthlyExpenses * 12,
      netOperatingIncome: (property.monthlyRent * 12) - (monthlyExpenses * 12),
      capRate: property.estimatedValue > 0 ? 
        Math.round(((property.monthlyRent * 12 - monthlyExpenses * 12) / property.estimatedValue) * 100 * 100) / 100 : 0,
      cashOnCashReturn: property.purchasePrice > 0 ? 
        Math.round(((property.monthlyRent * 12 - monthlyExpenses * 12) / property.purchasePrice) * 100 * 100) / 100 : 0
    },
    transactionHistory: propertyTransactions.slice(0, 20).map(t => ({
      date: t.date,
      type: t.type,
      amount: t.amount,
      description: t.description,
      category: t.category
    }))
  }
}

async function generateIncomeStatement(properties: any[], transactions: any[], user: any, dateRange: string) {
  const startDate = getStartDate(dateRange)
  
  const incomeTransactions = transactions.filter(t => 
    t.type === 'INCOME' && new Date(t.date) >= startDate
  )
  
  const expenseTransactions = transactions.filter(t => 
    t.type === 'EXPENSE' && new Date(t.date) >= startDate
  )

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
  const netIncome = totalIncome - totalExpenses

  // Group expenses by category
  const expensesByCategory = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(Number(t.amount))
    return acc
  }, {} as Record<string, number>)

  return {
    reportType: 'Income Statement',
    generatedAt: new Date().toISOString(),
    period: dateRange,
    user: {
      name: user.name,
      email: user.email
    },
    income: {
      total: Math.round(totalIncome),
      breakdown: incomeTransactions.map(t => ({
        date: t.date,
        amount: Number(t.amount),
        description: t.description,
        property: properties.find(p => p.id === t.propertyId)?.name || 'N/A'
      }))
    },
    expenses: {
      total: Math.round(totalExpenses),
      byCategory: Object.entries(expensesByCategory).map(([category, amount]) => ({
        category,
        amount: Math.round(amount as number),
        percentage: Math.round(((amount as number) / totalExpenses) * 100 * 100) / 100
      })).sort((a, b) => b.amount - a.amount),
      breakdown: expenseTransactions.map(t => ({
        date: t.date,
        amount: Math.abs(Number(t.amount)),
        category: t.category,
        description: t.description,
        property: properties.find(p => p.id === t.propertyId)?.name || 'N/A'
      }))
    },
    summary: {
      grossIncome: Math.round(totalIncome),
      totalExpenses: Math.round(totalExpenses),
      netIncome: Math.round(netIncome),
      profitMargin: totalIncome > 0 ? Math.round((netIncome / totalIncome) * 100 * 100) / 100 : 0
    }
  }
}

async function generateCashFlowReport(properties: any[], transactions: any[], user: any, dateRange: string) {
  const startDate = getStartDate(dateRange)
  
  const monthlyData = []
  const currentDate = new Date(startDate)
  const endDate = new Date()

  while (currentDate <= endDate) {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= monthStart && transactionDate <= monthEnd
    })

    const income = monthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const expenses = monthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

    monthlyData.push({
      month: monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      income: Math.round(income),
      expenses: Math.round(expenses),
      netCashFlow: Math.round(income - expenses)
    })

    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return {
    reportType: 'Cash Flow Report',
    generatedAt: new Date().toISOString(),
    period: dateRange,
    user: {
      name: user.name,
      email: user.email
    },
    monthlyCashFlow: monthlyData,
    summary: {
      totalIncome: Math.round(monthlyData.reduce((sum, m) => sum + m.income, 0)),
      totalExpenses: Math.round(monthlyData.reduce((sum, m) => sum + m.expenses, 0)),
      totalNetCashFlow: Math.round(monthlyData.reduce((sum, m) => sum + m.netCashFlow, 0)),
      averageMonthlyCashFlow: Math.round(monthlyData.reduce((sum, m) => sum + m.netCashFlow, 0) / monthlyData.length)
    }
  }
}

async function generateTaxSummary(properties: any[], transactions: any[], user: any, dateRange: string) {
  const startDate = getStartDate(dateRange)
  
  const taxYearTransactions = transactions.filter(t => 
    new Date(t.date) >= startDate
  )

  const rentalIncome = taxYearTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const deductibleExpenses = taxYearTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  const netRentalIncome = rentalIncome - deductibleExpenses

  return {
    reportType: 'Tax Summary',
    generatedAt: new Date().toISOString(),
    taxYear: new Date().getFullYear(),
    user: {
      name: user.name,
      email: user.email
    },
    taxSummary: {
      grossRentalIncome: Math.round(rentalIncome),
      deductibleExpenses: Math.round(deductibleExpenses),
      netRentalIncome: Math.round(netRentalIncome),
      estimatedTaxLiability: Math.round(netRentalIncome * 0.25) // Simplified estimate
    },
         deductibleExpensesBreakdown: taxYearTransactions
       .filter(t => t.type === 'EXPENSE')
       .reduce((acc, t) => {
         acc[t.category] = (acc[t.category] || 0) + Math.abs(Number(t.amount))
         return acc
       }, {} as Record<string, number>),
    recommendations: [
      "Consult with a tax professional for accurate tax planning",
      "Keep detailed records of all income and expenses",
      "Consider depreciation deductions for property improvements",
      "Review local tax laws for additional deductions"
    ]
  }
}

function getStartDate(dateRange: string): Date {
  const now = new Date()
  switch (dateRange) {
    case 'last-30-days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case 'last-3-months':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case 'last-6-months':
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    case 'last-12-months':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    case 'this-year':
      return new Date(now.getFullYear(), 0, 1)
    case 'last-year':
      return new Date(now.getFullYear() - 1, 0, 1)
    default:
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  }
} 