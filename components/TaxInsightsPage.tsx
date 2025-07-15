'use client'

import { useState, useEffect } from 'react'
import { countries } from '../data/countries'
import { 
  DocumentTextIcon, 
  CalculatorIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface TaxInsights {
  country: string
  taxInsights: string
  deductions: string[]
  requirements: string[]
  deadlines: string[]
  recommendations: string[]
}

interface UserSettings {
  name: string
  email: string
  country: string
  currency: string
  businessName?: string
  taxId?: string
}

export default function TaxInsightsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [taxInsights, setTaxInsights] = useState<TaxInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    fetchUserSettings()
    fetchProperties()
  }, [])

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setUserSettings(data.user)
        setSelectedCountry(data.user.country || 'US')
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
    }
  }

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

  const generateTaxInsights = async () => {
    if (!selectedCountry) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'generate-tax-insights',
          country: selectedCountry
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTaxInsights({
          country: selectedCountry,
          taxInsights: data.taxInsights,
          deductions: [
            'Property depreciation',
            'Mortgage interest',
            'Property taxes',
            'Insurance premiums',
            'Maintenance and repairs',
            'Property management fees',
            'Advertising costs',
            'Legal and accounting fees'
          ],
          requirements: [
            'Keep detailed records of all income and expenses',
            'File annual tax returns',
            'Report rental income',
            'Maintain receipts for all deductions',
            'Track property improvements separately'
          ],
          deadlines: [
            'Annual tax return: April 15th (US) / April 30th (Canada)',
            'Quarterly estimated payments: April, June, September, January',
            'Property tax payments: Varies by jurisdiction',
            '1099 forms: January 31st'
          ],
          recommendations: [
            'Consult with a tax professional for your specific situation',
            'Consider forming an LLC for liability protection',
            'Track mileage for property visits',
            'Separate personal and business expenses',
            'Consider tax-loss harvesting strategies'
          ]
        })
      }
    } catch (error) {
      console.error('Error generating tax insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const selectedCountryData = countries.find(c => c.code === selectedCountry)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tax Insights & Planning</h1>
        <p className="text-gray-600">AI-powered tax guidance tailored to your location and portfolio</p>
      </div>

      {/* Country Selection */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Tax Jurisdiction</h2>
            <p className="text-gray-600">Select your country for personalized tax insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            <button
              onClick={generateTaxInsights}
              disabled={isLoading || !selectedCountry}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <CalculatorIcon className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </button>
          </div>
        </div>

        {selectedCountryData && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{selectedCountryData.flag}</span>
              <div>
                <h3 className="font-semibold text-blue-900">{selectedCountryData.name}</h3>
                <p className="text-blue-700">Currency: {selectedCountryData.currency} ({selectedCountryData.currencyCode})</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tax Insights */}
      {taxInsights && (
        <div className="space-y-6">
          {/* AI-Generated Insights */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <InformationCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">AI Tax Analysis</h2>
            </div>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {taxInsights.taxInsights}
              </div>
            </div>
          </div>

          {/* Portfolio Tax Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Annual Rental Income</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(properties.reduce((sum, p) => sum + (p.monthlyRent * 12), 0), selectedCountryData?.currencyCode)}
              </div>
              <p className="text-sm text-gray-600 mt-2">From {properties.length} properties</p>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Estimated Tax Liability</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(properties.reduce((sum, p) => sum + (p.monthlyRent * 12), 0) * 0.25, selectedCountryData?.currencyCode)}
              </div>
              <p className="text-sm text-gray-600 mt-2">25% estimated rate</p>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <CalendarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Next Filing Deadline</h3>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {selectedCountry === 'US' ? 'April 15' : selectedCountry === 'CA' ? 'April 30' : 'Varies'}
              </div>
              <p className="text-sm text-gray-600 mt-2">Annual tax return</p>
            </div>
          </div>

          {/* Tax Deductions */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Common Tax Deductions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taxInsights.deductions.map((deduction, index) => (
                <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">{deduction}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filing Requirements */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Filing Requirements</h2>
            </div>
            <div className="space-y-3">
              {taxInsights.requirements.map((requirement, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{requirement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Deadlines */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Important Deadlines</h2>
            </div>
            <div className="space-y-3">
              {taxInsights.deadlines.map((deadline, index) => (
                <div key={index} className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-orange-600 mr-3" />
                  <span className="text-gray-700">{deadline}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <InformationCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">AI Recommendations</h2>
            </div>
            <div className="space-y-3">
              {taxInsights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start p-3 bg-purple-50 rounded-lg">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Insights Yet */}
      {!taxInsights && (
        <div className="bg-white border rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Generate Tax Insights</h2>
          <p className="text-gray-600 mb-6">
            Select your country and click "Generate Insights" to get AI-powered tax guidance tailored to your location and portfolio.
          </p>
          <div className="flex justify-center">
            <button
              onClick={generateTaxInsights}
              disabled={isLoading || !selectedCountry}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Generate Tax Insights
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 