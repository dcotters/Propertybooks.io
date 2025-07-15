import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { supabase } from '../../../../lib/supabase'
import { analyzeProperty } from '../../../../lib/ai-analysis'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyId, analysisType, mode, properties, transactions: portfolioTransactions, summary } = body

    // Handle different analysis modes
    if (mode) {
      const result = await handleAnalysisMode(mode, properties, portfolioTransactions, summary, session.user.id)
      
      // Store the analysis result
      await storeAnalysisResult(session.user.id, propertyId, mode, summary, result, 'overview')
      
      return result
    }

    // Handle single property analysis (backward compatibility)
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
    const { data: propertyTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('propertyId', propertyId)
      .eq('userId', session.user.id)
      .order('date', { ascending: false })

    // Calculate monthly expenses from transactions
    const monthlyExpenses = propertyTransactions
      ? propertyTransactions
          .filter((t: any) => t.type === 'EXPENSE')
          .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0) / 12
      : 0

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

    const result = {
      success: true,
      analysis: {
        ...analysis,
        additionalInsights,
        propertyData,
        transactionSummary: {
          totalTransactions: propertyTransactions?.length || 0,
          totalIncome: propertyTransactions 
            ? propertyTransactions.filter((t: any) => t.type === 'INCOME').reduce((sum: number, t: any) => sum + Number(t.amount), 0)
            : 0,
          totalExpenses: propertyTransactions
            ? propertyTransactions.filter((t: any) => t.type === 'EXPENSE').reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0)
            : 0,
          averageMonthlyIncome: propertyTransactions
            ? propertyTransactions.filter((t: any) => t.type === 'INCOME').reduce((sum: number, t: any) => sum + Number(t.amount), 0) / 12
            : 0,
          averageMonthlyExpenses: monthlyExpenses
        }
      }
    }

    // Store the analysis result
    await storeAnalysisResult(session.user.id, propertyId, 'property_analysis', propertyData, result, 'property')

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error analyzing property:', error)
    return NextResponse.json({ error: 'Failed to analyze property' }, { status: 500 })
  }
}

async function storeAnalysisResult(userId: string, propertyId: string | undefined, mode: string, summary: any, result: any, analysisType: string) {
  try {
    // Extract key insights from the AI response
    const insights = result.result || result.analysis?.pricingInsights?.marketComparison || 'Analysis completed'
    
    // Store in database
    const { error } = await supabase
      .from('ai_analyses')
      .insert({
        userId,
        propertyId,
        analysisType: analysisType.toUpperCase(),
        mode,
        summary: summary,
        insights: insights.substring(0, 1000), // Store key insights
        fullAnalysis: JSON.stringify(result).substring(0, 5000), // Store full analysis (compressed)
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: analysisType,
          mode: mode
        }
      })

    if (error) {
      console.error('Error storing AI analysis:', error)
    }

    // Store performance metrics if available
    if (summary && (summary.totalProperties || summary.monthlyIncome)) {
      await storePerformanceMetrics(userId, propertyId, summary)
    }
  } catch (error) {
    console.error('Error storing analysis result:', error)
  }
}

async function storePerformanceMetrics(userId: string, propertyId: string | undefined, summary: any) {
  try {
    const metrics = []
    const now = new Date()

    if (summary.totalProperties) {
      metrics.push({
        userId,
        propertyId,
        date: now,
        metricType: 'PROPERTY_VALUE',
        value: summary.totalProperties,
        metadata: { type: 'count' }
      })
    }

    if (summary.monthlyIncome) {
      metrics.push({
        userId,
        propertyId,
        date: now,
        metricType: 'MONTHLY_RENT',
        value: summary.monthlyIncome,
        metadata: { type: 'total' }
      })
    }

    if (summary.occupancyRate) {
      metrics.push({
        userId,
        propertyId,
        date: now,
        metricType: 'OCCUPANCY_RATE',
        value: summary.occupancyRate,
        metadata: { type: 'percentage' }
      })
    }

    if (summary.totalIncome && summary.totalExpenses) {
      const netIncome = summary.totalIncome - summary.totalExpenses
      const roi = summary.totalProperties > 0 ? (netIncome / summary.totalProperties) * 100 : 0
      
      metrics.push({
        userId,
        propertyId,
        date: now,
        metricType: 'ROI',
        value: roi,
        metadata: { type: 'percentage' }
      })
    }

    if (metrics.length > 0) {
      const { error } = await supabase
        .from('performance_metrics')
        .insert(metrics)

      if (error) {
        console.error('Error storing performance metrics:', error)
      }
    }
  } catch (error) {
    console.error('Error storing performance metrics:', error)
  }
}

