'use client'

import { useState, useEffect } from 'react'
import { countries } from '../data/countries'

interface Report {
  reportType: string
  generatedAt: string
  user: {
    name: string
    email: string
  }
  [key: string]: any
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [reportType, setReportType] = useState('portfolio-summary')
  const [dateRange, setDateRange] = useState('last-12-months')
  const [selectedProperty, setSelectedProperty] = useState('')
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setProperties(data)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const generateReport = async () => {
    setIsLoading(true)
    try {
      let url = `/api/reports?type=${reportType}&dateRange=${dateRange}`
      if (reportType === 'property-analysis' && selectedProperty) {
        url += `&propertyId=${selectedProperty}`
      }

      const response = await fetch(url, {
        credentials: 'include',
      })

      if (response.ok) {
        const report = await response.json()
        setReports(prev => [report, ...prev])
        setSelectedReport(report)
      } else {
        console.error('Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReport = (report: Report) => {
    const reportData = {
      ...report,
      generatedAt: new Date().toLocaleString(),
      company: 'Landlord Accounting Software',
      logo: '🏠'
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.reportType.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const renderReportContent = (report: Report) => {
    switch (report.reportType) {
      case 'Portfolio Summary':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-6">
              <div className="text-4xl mb-2">🏠</div>
              <h1 className="text-3xl font-bold text-gray-800">Portfolio Summary Report</h1>
              <p className="text-gray-600">Generated on {formatDate(report.generatedAt)}</p>
              <p className="text-gray-600">Prepared for {report.user.name}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Portfolio Overview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Properties:</span>
                    <span className="font-semibold">{report.portfolioMetrics.totalProperties}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-semibold">{formatCurrency(report.portfolioMetrics.totalValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Rent:</span>
                    <span className="font-semibold">{formatCurrency(report.portfolioMetrics.totalMonthlyRent)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Monthly Performance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Income:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(report.portfolioMetrics.monthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expenses:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(report.portfolioMetrics.monthlyExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Income:</span>
                    <span className={`font-semibold ${report.portfolioMetrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(report.portfolioMetrics.netIncome)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Performance Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Occupancy Rate:</span>
                    <span className="font-semibold">{report.portfolioMetrics.occupancyRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average ROI:</span>
                    <span className="font-semibold">{report.portfolioMetrics.averageROI}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            {report.topPerformers && report.topPerformers.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Top Performing Properties</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Property</th>
                        <th className="text-right py-2">Monthly Rent</th>
                        <th className="text-right py-2">Value</th>
                        <th className="text-right py-2">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topPerformers.map((property: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">
                            <div>
                              <div className="font-medium">{property.name}</div>
                              <div className="text-sm text-gray-600">{property.address}</div>
                            </div>
                          </td>
                          <td className="text-right py-2">{formatCurrency(property.monthlyRent)}</td>
                          <td className="text-right py-2">{formatCurrency(property.estimatedValue)}</td>
                          <td className="text-right py-2 font-semibold text-green-600">{property.roi}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {report.recentActivity && report.recentActivity.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {report.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <div className="font-medium">{activity.description}</div>
                        <div className="text-sm text-gray-600">{activity.property} • {formatDate(activity.date)}</div>
                      </div>
                      <div className={`font-semibold ${activity.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {activity.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(activity.amount))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'Income Statement':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-6">
              <div className="text-4xl mb-2">💰</div>
              <h1 className="text-3xl font-bold text-gray-800">Income Statement</h1>
              <p className="text-gray-600">Period: {report.period}</p>
              <p className="text-gray-600">Generated on {formatDate(report.generatedAt)}</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Gross Income</h3>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(report.summary.grossIncome)}</div>
              </div>
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Total Expenses</h3>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(report.summary.totalExpenses)}</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Net Income</h3>
                <div className={`text-2xl font-bold ${report.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(report.summary.netIncome)}
                </div>
                <div className="text-sm text-gray-600">Profit Margin: {report.summary.profitMargin}%</div>
              </div>
            </div>

            {/* Expense Breakdown */}
            {report.expenses.byCategory && report.expenses.byCategory.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Expenses by Category</h3>
                <div className="space-y-3">
                  {report.expenses.byCategory.map((category: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(category.amount)}</div>
                        <div className="text-sm text-gray-600">{category.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'Property Analysis':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-6">
              <div className="text-4xl mb-2">🏠</div>
              <h1 className="text-3xl font-bold text-gray-800">Property Analysis Report</h1>
              <p className="text-gray-600">{report.property.name}</p>
              <p className="text-gray-600">{report.property.address}</p>
              <p className="text-gray-600">Generated on {formatDate(report.generatedAt)}</p>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Property Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-semibold">{report.property.propertyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchase Price:</span>
                    <span className="font-semibold">{formatCurrency(report.property.purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Value:</span>
                    <span className="font-semibold">{formatCurrency(report.property.estimatedValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Rent:</span>
                    <span className="font-semibold">{formatCurrency(report.property.monthlyRent)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Financial Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cap Rate:</span>
                    <span className="font-semibold">{report.financialMetrics.capRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash-on-Cash Return:</span>
                    <span className="font-semibold">{report.financialMetrics.cashOnCashReturn}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Rent:</span>
                    <span className="font-semibold">{formatCurrency(report.financialMetrics.annualRent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Operating Income:</span>
                    <span className="font-semibold">{formatCurrency(report.financialMetrics.netOperatingIncome)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {report.aiAnalysis && (
              <div className="space-y-6">
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">AI Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Pricing Analysis</h4>
                      <div className="space-y-1 text-sm">
                        <div>Recommended Rent: {formatCurrency(report.aiAnalysis.pricingInsights.recommendedRent)}</div>
                        <div>Status: {report.aiAnalysis.pricingInsights.isOverpriced ? 'Overpriced' : report.aiAnalysis.pricingInsights.isUnderpriced ? 'Underpriced' : 'Fairly Priced'}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Market Analysis</h4>
                      <div className="space-y-1 text-sm">
                        <div>Trend: {report.aiAnalysis.marketAnalysis.marketTrend}</div>
                        <div>Potential: {report.aiAnalysis.marketAnalysis.investmentPotential}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{report.reportType}</h2>
            <p className="text-gray-600">Generated on {formatDate(report.generatedAt)}</p>
            <pre className="mt-4 text-left bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(report, null, 2)}
            </pre>
          </div>
        )
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Generate comprehensive reports with AI-powered insights</p>
      </div>

      {/* Report Generator */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="portfolio-summary">Portfolio Summary</option>
              <option value="property-analysis">Property Analysis</option>
              <option value="income-statement">Income Statement</option>
              <option value="cash-flow">Cash Flow Report</option>
              <option value="tax-summary">Tax Summary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="last-30-days">Last 30 Days</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="last-12-months">Last 12 Months</option>
              <option value="this-year">This Year</option>
              <option value="last-year">Last Year</option>
            </select>
          </div>

          {reportType === 'property-analysis' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={isLoading || (reportType === 'property-analysis' && !selectedProperty)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports History */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
          <div className="space-y-3">
            {reports.map((report, index) => (
              <div
                key={index}
                className={`bg-white border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedReport === report ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{report.reportType}</h3>
                    <p className="text-sm text-gray-600">{formatDate(report.generatedAt)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadReport(report)
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    📥
                  </button>
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>No reports generated yet</p>
                <p className="text-sm">Generate your first report above</p>
              </div>
            )}
          </div>
        </div>

        {/* Report Display */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="bg-white border rounded-lg p-6">
              {renderReportContent(selectedReport)}
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Report</h2>
              <p className="text-gray-600">Choose a report from the list to view its details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 