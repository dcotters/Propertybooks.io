'use client'

import { useState, useEffect } from 'react'
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
  canadianForms: string[]
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
  const [properties, setProperties] = useState<any[]>([])

  // Canada-focused app - no country selection needed
  const selectedCountry = 'CA'

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
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/tax-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          country: 'CA',
          propertyData: properties,
          transactions: [] // You might want to fetch transactions here
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTaxInsights({
          country: 'CA',
          taxInsights: data.analysis || 'Canadian tax analysis generated successfully.',
          deductions: [
            'Advertising expenses',
            'Insurance premiums',
            'Interest and bank charges',
            'Office expenses',
            'Professional fees (legal, accounting)',
            'Management and administration fees',
            'Repairs and maintenance',
            'Property taxes',
            'Travel expenses',
            'Utilities',
            'Motor vehicle expenses',
            'CCA (Capital Cost Allowance)',
            'GST/HST input tax credits'
          ],
          requirements: [
            'File T776 - Statement of Real Estate Rentals with T1',
            'Keep detailed records for 6 years as required by CRA',
            'Report all rental income and expenses',
            'Separate personal and business expenses',
            'Track CCA (Capital Cost Allowance) separately',
            'Maintain GST/HST records if applicable',
            'Document all property improvements'
          ],
          deadlines: [
            'April 30: Personal tax return (T1)',
            'June 15: Self-employed tax return (T1)',
            'March 31: Corporate tax return (T2)',
            'Quarterly: GST/HST returns (if applicable)',
            'Property tax payments: Varies by municipality'
          ],
          recommendations: [
            'Consult with a Canadian tax professional for your specific situation',
            'Consider forming a corporation for liability protection',
            'Track mileage for property visits',
            'Separate capital improvements from repairs for CCA',
            'Consider GST/HST registration if earning >$30k/year',
            'Plan for CCA recapture on property sales',
            'Keep detailed records for CRA audit compliance'
          ],
          canadianForms: [
            'T776 - Statement of Real Estate Rentals',
            'T1 - Personal Income Tax Return',
            'T2125 - Statement of Business Activities (if flipping)',
            'T2091(IND) - Principal Residence Exemption (if applicable)',
            'Schedule 3 - Capital Gains (if selling)',
            'GST/HST returns (if registered)'
          ]
        })
      }
    } catch (error) {
      console.error('Error generating tax insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🇨🇦 Canadian Tax Insights & Planning</h1>
        <p className="text-gray-600">AI-powered Canadian tax guidance for T776 filing and CRA compliance</p>
      </div>

      {/* Canadian Tax Jurisdiction */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">🇨🇦 Canadian Tax Jurisdiction</h2>
            <p className="text-gray-600">Your app is configured for Canadian tax filing and CRA compliance</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-800 font-medium">
              🇨🇦 Canada (CAD)
            </div>
            <button
              onClick={generateTaxInsights}
              disabled={isLoading}
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
                  Generate Canadian Tax Insights
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🇨🇦</span>
            <div>
              <h3 className="font-semibold text-blue-900">Canada</h3>
              <p className="text-blue-700">Currency: Canadian Dollar (CAD)</p>
              <p className="text-blue-700">Tax Authority: Canada Revenue Agency (CRA)</p>
            </div>
          </div>
        </div>
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
              <h2 className="text-xl font-semibold text-gray-900">🇨🇦 Canadian AI Tax Analysis</h2>
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
                {formatCurrency(properties.reduce((sum, p) => sum + (p.monthlyRent * 12), 0), 'CAD')}
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
                {formatCurrency(properties.reduce((sum, p) => sum + (p.monthlyRent * 12), 0) * 0.25, 'CAD')}
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
                April 30
              </div>
              <p className="text-sm text-gray-600 mt-2">T1 Personal Tax Return</p>
            </div>
          </div>

          {/* Canadian Tax Forms */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <DocumentTextIcon className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">🇨🇦 Required Canadian Tax Forms</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taxInsights.canadianForms.map((form, index) => (
                <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <DocumentTextIcon className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-gray-700 font-medium">{form}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Deductions */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">🇨🇦 Canadian Tax Deductions (T776)</h2>
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
              <h2 className="text-xl font-semibold text-gray-900">🇨🇦 CRA Filing Requirements</h2>
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
              <h2 className="text-xl font-semibold text-gray-900">🇨🇦 Canadian Tax Deadlines</h2>
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
              <h2 className="text-xl font-semibold text-gray-900">🇨🇦 Canadian Tax Recommendations</h2>
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
          <div className="text-6xl mb-4">🇨🇦💰</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Generate Canadian Tax Insights</h2>
          <p className="text-gray-600 mb-6">
            Click "Generate Canadian Tax Insights" to get AI-powered tax guidance for T776 filing and CRA compliance.
          </p>
          <div className="flex justify-center">
            <button
              onClick={generateTaxInsights}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Generate Canadian Tax Insights
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 