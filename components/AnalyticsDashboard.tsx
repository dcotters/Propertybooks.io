'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon,
  HomeIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface AnalyticsData {
  overview?: {
    totalProperties: number
    totalIncome: number
    totalExpenses: number
    monthlyIncome: number
    netIncome: number
    occupancyRate: number
  }
  trends?: {
    monthlyRent: Array<{ month: string; value: number }>
    occupancyRate: Array<{ month: string; value: number }>
    roi: Array<{ month: string; value: number }>
    capRate: Array<{ month: string; value: number }>
  }
  performance?: {
    averageROI: number
    averageCapRate: number
    averageOccupancyRate: number
    totalMonthlyRent: number
    growthRate: number
  }
  aiHistory?: Array<{
    id: string
    type: string
    mode: string
    insights: string
    createdAt: string
  }>
}

interface AnalyticsDashboardProps {
  propertyId?: string
}

export default function AnalyticsDashboard({ propertyId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData>({})
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('6months')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [period, propertyId])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch overview data
      const overviewRes = await fetch(`/api/analytics?type=overview`, {
        credentials: 'include'
      })
      
      // Fetch trends data
      const trendsRes = await fetch(`/api/analytics?type=trends&period=${period}${propertyId ? `&propertyId=${propertyId}` : ''}`, {
        credentials: 'include'
      })
      
      // Fetch performance data
      const performanceRes = await fetch(`/api/analytics?type=performance&period=${period}${propertyId ? `&propertyId=${propertyId}` : ''}`, {
        credentials: 'include'
      })
      
      // Fetch AI history
      const aiHistoryRes = await fetch(`/api/analytics?type=ai-history${propertyId ? `&propertyId=${propertyId}` : ''}`, {
        credentials: 'include'
      })

      const [overviewData, trendsData, performanceData, aiHistoryData] = await Promise.all([
        overviewRes.json(),
        trendsRes.json(),
        performanceRes.json(),
        aiHistoryRes.json()
      ])

      setData({
        overview: overviewData.overview,
        trends: trendsData.trends,
        performance: performanceData.performance,
        aiHistory: aiHistoryData.aiHistory
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Trends</h2>
          <p className="text-gray-600">Track your portfolio performance over time</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'trends', label: 'Trends', icon: ArrowTrendingUpIcon },
            { id: 'performance', label: 'Performance', icon: CurrencyDollarIcon },
            { id: 'ai-history', label: 'AI History', icon: HomeIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && data.overview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="card">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg">
                <HomeIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Properties</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.totalProperties}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="bg-success-100 p-3 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.overview.monthlyIncome)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="bg-warning-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className={`text-2xl font-bold ${data.overview.netIncome >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                  {formatCurrency(data.overview.netIncome)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="bg-info-100 p-3 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-info-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.overview.occupancyRate)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'trends' && data.trends && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Rent Trend */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Rent Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.trends.monthlyRent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Occupancy Rate Trend */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Rate Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.trends.occupancyRate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ROI Trend */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.trends.roi}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                  <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cap Rate Trend */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cap Rate Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.trends.capRate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                  <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'performance' && data.performance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average ROI</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.performance.averageROI)}</p>
                </div>
                <div className={`p-2 rounded-full ${data.performance.averageROI > 0 ? 'bg-success-100' : 'bg-red-100'}`}>
                  {data.performance.averageROI > 0 ? (
                    <ArrowUpIcon className="h-5 w-5 text-success-600" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Cap Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.performance.averageCapRate)}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <ChartBarIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.performance.growthRate)}</p>
                </div>
                <div className={`p-2 rounded-full ${data.performance.growthRate > 0 ? 'bg-success-100' : 'bg-red-100'}`}>
                  {data.performance.growthRate > 0 ? (
                    <ArrowUpIcon className="h-5 w-5 text-success-600" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'ai-history' && data.aiHistory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {data.aiHistory.map((analysis) => (
            <div key={analysis.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                      {analysis.type}
                    </span>
                    <span className="text-sm text-gray-500">{analysis.mode}</span>
                  </div>
                  <p className="text-gray-900 mb-2">{analysis.insights}</p>
                  <p className="text-sm text-gray-500">{formatDate(analysis.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
          
          {data.aiHistory.length === 0 && (
            <div className="text-center py-12">
              <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Analysis History</h3>
              <p className="text-gray-600">Generate your first AI insights to see them here</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
} 