async function handleAnalysisMode(mode: string, properties: any[], transactions: any[], summary: any, userId: string) {
  try {
    let prompt = ''
    let systemMessage = ''

    switch (mode) {
      case 'property_analysis':
        systemMessage = 'You are a professional real estate investment analyst. Provide comprehensive portfolio analysis and recommendations.'
        prompt = `
Analyze this property portfolio and provide insights:

Portfolio Summary:
- Total Properties: ${summary.totalProperties}
- Average Rent: $${summary.averageRent?.toLocaleString() || 'N/A'}
- Total Portfolio Value: $${summary.totalValue?.toLocaleString() || 'N/A'}
- Occupancy Rate: ${summary.occupancyRate?.toFixed(1)}%

Properties: ${properties.map(p => `
- ${p.name}: ${p.propertyType}, ${p.units} units, $${p.monthlyRent}/month rent, $${p.estimatedValue?.toLocaleString() || p.purchasePrice?.toLocaleString()} value
`).join('')}

Provide:
1. Portfolio performance analysis
2. Market positioning insights
3. Optimization recommendations
4. Risk assessment
5. Growth opportunities

Be specific and actionable.
`
        break

      case 'transaction_analysis':
        systemMessage = 'You are a financial analyst specializing in real estate investment. Provide transaction pattern analysis and financial optimization insights.'
        prompt = `
Analyze these transaction patterns:

Summary:
- Total Transactions: ${summary.totalTransactions}
- Total Income: $${summary.totalIncome?.toLocaleString() || 'N/A'}
- Total Expenses: $${summary.totalExpenses?.toLocaleString() || 'N/A'}
- Average Transaction: $${summary.averageTransaction?.toLocaleString() || 'N/A'}

Top Expense Categories: ${summary.topCategories?.map(([cat, amt]: [string, number]) => `${cat}: $${amt.toLocaleString()}`).join(', ') || 'N/A'}

Provide:
1. Spending pattern analysis
2. Income optimization opportunities
3. Expense reduction strategies
4. Cash flow improvement recommendations
5. Financial health assessment

Be practical and actionable.
`
        break

      case 'overview_analysis':
        systemMessage = 'You are a real estate portfolio manager. Provide comprehensive overview analysis and strategic recommendations.'
        prompt = `
Analyze this portfolio overview:

Portfolio Metrics:
- Total Properties: ${summary.totalProperties}
- Total Income: $${summary.totalIncome?.toLocaleString() || 'N/A'}
- Total Expenses: $${summary.totalExpenses?.toLocaleString() || 'N/A'}
- Monthly Income: $${summary.monthlyIncome?.toLocaleString() || 'N/A'}
- Occupancy Rate: ${summary.occupancyRate?.toFixed(1)}%

Provide:
1. Portfolio health assessment
2. Performance benchmarks
3. Strategic recommendations
4. Risk factors
5. Growth opportunities
6. Immediate action items

Be comprehensive and strategic.
`
        break

      case 'report_analysis':
        systemMessage = 'You are a financial reporting analyst. Provide insights on financial reports and performance metrics.'
        prompt = `
Analyze this financial report data:

Portfolio Summary:
- Total Properties: ${summary.totalProperties}
- Total Transactions: ${summary.totalTransactions}
- Report Type: ${summary.reportType || 'General'}

Provide:
1. Financial performance analysis
2. Key metrics interpretation
3. Trend analysis
4. Benchmarking insights
5. Strategic recommendations
6. Areas for improvement

Focus on actionable financial insights.
`
        break

      default:
        return NextResponse.json({ error: 'Invalid analysis mode' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const result = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('Error in analysis mode:', error)
    return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 })
  }
} 