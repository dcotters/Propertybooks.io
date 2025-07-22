'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentIcon,
  FolderIcon,
  SparklesIcon,
  CalendarIcon,
  TagIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { Modal } from './ai/AIAnalysisPanel'

interface Document {
  id: string
  title: string
  description?: string
  type: string
  category: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  tags: string[]
  createdAt: string
  property?: {
    name: string
    address: string
  }
  aiAnalyses?: Array<{
    id: string
    analysisType: string
    content: string
    summary?: string
    keyPoints?: any
    createdAt: string
  }>
}

interface DocumentForm {
  title: string
  description: string
  type: string
  category: string
  propertyId: string
  tags: string
  file?: File
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null)
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterProperty, setFilterProperty] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [documentForm, setDocumentForm] = useState<DocumentForm>({
    title: '',
    description: '',
    type: 'LEGAL_LEASE_AGREEMENT',
    category: 'LEGAL',
    propertyId: '',
    tags: ''
  })

  useEffect(() => {
    fetchDocuments()
    fetchProperties()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      let url = '/api/documents'
      const params = new URLSearchParams()
      
      if (filterType) params.append('type', filterType)
      if (filterCategory) params.append('category', filterCategory)
      if (filterProperty) params.append('propertyId', filterProperty)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setProperties(data)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!documentForm.file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('title', documentForm.title)
      formData.append('description', documentForm.description)
      formData.append('type', documentForm.type)
      formData.append('category', documentForm.category)
      formData.append('propertyId', documentForm.propertyId)
      formData.append('tags', documentForm.tags)
      formData.append('file', documentForm.file)

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (response.ok) {
        const newDocument = await response.json()
        setDocuments([newDocument, ...documents])
        setShowUploadModal(false)
        setDocumentForm({
          title: '',
          description: '',
          type: 'LEGAL_LEASE_AGREEMENT',
          category: 'LEGAL',
          propertyId: '',
          tags: ''
        })
      } else {
        alert('Error uploading document')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Error uploading document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== documentId))
      } else {
        alert('Error deleting document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error deleting document')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentForm({
        ...documentForm,
        file: e.target.files[0]
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'LEGAL_LEASE_AGREEMENT':
        return <DocumentTextIcon className="h-6 w-6 text-blue-600" />
      case 'LEGAL_INSURANCE_POLICY':
      case 'LEGAL_INSURANCE_DOCUMENT':
        return <DocumentIcon className="h-6 w-6 text-green-600" />
      case 'LEGAL_PROPERTY_TAX_DOCUMENT':
      case 'LEGAL_TAX_DOCUMENT':
        return <DocumentIcon className="h-6 w-6 text-red-600" />
      case 'LEGAL_MAINTENANCE_CONTRACT':
        return <DocumentIcon className="h-6 w-6 text-orange-600" />
      case 'LEGAL_COURT_DOCUMENT':
      case 'LEGAL_NOTICE':
      case 'LEGAL_EVICTION_NOTICE':
      case 'LEGAL_TERMINATION_NOTICE':
        return <DocumentIcon className="h-6 w-6 text-purple-600" />
      case 'LEGAL_RECEIPT':
      case 'LEGAL_INVOICE':
        return <DocumentIcon className="h-6 w-6 text-yellow-600" />
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LEGAL':
        return 'bg-blue-100 text-blue-800'
      case 'FINANCIAL':
        return 'bg-green-100 text-green-800'
      case 'PROPERTY_MANAGEMENT':
        return 'bg-purple-100 text-purple-800'
      case 'INSURANCE':
        return 'bg-yellow-100 text-yellow-800'
      case 'TAX':
        return 'bg-red-100 text-red-800'
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

  const documentTypes = [
    { value: 'LEGAL_LEASE_AGREEMENT', label: 'Legal Lease Agreement' },
    { value: 'LEGAL_RENTAL_APPLICATION', label: 'Legal Rental Application' },
    { value: 'LEGAL_PROPERTY_MANAGEMENT_AGREEMENT', label: 'Legal Property Management Agreement' },
    { value: 'LEGAL_INSURANCE_POLICY', label: 'Legal Insurance Policy' },
    { value: 'LEGAL_PROPERTY_TAX_DOCUMENT', label: 'Legal Property Tax Document' },
    { value: 'LEGAL_MORTGAGE_DOCUMENT', label: 'Legal Mortgage Document' },
    { value: 'LEGAL_INSPECTION_REPORT', label: 'Legal Inspection Report' },
    { value: 'LEGAL_MAINTENANCE_CONTRACT', label: 'Legal Maintenance Contract' },
    { value: 'LEGAL_NOTICE', label: 'Legal Notice' },
    { value: 'LEGAL_COURT_DOCUMENT', label: 'Legal Court Document' },
    { value: 'LEGAL_FINANCIAL_STATEMENT', label: 'Legal Financial Statement' },
    { value: 'LEGAL_RECEIPT', label: 'Legal Receipt' },
    { value: 'LEGAL_INVOICE', label: 'Legal Invoice' },
    { value: 'LEGAL_CONTRACT', label: 'Legal Contract' },
    { value: 'LEGAL_TAX_DOCUMENT', label: 'Legal Tax Document' },
    { value: 'LEGAL_INSURANCE_DOCUMENT', label: 'Legal Insurance Document' },
    { value: 'LEGAL_COMPLIANCE_DOCUMENT', label: 'Legal Compliance Document' },
    { value: 'LEGAL_DISCLOSURE_DOCUMENT', label: 'Legal Disclosure Document' },
    { value: 'LEGAL_AMENDMENT', label: 'Legal Amendment' },
    { value: 'LEGAL_ADDENDUM', label: 'Legal Addendum' },
    { value: 'LEGAL_TERMINATION_NOTICE', label: 'Legal Termination Notice' },
    { value: 'LEGAL_EVICTION_NOTICE', label: 'Legal Eviction Notice' },
    { value: 'LEGAL_SETTLEMENT_AGREEMENT', label: 'Legal Settlement Agreement' },
    { value: 'LEGAL_LIABILITY_WAIVER', label: 'Legal Liability Waiver' },
    { value: 'LEGAL_INDEMNIFICATION_AGREEMENT', label: 'Legal Indemnification Agreement' },
    { value: 'OTHER', label: 'Other' }
  ]

  const documentCategories = [
    { value: 'LEGAL', label: 'Legal' },
    { value: 'FINANCIAL', label: 'Financial' },
    { value: 'PROPERTY_MANAGEMENT', label: 'Property Management' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'TAX', label: 'Tax' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'INSPECTION', label: 'Inspection' },
    { value: 'OTHER', label: 'Other' }
  ]

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
          <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
          <p className="text-gray-600">Store and analyze leases, contracts, and legal documents</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {documentCategories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
            
            <select
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Properties</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>{property.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <motion.div
            key={document.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getDocumentIcon(document.type)}
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{document.title}</h3>
                  <p className="text-sm text-gray-500">{document.fileName}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    setSelectedDocument(document)
                    if (document.aiAnalyses && document.aiAnalyses.length > 0) {
                      setSelectedAnalysis(document.aiAnalyses[0])
                      setShowAnalysisModal(true)
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="View AI Analysis"
                >
                  <SparklesIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => window.open(document.fileUrl, '_blank')}
                  className="p-1 text-gray-400 hover:text-green-600"
                  title="View Document"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(document.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete Document"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {document.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{document.description}</p>
            )}

            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                {document.category}
              </span>
              <span className="text-xs text-gray-500">{formatFileSize(document.fileSize)}</span>
            </div>

            {document.property && (
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                {document.property.name}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {formatDate(document.createdAt)}
              </div>
              {document.aiAnalyses && document.aiAnalyses.length > 0 && (
                <div className="flex items-center text-green-600">
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  AI Analyzed
                </div>
              )}
            </div>

            {document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {document.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {document.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{document.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType || filterCategory || filterProperty 
              ? 'Try adjusting your filters or search terms'
              : 'Get started by uploading your first document'
            }
          </p>
          {!searchTerm && !filterType && !filterCategory && !filterProperty && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              Upload Document
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-xl rounded-lg bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={documentForm.title}
                    onChange={(e) => setDocumentForm({...documentForm, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Lease Agreement - 123 Main St"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                  <select
                    required
                    value={documentForm.type}
                    onChange={(e) => setDocumentForm({...documentForm, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={documentForm.category}
                    onChange={(e) => setDocumentForm({...documentForm, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {documentCategories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property (Optional)</label>
                  <select
                    value={documentForm.propertyId}
                    onChange={(e) => setDocumentForm({...documentForm, propertyId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">No Specific Property</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>{property.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={documentForm.description}
                  onChange={(e) => setDocumentForm({...documentForm, description: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief description of the document..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={documentForm.tags}
                  onChange={(e) => setDocumentForm({...documentForm, tags: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="lease, tenant, renewal (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {showAnalysisModal && selectedAnalysis && (
        <Modal
          open={showAnalysisModal}
          onClose={() => setShowAnalysisModal(false)}
          title="AI Document Analysis"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <SparklesIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-semibold text-blue-900">Analysis Summary</h4>
              </div>
              <p className="text-blue-800 text-sm">{selectedAnalysis.summary}</p>
            </div>

            {selectedAnalysis.keyPoints && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Key Points</h4>
                <ul className="space-y-1">
                  {selectedAnalysis.keyPoints.points?.map((point: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Full Analysis</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="whitespace-pre-wrap text-sm text-gray-700">
                  {selectedAnalysis.content}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
} 