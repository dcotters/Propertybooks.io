'use client'

import React from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface ReceiptAnalysis {
  vendor: string
  amount: number
  date: string
  items: string[]
  category: string
  taxCategory: string
  taxDeductible: boolean
  deductionType: string
  confidence: number
  description: string
  suggestedTags: string[]
  complianceNotes: string[]
  canadianForm: string
  gstHstEligible: boolean
}

interface ReceiptAnalysisPreviewProps {
  analysis: ReceiptAnalysis
  onAccept: () => void
  onReject: () => void
}

export default function ReceiptAnalysisPreview({ 
  analysis, 
  onAccept, 
  onReject 
}: ReceiptAnalysisPreviewProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100'
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircleIcon className="h-5 w-5 text-green-600" />
    if (confidence >= 60) return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
    return <InformationCircleIcon className="h-5 w-5 text-red-600" />
  }

  const getTaxDeductibleColor = (deductible: boolean) => {
    return deductible 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Receipt Analysis</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
          {getConfidenceIcon(analysis.confidence)}
          {analysis.confidence}% Confidence
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Vendor Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BuildingOfficeIcon className="h-4 w-4" />
            <span className="font-medium">Vendor:</span>
          </div>
          <p className="text-gray-900 font-medium">{analysis.vendor}</p>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CurrencyDollarIcon className="h-4 w-4" />
            <span className="font-medium">Amount:</span>
          </div>
          <p className="text-gray-900 font-medium">${analysis.amount.toFixed(2)}</p>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span className="font-medium">Date:</span>
          </div>
          <p className="text-gray-900">{new Date(analysis.date).toLocaleDateString()}</p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TagIcon className="h-4 w-4" />
            <span className="font-medium">Category:</span>
          </div>
          <p className="text-gray-900 font-medium">{analysis.category}</p>
        </div>
      </div>

      {/* Canadian Tax Information */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">🇨🇦 Canadian Tax Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tax Category</p>
            <p className="font-medium text-gray-900">{analysis.taxCategory}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tax Deductible</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaxDeductibleColor(analysis.taxDeductible)}`}>
              {analysis.taxDeductible ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Deduction Type</p>
            <p className="font-medium text-gray-900">{analysis.deductionType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Canadian Form</p>
            <p className="font-medium text-gray-900">{analysis.canadianForm}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">GST/HST Eligible</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${analysis.gstHstEligible ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'}`}>
              {analysis.gstHstEligible ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Items */}
      {analysis.items.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Items Purchased</h4>
          <ul className="space-y-1">
            {analysis.items.map((item, index) => (
              <li key={index} className="text-sm text-gray-600">• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Tags */}
      {analysis.suggestedTags.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Suggested Tags</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.suggestedTags.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Notes */}
      {analysis.complianceNotes.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Compliance Notes</h4>
          <ul className="space-y-1">
            {analysis.complianceNotes.map((note, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <InformationCircleIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onAccept}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Accept Analysis
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Edit Manually
        </button>
      </div>

      {/* Confidence Warning */}
      {analysis.confidence < 70 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Low Confidence Analysis</p>
              <p className="text-sm text-yellow-700 mt-1">
                The AI analysis has low confidence. Please review and edit the information manually for accuracy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 