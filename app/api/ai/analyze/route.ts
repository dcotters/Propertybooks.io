import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { supabase } from '../../../../lib/supabase'
import { analyzeProperty } from '../../../../lib/ai-analysis'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyId, analysisType } = body

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    // Fetch the property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('userId', session.user.id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Fetch property transactions for context
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('propertyId', propertyId)
      .eq('userId', session.user.id)
      .order('date', { ascending: false })

    // Calculate monthly expenses from transactions
    const monthlyExpenses = transactions
      ?.filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) / 12 || 0

    // Prepare property data for AI analysis
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
      monthlyExpenses
    }

    // Generate AI analysis
    const analysis = await analyzeProperty(propertyData)

    // Add additional insights based on analysis type
    let additionalInsights = {}
    
    if (analysisType === 'pricing') {
      additionalInsights = {
        pricePerSquareFoot: property.squareFootage ? 
          Math.round(property.estimatedValue / property.squareFootage) : 0,
        rentToValueRatio: property.estimatedValue ? 
          Math.round((property.monthlyRent * 12 / property.estimatedValue) * 100 * 100) / 100 : 0,
        priceToRentRatio: property.monthlyRent ? 
          Math.round(property.estimatedValue / (property.monthlyRent * 12)) : 0,
        marketComparison: analysis.pricingInsights.marketComparison
      }
    } else if (analysisType === 'investment') {
      additionalInsights = {
        totalReturn: property.purchasePrice ? 
          Math.round(((property.estimatedValue - property.purchasePrice) / property.purchasePrice) * 100 * 100) / 100 : 0,
        annualAppreciation: property.purchasePrice && property.yearBuilt ? 
          Math.round(((property.estimatedValue - property.purchasePrice) / (new Date().getFullYear() - property.yearBuilt)) / property.purchasePrice * 100 * 100) / 100 : 0,
        cashFlow: property.monthlyRent - monthlyExpenses,
        breakEvenMonths: property.monthlyRent > monthlyExpenses ? 
          Math.round(property.purchasePrice / (property.monthlyRent - monthlyExpenses)) : 0
      }
    }

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        additionalInsights,
        propertyData,
        transactionSummary: {
          totalTransactions: transactions?.length || 0,
          totalIncome: transactions?.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0) || 0,
          totalExpenses: transactions?.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0,
          averageMonthlyIncome: transactions?.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0) / 12 || 0,
          averageMonthlyExpenses: monthlyExpenses
        }
      }
    })
  } catch (error) {
    console.error('Error analyzing property:', error)
    return NextResponse.json({ error: 'Failed to analyze property' }, { status: 500 })
  }
} 