'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CalculatorIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface CalculatorInputs {
  totalUnits: number
  averageRent: number
  latePaymentRate: number
  averageDaysLate: number
  lateFeeAmount: number
  evictionRate: number
  averageVacancyDays: number
  propertyManagementFee: number
}

interface CalculatorResults {
  monthlyRentRevenue: number
  annualRentRevenue: number
  monthlyLateFees: number
  annualLateFees: number
  monthlyVacancyLoss: number
  annualVacancyLoss: number
  monthlyManagementFees: number
  annualManagementFees: number
  totalAnnualLoss: number
  efficiencyScore: number
  recommendations: string[]
}

export default function RentCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    totalUnits: 5,
    averageRent: 1500,
    latePaymentRate: 15,
    averageDaysLate: 7,
    lateFeeAmount: 50,
    evictionRate: 2,
    averageVacancyDays: 14,
    propertyManagementFee: 8
  })

  const [results, setResults] = useState<CalculatorResults | null>(null)
  const [email, setEmail] = useState('')

  const calculateResults = (): CalculatorResults => {
    const monthlyRentRevenue = inputs.totalUnits * inputs.averageRent
    const annualRentRevenue = monthlyRentRevenue * 12
    
    const monthlyLateFees = (inputs.totalUnits * (inputs.latePaymentRate / 100)) * inputs.lateFeeAmount
    const annualLateFees = monthlyLateFees * 12
    
    const monthlyVacancyLoss = (inputs.totalUnits * (inputs.evictionRate / 100)) * (inputs.averageVacancyDays / 30) * inputs.averageRent
    const annualVacancyLoss = monthlyVacancyLoss * 12
    
    const monthlyManagementFees = monthlyRentRevenue * (inputs.propertyManagementFee / 100)
    const annualManagementFees = monthlyManagementFees * 12
    
    const totalAnnualLoss = annualLateFees + annualVacancyLoss + annualManagementFees
    
    // Calculate efficiency score (0-100)
    const efficiencyScore = Math.max(0, 100 - 
      (inputs.latePaymentRate * 2) - 
      (inputs.averageDaysLate * 3) - 
      (inputs.evictionRate * 5) - 
      (inputs.averageVacancyDays * 0.5)
    )
    
    const recommendations = []
    if (inputs.latePaymentRate > 10) {
      recommendations.push('Implement automated rent collection to reduce late payments')
    }
    if (inputs.averageDaysLate > 5) {
      recommendations.push('Set up automatic late fee reminders and payment tracking')
    }
    if (inputs.averageVacancyDays > 10) {
      recommendations.push('Improve tenant screening and retention strategies')
    }
    if (inputs.propertyManagementFee > 10) {
      recommendations.push('Consider self-management or negotiate lower management fees')
    }
    if (recommendations.length === 0) {
      recommendations.push('Your rent collection efficiency is excellent! Keep up the good work.')
    }
    
    return {
      monthlyRentRevenue,
      annualRentRevenue,
      monthlyLateFees,
      annualLateFees,
      monthlyVacancyLoss,
      annualVacancyLoss,
      monthlyManagementFees,
      annualManagementFees,
      totalAnnualLoss,
      efficiencyScore,
      recommendations
    }
  }

  const handleCalculate = () => {
    setResults(calculateResults())
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirect to signup page for the full analysis report
    window.location.href = '/auth/signup'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">PropertyBooks.io</span>
            </Link>
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-primary-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CalculatorIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Rent Collection Efficiency Calculator
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover how much money you're losing to late payments, vacancies, and management fees. 
              Get personalized recommendations to optimize your rental income.
            </p>
            
            {/* Detailed Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How This Calculator Works</h2>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What We Calculate:</h3>
                  <ul className="space-y-2">
                    <li><strong>Late Payment Losses:</strong> Revenue lost when tenants pay late, including missed late fees and administrative costs</li>
                    <li><strong>Vacancy Losses:</strong> Income lost during turnover periods and eviction processes</li>
                    <li><strong>Management Fees:</strong> Annual costs of property management services</li>
                    <li><strong>Efficiency Score:</strong> Overall performance rating based on industry benchmarks</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Industry Benchmarks:</h3>
                  <ul className="space-y-2">
                    <li><strong>Excellent (80-100):</strong> Top 10% of landlords</li>
                    <li><strong>Good (60-79):</strong> Above average performance</li>
                    <li><strong>Fair (40-59):</strong> Room for improvement</li>
                    <li><strong>Poor (0-39):</strong> Significant optimization needed</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">💡 Why This Matters:</h3>
                <p className="text-gray-700 text-sm">
                  Most landlords lose 15-25% of their potential income to inefficiencies. This calculator helps you identify 
                  exactly where your money is going and provides actionable steps to recover thousands in lost revenue annually. 
                  The average landlord using our recommendations sees a 40% improvement in their efficiency score within 6 months.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Inputs */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Property Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Units
                </label>
                <input
                  type="number"
                  value={inputs.totalUnits}
                  onChange={(e) => setInputs({...inputs, totalUnits: parseInt(e.target.value) || 0})}
                  className="input-field"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Monthly Rent per Unit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={inputs.averageRent}
                    onChange={(e) => setInputs({...inputs, averageRent: parseInt(e.target.value) || 0})}
                    className="input-field pl-8"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Late Payment Rate (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.latePaymentRate}
                    onChange={(e) => setInputs({...inputs, latePaymentRate: parseFloat(e.target.value) || 0})}
                    className="input-field"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Average Days Late
                  </label>
                  <input
                    type="number"
                    value={inputs.averageDaysLate}
                    onChange={(e) => setInputs({...inputs, averageDaysLate: parseInt(e.target.value) || 0})}
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Late Fee Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={inputs.lateFeeAmount}
                    onChange={(e) => setInputs({...inputs, lateFeeAmount: parseInt(e.target.value) || 0})}
                    className="input-field pl-8"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eviction Rate (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.evictionRate}
                    onChange={(e) => setInputs({...inputs, evictionRate: parseFloat(e.target.value) || 0})}
                    className="input-field"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Average Vacancy Days
                  </label>
                  <input
                    type="number"
                    value={inputs.averageVacancyDays}
                    onChange={(e) => setInputs({...inputs, averageVacancyDays: parseInt(e.target.value) || 0})}
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Management Fee (%)
                </label>
                <input
                  type="number"
                  value={inputs.propertyManagementFee}
                  onChange={(e) => setInputs({...inputs, propertyManagementFee: parseFloat(e.target.value) || 0})}
                  className="input-field"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <button 
                onClick={handleCalculate}
                className="btn-primary w-full py-3 text-lg"
              >
                Calculate Efficiency
              </button>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {results && (
              <>
                {/* Efficiency Score */}
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Your Efficiency Score</h3>
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - results.efficiencyScore / 100)}`}
                          className={`${results.efficiencyScore >= 80 ? 'text-success-500' : results.efficiencyScore >= 60 ? 'text-warning-500' : 'text-red-500'}`}
                        />
                      </svg>
                      <div className="absolute">
                        <span className="text-3xl font-bold">{Math.round(results.efficiencyScore)}</span>
                        <span className="text-sm text-gray-500">/100</span>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600">
                      {results.efficiencyScore >= 80 ? 'Excellent efficiency!' : 
                       results.efficiencyScore >= 60 ? 'Good efficiency with room for improvement' : 
                       'Significant opportunities for improvement'}
                    </p>
                  </div>
                </div>

                {/* Revenue Summary */}
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Annual Rent Revenue:</span>
                      <span className="font-semibold text-success-600">{formatCurrency(results.annualRentRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Annual Late Fees:</span>
                      <span className="font-semibold text-warning-600">{formatCurrency(results.annualLateFees)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Annual Vacancy Loss:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(results.annualVacancyLoss)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Annual Management Fees:</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(results.annualManagementFees)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Annual Loss:</span>
                      <span className="text-lg font-bold text-red-600">{formatCurrency(results.totalAnnualLoss)}</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
                  <div className="space-y-3">
                    {results.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* AI-Powered Full Report Preview */}
            <div className="card border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 p-2 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI-Powered Full Report Preview</h3>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">📊 Detailed Financial Analysis</h4>
                  <p className="text-gray-600 mb-3">Our AI analyzes your data against 10,000+ landlord profiles to provide:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Monthly vs. annual cash flow projections</li>
                    <li>• ROI optimization strategies</li>
                    <li>• Tax deduction opportunities</li>
                    <li>• Market comparison analysis</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">🎯 Personalized Action Plan</h4>
                  <p className="text-gray-600 mb-3">AI-generated recommendations based on your specific situation:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Tenant screening improvements</li>
                    <li>• Rent collection automation</li>
                    <li>• Maintenance cost optimization</li>
                    <li>• Property value enhancement</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">📈 Performance Tracking</h4>
                  <p className="text-gray-600 mb-3">Monitor your improvements over time:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Monthly efficiency score tracking</li>
                    <li>• Revenue growth projections</li>
                    <li>• Benchmark comparisons</li>
                    <li>• Success metrics dashboard</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🚀 Get Your Complete AI Analysis</h4>
                  <p className="mb-4 text-primary-100">
                    Unlock the full power of AI-driven landlord analytics with PropertyBooks.io
                  </p>
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email for free report"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                      required
                    />
                    <button type="submit" className="w-full bg-white text-primary-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      Get Your Full Analysis Report
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 