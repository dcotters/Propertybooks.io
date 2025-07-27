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
  BuildingOfficeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
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
  status?: 'pending' | 'reviewed' | 'approved' | 'expired'
  expiryDate?: string
}

interface DocumentForm {
  title: string
  description: string
  type: string
  category: string
  propertyId: string
  tags: string
  status: string
  expiryDate: string
  file?: File
}

const DOCUMENT_TYPES = [
  { value: 'LEGAL_LEASE_AGREEMENT', label: 'Lease Agreement', icon: DocumentTextIcon },
  { value: 'LEGAL_PURCHASE_CONTRACT', label: 'Purchase Contract', icon: DocumentTextIcon },
  { value: 'FINANCIAL_MORTGAGE_DOCUMENT', label: 'Mortgage Document', icon: DocumentTextIcon },
  { value: 'FINANCIAL_INSURANCE_POLICY', label: 'Insurance Policy', icon: DocumentTextIcon },
  { value: 'FINANCIAL_TAX_DOCUMENT', label: 'Tax Document', icon: DocumentTextIcon },
  { value: 'MAINTENANCE_REPAIR_RECEIPT', label: 'Repair Receipt', icon: DocumentTextIcon },
  { value: 'MAINTENANCE_INSPECTION_REPORT', label: 'Inspection Report', icon: DocumentTextIcon },
  { value: 'TENANT_APPLICATION', label: 'Tenant Application', icon: DocumentTextIcon },
  { value: 'TENANT_BACKGROUND_CHECK', label: 'Background Check', icon: DocumentTextIcon },
  { value: 'UTILITY_BILL', label: 'Utility Bill', icon: DocumentTextIcon },
  { value: 'OTHER', label: 'Other', icon: DocumentTextIcon }
]

const DOCUMENT_CATEGORIES = [
  { value: 'LEGAL', label: 'Legal Documents', color: 'bg-blue-100 text-blue-800' },
  { value: 'FINANCIAL', label: 'Financial Documents', color: 'bg-green-100 text-green-800' },
  { value: 'MAINTENANCE', label: 'Maintenance & Repairs', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'TENANT', label: 'Tenant Documents', color: 'bg-purple-100 text-purple-800' },
  { value: 'UTILITY', label: 'Utilities', color: 'bg-orange-100 text-orange-800' },
  { value: 'OTHER', label: 'Other', color: 'bg-gray-100 text-gray-800' }
]

const DOCUMENT_STATUSES = [
  { value: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'reviewed', label: 'Reviewed', color: 'bg-blue-100 text-blue-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' }
]

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterProperty, setFilterProperty] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [documentForm, setDocumentForm] = useState<DocumentForm>({
    title: '',
    description: '',
    type: 'LEGAL_LEASE_AGREEMENT',
    category: 'LEGAL',
    propertyId: '',
    tags: '',
    status: 'pending',
    expiryDate: ''
  })

  useEffect(() => {
    fetchDocuments()
    fetchProperties()
  }, [filterType, filterCategory, filterProperty, filterStatus])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      let url = '/api/documents'
      const params = new URLSearchParams()
      
      if (filterType) params.append('type', filterType)
      if (filterCategory) params.append('category', filterCategory)
      if (filterProperty) params.append('propertyId', filterProperty)
      if (filterStatus) params.append('status', filterStatus)
      
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
      
      // Upload file
      const uploadFormData = new FormData()
      uploadFormData.append('file', documentForm.file)
      uploadFormData.append('type', 'document')
      uploadFormData.append('propertyId', documentForm.propertyId)
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include',
      })

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json()
        
        // Create document record
        const documentData = {
          title: documentForm.title,
          description: documentForm.description,
          type: documentForm.type,
          category: documentForm.category,
          propertyId: documentForm.propertyId || null,
          tags: documentForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          status: documentForm.status,
          expiryDate: documentForm.expiryDate || null,
          fileUrl: uploadResult.document.url,
          fileName: documentForm.file.name,
          fileSize: documentForm.file.size,
          mimeType: documentForm.file.type
        }

        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(documentData),
          credentials: 'include',
        })

        if (response.ok) {
          setShowUploadModal(false)
          setDocumentForm({
            title: '',
            description: '',
            type: 'LEGAL_LEASE_AGREEMENT',
            category: 'LEGAL',
            propertyId: '',
            tags: '',
            status: 'pending',
            expiryDate: ''
          })
          fetchDocuments()
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        fetchDocuments()
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedDocuments.length} documents?`)) return

    try {
      const response = await fetch('/api/documents/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: selectedDocuments }),
        credentials: 'include',
      })

      if (response.ok) {
        setSelectedDocuments([])
        setShowBulkActions(false)
        fetchDocuments()
      }
    } catch (error) {
      console.error('Error bulk deleting documents:', error)
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      const response = await fetch('/api/documents/bulk-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          documentIds: selectedDocuments, 
          status 
        }),
        credentials: 'include',
      })

      if (response.ok) {
        setSelectedDocuments([])
        setShowBulkActions(false)
        fetchDocuments()
      }
    } catch (error) {
      console.error('Error bulk updating documents:', error)
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

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    )
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getDocumentIcon = (type: string) => {
    const docType = DOCUMENT_TYPES.find(t => t.value === type)
    return docType ? <docType.icon className="h-6 w-6" /> : <DocumentIcon className="h-6 w-6" />
  }

  const getCategoryColor = (category: string) => {
    const cat = DOCUMENT_CATEGORIES.find(c => c.value === category)
    return cat ? cat.color : 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const stat = DOCUMENT_STATUSES.find(s => s.value === status)
    return stat ? stat.color : 'bg-gray-100 text-gray-800'
  }

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return expiry <= thirtyDaysFromNow && expiry > now
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
              {DOCUMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {DOCUMENT_CATEGORIES.map(category => (
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
                    {DOCUMENT_TYPES.map(type => (
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
                    {DOCUMENT_CATEGORIES.map(category => (
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
    </div>
  )
} 