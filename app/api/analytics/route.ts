import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const propertyId = searchParams.get('propertyId')
    const period = searchParams.get('period') || '6months'

    switch (type) {
      case 'trends':
        return await getTrends(session.user.id, propertyId, period)
      case 'performance':
        return await getPerformanceMetrics(session.user.id, propertyId, period)
      case 'ai-history':
        return await getAIHistory(session.user.id, propertyId)
      case 'property-snapshots':
        return await getPropertySnapshots(session.user.id, propertyId, period)
      default:
        return await getOverview(session.user.id)
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

async function getOverview(userId: string) {
  try {
    // Get current portfolio metrics
    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .eq('userId', userId)

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('userId', userId)

    const totalProperties = properties?.length || 0
    const totalIncome = (transactions || [])
      .filter((t: any) => t.type === 'INCOME')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0)
    const totalExpenses = (transactions || [])
      .filter((t: any) => t.type === 'EXPENSE')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0)
    const monthlyIncome = (properties || [])
      .reduce((sum: number, p: any) => sum + (Number(p.monthlyRent) || 0), 0)

    return NextResponse.json({
      overview: {
        totalProperties,
        totalIncome,
        totalExpenses,
        monthlyIncome,
        netIncome: totalIncome - totalExpenses,
        occupancyRate: calculateOccupancyRate(properties || [])
      }
    })
  } catch (error) {
    console.error('Error getting overview:', error)
    return NextResponse.json({ error: 'Failed to get overview' }, { status: 500 })
  }
}

async function getTrends(userId: string, propertyId: string | null, period: string) {
  try {
    const months = period === '1year' ? 12 : period === '6months' ? 6 : 3
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    let query = supabase
      .from('performance_metrics')
      .select('*')
      .eq('userId', userId)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true })

    if (propertyId) {
      query = query.eq('propertyId', propertyId)
    }

    const { data: metrics } = await query

    // Group metrics by type and date
    const trends = {
      monthlyRent: groupMetricsByMonth(metrics?.filter(m => m.metricType === 'MONTHLY_RENT') || []),
      occupancyRate: groupMetricsByMonth(metrics?.filter(m => m.metricType === 'OCCUPANCY_RATE') || []),
      roi: groupMetricsByMonth(metrics?.filter(m => m.metricType === 'ROI') || []),
      capRate: groupMetricsByMonth(metrics?.filter(m => m.metricType === 'CAP_RATE') || [])
    }

    return NextResponse.json({ trends })
  } catch (error) {
    console.error('Error getting trends:', error)
    return NextResponse.json({ error: 'Failed to get trends' }, { status: 500 })
  }
}

async function getPerformanceMetrics(userId: string, propertyId: string | null, period: string) {
  try {
    const months = period === '1year' ? 12 : period === '6months' ? 6 : 3
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    let query = supabase
      .from('performance_metrics')
      .select('*')
      .eq('userId', userId)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: false })

    if (propertyId) {
      query = query.eq('propertyId', propertyId)
    }

    const { data: metrics } = await query

    // Calculate performance statistics
    const performance = {
      averageROI: calculateAverage(metrics?.filter(m => m.metricType === 'ROI') || []),
      averageCapRate: calculateAverage(metrics?.filter(m => m.metricType === 'CAP_RATE') || []),
      averageOccupancyRate: calculateAverage(metrics?.filter(m => m.metricType === 'OCCUPANCY_RATE') || []),
      totalMonthlyRent: calculateTotal(metrics?.filter(m => m.metricType === 'MONTHLY_RENT') || []),
      growthRate: calculateGrowthRate(metrics || [])
    }

    return NextResponse.json({ performance })
  } catch (error) {
    console.error('Error getting performance metrics:', error)
    return NextResponse.json({ error: 'Failed to get performance metrics' }, { status: 500 })
  }
}

async function getAIHistory(userId: string, propertyId: string | null) {
  try {
    let query = supabase
      .from('ai_analyses')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(20)

    if (propertyId) {
      query = query.eq('propertyId', propertyId)
    }

    const { data: analyses } = await query

    return NextResponse.json({
      aiHistory: analyses?.map(analysis => ({
        id: analysis.id,
        type: analysis.analysisType,
        mode: analysis.mode,
        insights: analysis.insights,
        createdAt: analysis.createdAt,
        summary: analysis.summary
      })) || []
    })
  } catch (error) {
    console.error('Error getting AI history:', error)
    return NextResponse.json({ error: 'Failed to get AI history' }, { status: 500 })
  }
}

async function getPropertySnapshots(userId: string, propertyId: string | null, period: string) {
  try {
    const months = period === '1year' ? 12 : period === '6months' ? 6 : 3
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    let query = supabase
      .from('property_snapshots')
      .select('*')
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true })

    if (propertyId) {
      query = query.eq('propertyId', propertyId)
    } else {
      // Get snapshots for all user properties
      const { data: userProperties } = await supabase
        .from('properties')
        .select('id')
        .eq('userId', userId)
      
      if (userProperties?.length) {
        const propertyIds = userProperties.map(p => p.id)
        query = query.in('propertyId', propertyIds)
      }
    }

    const { data: snapshots } = await query

    return NextResponse.json({
      snapshots: snapshots?.map(snapshot => ({
        id: snapshot.id,
        propertyId: snapshot.propertyId,
        date: snapshot.date,
        monthlyRent: snapshot.monthlyRent,
        estimatedValue: snapshot.estimatedValue,
        occupancyRate: snapshot.occupancyRate,
        capRate: snapshot.capRate,
        roi: snapshot.roi
      })) || []
    })
  } catch (error) {
    console.error('Error getting property snapshots:', error)
    return NextResponse.json({ error: 'Failed to get property snapshots' }, { status: 500 })
  }
}

// Helper functions
function calculateOccupancyRate(properties: any[]): number {
  if (!properties?.length) return 0
  const totalUnits = properties.reduce((sum, p) => sum + (p.units || 1), 0)
  const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0)
  return totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0
}

function groupMetricsByMonth(metrics: any[]): any[] {
  const grouped = metrics.reduce((acc, metric) => {
    const month = new Date(metric.date).toISOString().slice(0, 7) // YYYY-MM
    if (!acc[month]) {
      acc[month] = []
    }
    acc[month].push(metric.value)
    return acc
  }, {})

  return Object.entries(grouped).map(([month, values]: [string, any]) => ({
    month,
    value: values.reduce((sum: number, val: number) => sum + val, 0) / values.length
  }))
}

function calculateAverage(metrics: any[]): number {
  if (!metrics.length) return 0
  const sum = metrics.reduce((acc, m) => acc + Number(m.value), 0)
  return sum / metrics.length
}

function calculateTotal(metrics: any[]): number {
  return metrics.reduce((acc, m) => acc + Number(m.value), 0)
}

function calculateGrowthRate(metrics: any[]): number {
  if (metrics.length < 2) return 0
  
  const sorted = metrics.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  
  if (first.value === 0) return 0
  return ((last.value - first.value) / first.value) * 100
} 