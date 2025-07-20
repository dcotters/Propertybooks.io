'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  CalculatorIcon, 
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface FinancialReportData {
  plStatement?: {
    period: { start: string; end: string }
    summary: {
      totalIncome: number
      totalExpenses: number
      netIncome: number
      profitMargin: number
    }
    income: {
      total: number
      breakdown: Record<string, any[]>
      items: Array<{
        description: string
        date: string
        amount: number
        paidTo: string
      }>
    }
    expenses: {
      total: number
      breakdown: Record<string, any[]>
      items: Array<{
        description: string
        date: string
        amount: number
        paidBy: string
        taxCategory: string
      }>
    }
  }
  taxReport?: {
    year: number
    period: { start: string; end: string }
    summary: {
      totalIncome: number
      totalExpenses: number
      netIncome: number
    }
    taxExpenses: Record<string, { total: number; items: any[] }>
    taxCategories: Array<{
      category: string
      amount: number
      itemCount: number
    }>
  }
  cashFlowReport?: {
    period: { start: string; end: string }
    monthlyBreakdown: Record<string, any>
    summary: {
      totalIncome: number
      totalExpenses: number
      netCashFlow: number
    }
  }
}

interface FinancialReportsProps {
  propertyId?: string
}

export default function FinancialReports({ propertyId }: FinancialReportsProps) {
  const [data, setData] = useState<FinancialReportData>({})
  const [loading, setLoading] = useState(false)
  const [activeReport, setActiveReport] = useState('pl')
  const [period, setPeriod] = useState('current-year')
  const [year, setYear] = useState(new Date().getFullYear().toString())

  const fetchReport = async (reportType: string) => {
    try {
      setLoading(true)
      
      let url = `/api/reports/financial?type=${reportType}`
      
      if (propertyId) {
        url += `&propertyId=${propertyId}`
      }
      
      if (reportType === 'tax') {
        url += `&year=${year}`
      } else if (period !== 'current-year') {
        const [startDate, endDate] = getPeriodDates(period)
        url += `&periodStart=${startDate}&periodEnd=${endDate}`
      }

      const response = await fetch(url, { credentials: 'include' })
      const result = await response.json()

      if (response.ok) {
        setData(prev => ({ ...prev, [reportType === 'pl' ? 'plStatement' : reportType === 'tax' ? 'taxReport' : 'cashFlowReport']: result[reportType === 'pl' ? 'plStatement' : reportType === 'tax' ? 'taxReport' : 'cashFlowReport'] }))
      } else {
        console.error('Failed to fetch report:', result.error)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPeriodDates = (period: string): [string, string] => {
    const now = new Date()
    let startDate: Date, endDate: Date

    switch (period) {
      case 'last-3-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        endDate = now
        break
      case 'last-6-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        endDate = now
        break
      case 'last-year':
        startDate = new Date(now.getFullYear() - 1, 0, 1)
        endDate = new Date(now.getFullYear() - 1, 11, 31)
        break
      default: // current-year
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = now
    }

    return [startDate.toISOString(), endDate.toISOString()]
  }

  useEffect(() => {
    if (activeReport) {
      fetchReport(activeReport)
    }
  }, [activeReport, period, year, propertyId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

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
          <h2 className="text-2xl font-bold text-gray-900">Financial Reports</h2>
          <p className="text-gray-600">Comprehensive P&L and tax reporting</p>
        </div>
        <div className="flex items-center space-x-4">
          {activeReport === 'tax' ? (
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          ) : (
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="current-year">Current Year</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="last-year">Last Year</option>
            </select>
          )}
        </div>
      </div>

      {/* Report Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'pl', label: 'P&L Statement', icon: DocumentTextIcon },
            { id: 'tax', label: 'Tax Report', icon: CalculatorIcon },
            { id: 'cash-flow', label: 'Cash Flow', icon: ChartBarIcon }
          ].map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeReport === report.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <report.icon className="h-4 w-4 mr-2" />
              {report.label}
            </button>
          ))}
        </nav>
      </div>

      {/* P&L Statement */}
      {activeReport === 'pl' && data.plStatement && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="bg-success-100 p-3 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.plStatement.summary.totalIncome)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <ArrowDownIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.plStatement.summary.totalExpenses)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${data.plStatement.summary.netIncome >= 0 ? 'bg-success-100' : 'bg-red-100'}`}>
                  <CurrencyDollarIcon className={`h-6 w-6 ${data.plStatement.summary.netIncome >= 0 ? 'text-success-600' : 'text-red-600'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Income</p>
                  <p className={`text-2xl font-bold ${data.plStatement.summary.netIncome >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                    {formatCurrency(data.plStatement.summary.netIncome)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                  <p className="text-2xl font-bold text-gray-900">{data.plStatement.summary.profitMargin.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Income vs Expenses Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Income', value: data.plStatement.summary.totalIncome, fill: '#10B981' },
                  { name: 'Expenses', value: data.plStatement.summary.totalExpenses, fill: '#EF4444' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(data.plStatement.expenses.breakdown).map(([category, items], index) => ({
                      name: category,
                      value: items.reduce((sum, item) => sum + item.amount, 0)
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.entries(data.plStatement.expenses.breakdown).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Table */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.plStatement.income.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Expenses</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Category</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.plStatement.expenses.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{formatCurrency(item.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.taxCategory}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tax Report */}
      {activeReport === 'tax' && data.taxReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="bg-success-100 p-3 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.taxReport.summary.totalIncome)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <ArrowDownIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.taxReport.summary.totalExpenses)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${data.taxReport.summary.netIncome >= 0 ? 'bg-success-100' : 'bg-red-100'}`}>
                  <CalculatorIcon className={`h-6 w-6 ${data.taxReport.summary.netIncome >= 0 ? 'text-success-600' : 'text-red-600'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Income</p>
                  <p className={`text-2xl font-bold ${data.taxReport.summary.netIncome >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                    {formatCurrency(data.taxReport.summary.netIncome)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Categories Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Expense Categories</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.taxReport.taxCategories} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={150} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tax Categories Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Expense Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Expense Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.taxReport.taxCategories.map((category, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{formatCurrency(category.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.itemCount} transactions</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">TOTAL</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{formatCurrency(data.taxReport.summary.totalExpenses)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cash Flow Report */}
      {activeReport === 'cash-flow' && data.cashFlowReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="bg-success-100 p-3 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.cashFlowReport.summary.totalIncome)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <ArrowDownIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.cashFlowReport.summary.totalExpenses)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${data.cashFlowReport.summary.netCashFlow >= 0 ? 'bg-success-100' : 'bg-red-100'}`}>
                  <ChartBarIcon className={`h-6 w-6 ${data.cashFlowReport.summary.netCashFlow >= 0 ? 'text-success-600' : 'text-red-600'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                  <p className={`text-2xl font-bold ${data.cashFlowReport.summary.netCashFlow >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                    {formatCurrency(data.cashFlowReport.summary.netCashFlow)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Cash Flow Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cash Flow</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={Object.entries(data.cashFlowReport.monthlyBreakdown).map(([month, data]) => ({
                month,
                income: data.income,
                expenses: data.expenses,
                netCashFlow: data.netCashFlow
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  )
} 