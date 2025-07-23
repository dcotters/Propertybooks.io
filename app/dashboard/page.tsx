'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  HomeIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlusIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  CogIcon,
  BellIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Modal } from '../../components/ai/AIAnalysisPanel'
import { useTabContext } from '../../components/providers/TabProvider'
import PropertyEditModal from '../../components/PropertyEditModal'
import TaxInsightsPage from '../../components/TaxInsightsPage'
import FinancialReports from '../../components/FinancialReports'
import { Menu } from '@headlessui/react'
import { useSession, signOut } from 'next-auth/react'
import UserAvatar from '../../components/UserAvatar'
import SettingsModal from '../../components/SettingsModal'
import SidebarNavigation from '../../components/SidebarNavigation'
import Navigation from '../../components/Navigation'

interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  propertyType: string
  purchasePrice: number
  purchaseDate: string
  units: number
  occupiedUnits?: number
  monthlyRent: number
  estimatedValue: number
  yearBuilt: number
  squareFootage: number
  bedrooms: number
  bathrooms: number
  parkingSpaces: number
  description: string
  status?: 'active' | 'maintenance' | 'vacant'
}

interface Transaction {
  id: string
  propertyId?: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  description: string
  category: string
  date: string
  receiptUrl?: string
}

interface AddPropertyForm {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  propertyType: string
  purchasePrice: string
  purchaseDate: string
  units: string
  monthlyRent: string
  mortgageRate: string
  mortgagePayment: string
  propertyTax: string
  insurance: string
  hoaFees: string
  estimatedValue: string
  yearBuilt: string
  squareFootage: string
  bedrooms: string
  bathrooms: string
  parkingSpaces: string
  description: string
}

interface AddTransactionForm {
  type: 'INCOME' | 'EXPENSE'
  amount: string
  description: string
  category: string
  date: string
  propertyId: string
  receiptFile?: File
  paymentMethod: string
  reference: string
  notes: string
  recurring: boolean
  recurringFrequency: string
  tags: string[]
  taxCategory?: string
  paidBy?: string
}

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false)
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [reportData, setReportData] = useState<any>(null)
  const [reportType, setReportType] = useState('income-statement')
  const [reportLoading, setReportLoading] = useState(false)
  const [propertyForm, setPropertyForm] = useState<AddPropertyForm>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    propertyType: 'SINGLE_FAMILY',
    purchasePrice: '',
    purchaseDate: '',
    units: '1',
    monthlyRent: '',
    mortgageRate: '',
    mortgagePayment: '',
    propertyTax: '',
    insurance: '',
    hoaFees: '',
    estimatedValue: '',
    yearBuilt: '',
    squareFootage: '',
    bedrooms: '',
    bathrooms: '',
    parkingSpaces: '',
    description: ''
  })
  const [transactionForm, setTransactionForm] = useState<AddTransactionForm>({
    type: 'EXPENSE',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    propertyId: '',
    paymentMethod: 'CASH',
    reference: '',
    notes: '',
    recurring: false,
    recurringFrequency: 'MONTHLY',
    tags: [],
    taxCategory: '',
    paidBy: ''
  })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [overviewInsights, setOverviewInsights] = useState<string>('')
  const [propertiesInsights, setPropertiesInsights] = useState<string>('')
  const [transactionsInsights, setTransactionsInsights] = useState<string>('')
  const [reportsInsights, setReportsInsights] = useState<string>('')
  const [insightsLoading, setInsightsLoading] = useState(false)
  const { selectedTab, setSelectedTab } = useTabContext();
  const { data: session } = useSession();
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Fetch real data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  // On mount, fetch user profile for country
  useEffect(() => {
    async function fetchUserCountry() {
      if (session?.user?.id) {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setUserCountry(data.user?.country || null);
        if (!data.user?.country) setShowLocationModal(true);
      }
    }
    fetchUserCountry();
  }, [session?.user?.id]);

  // Handler to save country
  async function handleSaveCountry(newCountry: string) {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: newCountry }),
    });
    setUserCountry(newCountry);
    setShowLocationModal(false);
    // Optionally, refetch data to update tax mapping
    fetchData();
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch properties, transactions, notifications, and settings
      const [propertiesRes, transactionsRes, notificationsRes, settingsRes] = await Promise.all([
        fetch('/api/properties', { credentials: 'include' }),
        fetch('/api/transactions', { credentials: 'include' }),
        fetch('/api/notifications', { credentials: 'include' }),
        fetch('/api/settings', { credentials: 'include' })
      ])
      
      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json()
        setProperties(propertiesData)
      }
      
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData)
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json()
        setNotifications(notificationsData)
      }


    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isAtPropertyLimit) {
      setShowUpgradeModal(true)
      return
    }
    
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...propertyForm,
          purchasePrice: parseFloat(propertyForm.purchasePrice),
          units: parseInt(propertyForm.units),
          monthlyRent: propertyForm.monthlyRent ? parseFloat(propertyForm.monthlyRent) : undefined
        }),
        credentials: 'include',
      })

      if (response.ok) {
        const newProperty = await response.json()
        setProperties([...properties, newProperty])
        setShowAddPropertyModal(false)
        setPropertyForm({
          name: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US',
          propertyType: 'SINGLE_FAMILY',
          purchasePrice: '',
          purchaseDate: '',
          units: '1',
          monthlyRent: '',
          mortgageRate: '',
          mortgagePayment: '',
          propertyTax: '',
          insurance: '',
          hoaFees: '',
          estimatedValue: '',
          yearBuilt: '',
          squareFootage: '',
          bedrooms: '',
          bathrooms: '',
          parkingSpaces: '',
          description: ''
        })
      } else {
        const errorData = await response.json()
        if (errorData.upgradeRequired) {
          alert(`Subscription limit reached: ${errorData.message}`)
        } else {
          alert('Error adding property. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error adding property:', error)
      alert('Error adding property. Please try again.')
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isAtTransactionLimit) {
      setShowUpgradeModal(true)
      return
    }
    
    try {
      setUploading(true)
      let receiptUrl = ''

      // Upload receipt file if provided
      if (transactionForm.receiptFile) {
        const formData = new FormData()
        formData.append('file', transactionForm.receiptFile)
        formData.append('type', 'receipt')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          receiptUrl = uploadResult.url
        }
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transactionForm,
          amount: parseFloat(transactionForm.amount),
          receiptUrl
        }),
        credentials: 'include',
      })

      if (response.ok) {
        const newTransaction = await response.json()
        setTransactions([newTransaction, ...transactions])
        setShowAddTransactionModal(false)
        setTransactionForm({
          type: 'EXPENSE',
          amount: '',
          description: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          propertyId: '',
          paymentMethod: 'CASH',
          reference: '',
          notes: '',
          recurring: false,
          recurringFrequency: 'MONTHLY',
          tags: [],
          taxCategory: '',
          paidBy: ''
        })
      } else {
        const errorData = await response.json()
        if (errorData.upgradeRequired) {
          alert(`Subscription limit reached: ${errorData.message}`)
        } else {
          alert('Error adding transaction. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('Error adding transaction. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTransactionForm({
        ...transactionForm,
        receiptFile: e.target.files[0]
      })
    }
  }

  const generateReport = async (type: string) => {
    try {
      setReportLoading(true)
      const response = await fetch(`/api/reports?type=${type}`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
        setReportType(type)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setReportLoading(false)
    }
  }



  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId, read: true }),
        credentials: 'include',
      })
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const totalProperties = properties.length
  const totalUnits = properties.reduce((sum, prop) => sum + (prop.units || 0), 0)
  const occupiedUnits = properties.reduce((sum, prop) => sum + (prop.occupiedUnits || 0), 0)
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0
  const totalMonthlyRent = properties.reduce((sum, prop) => sum + (prop.monthlyRent || 0), 0)
  const totalValue = properties.reduce((sum, prop) => sum + (prop.purchasePrice || 0), 0)

  const monthlyIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const netIncome = monthlyIncome - monthlyExpenses

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success-600 bg-success-100'
      case 'maintenance': return 'text-warning-600 bg-warning-100'
      case 'vacant': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'INCOME': return <CurrencyDollarIcon className="h-5 w-5 text-success-500" />
      case 'EXPENSE': return <DocumentTextIcon className="h-5 w-5 text-red-500" />
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />
    }
  }

  // Helper to check free tier limits
  const isAtPropertyLimit = properties.length >= 1
  const isAtTransactionLimit = transactions.length >= 10

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property)
    setShowEditPropertyModal(true)
  }

  const handlePropertyUpdate = (updatedProperty: Property) => {
    setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p))
    setShowEditPropertyModal(false)
    setSelectedProperty(null)
  }

  const handlePropertyDelete = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId))
    setShowEditPropertyModal(false)
    setSelectedProperty(null)
  }

  const generateOverviewInsights = async () => {
    setInsightsLoading(true)
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode: 'overview_analysis',
          properties: properties,
          transactions: transactions,
          summary: {
            totalProperties: properties.length,
            totalIncome: transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0),
            totalExpenses: transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0),
            monthlyIncome: properties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0),
            occupancyRate: properties.length > 0 ? (properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0) / properties.reduce((sum, p) => sum + (p.units || 1), 0)) * 100 : 0
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setOverviewInsights(data.result)
      } else {
        console.error('AI analysis failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setInsightsLoading(false)
    }
  }

  const generateTransactionsInsights = async () => {
    setInsightsLoading(true)
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode: 'transaction_analysis',
          transactions: transactions,
          properties: properties,
          summary: {
            totalTransactions: transactions.length,
            totalIncome: transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0),
            totalExpenses: transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0),
            averageTransaction: transactions.length > 0 ? transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) / transactions.length : 0,
            topCategories: Object.entries(
              transactions.reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + Math.abs(Number(t.amount))
                return acc
              }, {} as Record<string, number>)
            ).sort(([,a], [,b]) => b - a).slice(0, 5)
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setTransactionsInsights(data.result)
      }
    } catch (error) {
      console.error('Error generating transaction insights:', error)
    } finally {
      setInsightsLoading(false)
    }
  }

  const generateReportsInsights = async () => {
    setInsightsLoading(true)
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode: 'report_analysis',
          properties: properties,
          transactions: transactions,
          reportData: reportData,
          summary: {
            totalProperties: properties.length,
            totalTransactions: transactions.length,
            totalIncome: transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0),
            totalExpenses: transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0),
            monthlyIncome: properties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0),
            netIncome: transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0) - 
                      transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0)
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setReportsInsights(data.result)
      }
    } catch (error) {
      console.error('Error generating report insights:', error)
    } finally {
      setInsightsLoading(false)
    }
  }

  const generatePropertiesInsights = async () => {
    setInsightsLoading(true)
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode: 'property_analysis',
          properties: properties,
          transactions: transactions.filter(t => t.propertyId),
          summary: {
            totalProperties: properties.length,
            averageRent: properties.length > 0 ? properties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0) / properties.length : 0,
            totalValue: properties.reduce((sum, p) => sum + (p.estimatedValue || 0), 0),
            occupancyRate: properties.length > 0 ? (properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0) / properties.reduce((sum, p) => sum + (p.units || 1), 0)) * 100 : 0
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setPropertiesInsights(data.result)
      }
    } catch (error) {
      console.error('Error generating property insights:', error)
    } finally {
      setInsightsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Onboarding UI logic
  if (showLocationModal || !userCountry) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Welcome! Select your country to get started</h2>
          <select
            className="w-full border rounded p-2 mb-4"
            value={userCountry || ''}
            onChange={e => setUserCountry(e.target.value)}
          >
            <option value="">Select country...</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            {/* Add more countries as needed */}
          </select>
          <button
            className="btn-primary w-full"
            disabled={!userCountry}
            onClick={() => userCountry && handleSaveCountry(userCountry)}
          >
            Save & Continue
          </button>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Add your first property</h2>
        <p className="mb-6 text-gray-600">Start by uploading details of your first property. This unlocks transaction tracking and tax insights.</p>
        <button className="btn-primary" onClick={() => setShowAddPropertyModal(true)}>
          Add Property
        </button>
        <PropertyEditModal 
          property={null}
          isOpen={showAddPropertyModal}
          onClose={() => setShowAddPropertyModal(false)}
          onSave={() => { setShowAddPropertyModal(false); fetchData(); }}
          onDelete={() => {}}
        />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Add your first transaction</h2>
        <p className="mb-6 text-gray-600">Upload income or expense transactions for your property. Transactions are automatically categorized for tax based on your location.</p>
        <button className="btn-primary" onClick={() => setShowAddTransactionModal(true)}>
          Add Transaction
        </button>
        {/* AddTransactionModal should be rendered here if you have one */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <HomeIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">PropertyBooks.io</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowNotificationsModal(true)}
                className="p-2 text-gray-400 hover:text-gray-500 relative"
              >
                <BellIcon className="h-6 w-6" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <Menu as="div" className="relative">
                <Menu.Button as="div">
                  <UserAvatar name={"David"} size={32} onClick={() => setShowSettingsModal(true)} />
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">David</p>
                      <p className="text-xs text-gray-500">david@example.com</p>
                    </div>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/pricing"
                          className={`flex items-center px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                        >
                          <CogIcon className="h-4 w-4 mr-3" />
                          Pricing & Plans
                        </Link>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={async () => {
                            try {
                              // Clear any local storage or session storage
                              localStorage.clear()
                              sessionStorage.clear()
                              
                              // Sign out with NextAuth
                              await signOut({ 
                                callbackUrl: '/',
                                redirect: false 
                              })
                              
                              // Force a complete page reload to clear all cached data
                              window.location.reload()
                            } catch (error) {
                              console.error('Logout error:', error)
                              // Force redirect to home page with reload
                              window.location.href = '/'
                              window.location.reload()
                            }
                          }}
                          className={`flex items-center w-full text-left px-4 py-2 text-sm text-red-600 ${active ? 'bg-gray-100' : ''}`}
                        >
                          <UserIcon className="h-4 w-4 mr-3" />
                          Log Out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your properties.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg">
                <HomeIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Properties</p>
                <p className="text-2xl font-bold text-gray-900">{totalProperties}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="bg-success-100 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{occupancyRate.toFixed(1)}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="bg-warning-100 p-3 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyIncome)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="bg-info-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-info-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                  {formatCurrency(netIncome)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Properties */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Properties</h2>
                <button 
                  onClick={() => setShowAddPropertyModal(true)}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Property
                </button>
              </div>
              
              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first property</p>
                  <button 
                    onClick={() => setShowAddPropertyModal(true)}
                    className="btn-primary"
                  >
                    Add Your First Property
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.slice(0, 6).map((property) => (
                    <div key={property.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status || 'active')}`}>
                            {property.status || 'active'}
                          </span>
                          <button
                            onClick={() => handleEditProperty(property)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Edit Property"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{property.address}</p>
                      <p className="text-gray-600 mb-4">{property.city}, {property.state} {property.zipCode}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Monthly Rent</span>
                        <span className="font-medium">{formatCurrency(property.monthlyRent || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* AI Portfolio Insights */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">AI Portfolio Insights</h2>
                </div>
                <button 
                  onClick={generateOverviewInsights}
                  disabled={insightsLoading}
                  className="btn-primary flex items-center"
                >
                  {insightsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Get Insights
                    </>
                  )}
                </button>
              </div>
              
              {!overviewInsights ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Portfolio Analysis</h3>
                  <p className="text-gray-600 mb-4">Get intelligent insights about your portfolio performance, trends, and recommendations</p>
                  <button 
                    onClick={generateOverviewInsights}
                    disabled={insightsLoading}
                    className="btn-primary"
                  >
                    Generate AI Insights
                  </button>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-blue-900">AI Analysis</h3>
                  </div>
                  <div className="prose prose-blue max-w-none">
                    <div className="whitespace-pre-wrap text-blue-800 leading-relaxed">
                      {overviewInsights}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Recent Transactions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                <button 
                  onClick={() => setShowAddTransactionModal(true)}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Transaction
                </button>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                  <p className="text-gray-600">Start tracking your income and expenses</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.type)}
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${transaction.amount > 0 ? 'text-success-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{transaction.type.toLowerCase()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {selectedTab === 'properties' && (
          <div className="space-y-6">
            {/* AI Property Insights */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">AI Property Analysis</h2>
                </div>
                <button 
                  onClick={generatePropertiesInsights}
                  disabled={insightsLoading}
                  className="btn-primary flex items-center"
                >
                  {insightsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analyze Properties
                    </>
                  )}
                </button>
              </div>
              
              {!propertiesInsights ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏠</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Property Performance Analysis</h3>
                  <p className="text-gray-600 mb-4">Get AI-powered insights about your property performance, market analysis, and optimization recommendations</p>
                  <button 
                    onClick={generatePropertiesInsights}
                    disabled={insightsLoading}
                    className="btn-primary"
                  >
                    Analyze Properties
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-green-900">Property Analysis</h3>
                  </div>
                  <div className="prose prose-green max-w-none">
                    <div className="whitespace-pre-wrap text-green-800 leading-relaxed">
                      {propertiesInsights}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Properties List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">All Properties</h2>
                <button 
                  onClick={() => setShowAddPropertyModal(true)}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Property
                </button>
              </div>
            
            {properties.length === 0 ? (
              <div className="text-center py-12">
                <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first property</p>
                <button 
                  onClick={() => setShowAddPropertyModal(true)}
                  className="btn-primary"
                >
                  Add Your First Property
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Rent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {properties.map((property) => (
                      <tr key={property.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{property.name}</div>
                            <div className="text-sm text-gray-500">{property.address}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {property.propertyType.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(property.purchasePrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(property.monthlyRent || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
        )}

        {selectedTab === 'transactions' && (
          <div className="space-y-6">
            {/* AI Transaction Insights */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">AI Transaction Analysis</h2>
                </div>
                <button 
                  onClick={generateTransactionsInsights}
                  disabled={insightsLoading}
                  className="btn-primary flex items-center"
                >
                  {insightsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analyze Transactions
                    </>
                  )}
                </button>
              </div>
              
              {!transactionsInsights ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💳</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction Pattern Analysis</h3>
                  <p className="text-gray-600 mb-4">Get AI-powered insights about your spending patterns, income trends, and financial optimization</p>
                  <button 
                    onClick={generateTransactionsInsights}
                    disabled={insightsLoading}
                    className="btn-primary"
                  >
                    Analyze Transactions
                  </button>
                </div>
              ) : (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-purple-900">Transaction Analysis</h3>
                  </div>
                  <div className="prose prose-purple max-w-none">
                    <div className="whitespace-pre-wrap text-purple-800 leading-relaxed">
                      {transactionsInsights}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Transactions List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">All Transactions</h2>
                <button 
                  onClick={() => setShowAddTransactionModal(true)}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Transaction
                </button>
              </div>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-600 mb-4">Start tracking your income and expenses</p>
                <button 
                  onClick={() => setShowAddTransactionModal(true)}
                  className="btn-primary"
                >
                  Add Your First Transaction
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{transaction.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTransactionIcon(transaction.type)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">
                              {transaction.type.toLowerCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.amount > 0 ? 'text-success-600' : 'text-red-600'}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.receiptUrl ? (
                            <a 
                              href={transaction.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
        )}

        {selectedTab === 'reports' && (
          <div className="space-y-6">
            {/* AI Report Insights */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-2 rounded-lg mr-3">
                    <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">AI Financial Analysis</h2>
                </div>
                <button 
                  onClick={generateReportsInsights}
                  disabled={insightsLoading}
                  className="btn-primary flex items-center"
                >
                  {insightsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analyze Reports
                    </>
                  )}
                </button>
              </div>
              
              {!reportsInsights ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Performance Analysis</h3>
                  <p className="text-gray-600 mb-4">Get AI-powered insights about your financial performance, trends, and optimization opportunities</p>
                  <button 
                    onClick={generateReportsInsights}
                    disabled={insightsLoading}
                    className="btn-primary"
                  >
                    Analyze Financial Data
                  </button>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <svg className="h-5 w-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-orange-900">Financial Analysis</h3>
                  </div>
                  <div className="prose prose-orange max-w-none">
                    <div className="whitespace-pre-wrap text-orange-800 leading-relaxed">
                      {reportsInsights}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Reports List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Reports</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <button 
                  onClick={() => generateReport('income-statement')}
                  disabled={reportLoading}
                  className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200 disabled:opacity-50"
                >
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Income Statement</h3>
                  <p className="text-gray-600">Monthly and annual income reports</p>
                </button>
                
                <button 
                  onClick={() => generateReport('cash-flow')}
                  disabled={reportLoading}
                  className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200 disabled:opacity-50"
                >
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash Flow</h3>
                  <p className="text-gray-600">Track money in and out</p>
                </button>
                
                <button 
                  onClick={() => generateReport('tax-summary')}
                  disabled={reportLoading}
                  className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200 disabled:opacity-50"
                >
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Summary</h3>
                  <p className="text-gray-600">Year-end tax documentation</p>
                </button>

                <button 
                  onClick={() => generateReport('property-performance')}
                  disabled={reportLoading}
                  className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200 disabled:opacity-50"
                >
                  <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Performance</h3>
                  <p className="text-gray-600">Individual property analysis</p>
                </button>
              </div>

              {reportLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Generating report...</p>
                </div>
              )}

              {reportData && !reportLoading && (
                <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {reportType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Report
                  </h3>
                  
                  {reportData.summary && (
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      {Object.entries(reportData.summary).map(([key, value]) => (
                        <div key={key} className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {typeof value === 'number' ? formatCurrency(value) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {reportData.expenseByCategory && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Expenses by Category</h4>
                      <div className="space-y-2">
                        {Object.entries(reportData.expenseByCategory).map(([category, amount]) => (
                          <div key={category} className="flex justify-between items-center bg-white p-3 rounded">
                            <span className="text-gray-700">{category}</span>
                            <span className="font-semibold text-red-600">{formatCurrency(amount as number)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {reportData.properties && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Property Performance</h4>
                      <div className="space-y-3">
                        {reportData.properties.map((property: any) => (
                          <div key={property.id} className="bg-white p-4 rounded-lg">
                            <h5 className="font-semibold text-gray-900 mb-2">{property.name}</h5>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Income:</span>
                                <span className="ml-2 font-semibold text-success-600">{formatCurrency(property.income)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Expenses:</span>
                                <span className="ml-2 font-semibold text-red-600">{formatCurrency(property.expenses)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Net:</span>
                                <span className={`ml-2 font-semibold ${property.net >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                                  {formatCurrency(property.net)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {selectedTab === 'taxes' && (
          <TaxInsightsPage />
        )}

        {selectedTab === 'financial-reports' && (
          <FinancialReports />
        )}
      </div>

      {/* Add Property Modal */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-xl rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Add New Property</h3>
                  <p className="text-gray-600 mt-1">Enter comprehensive property details for better tracking and reporting</p>
                </div>
                <button
                  onClick={() => setShowAddPropertyModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddProperty} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Downtown Apartment Complex"
                        value={propertyForm.name}
                        onChange={(e) => setPropertyForm({...propertyForm, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                      <select
                        value={propertyForm.propertyType}
                        onChange={(e) => setPropertyForm({...propertyForm, propertyType: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="SINGLE_FAMILY">Single Family Home</option>
                        <option value="MULTI_FAMILY">Multi-Family</option>
                        <option value="CONDO">Condominium</option>
                        <option value="TOWNHOUSE">Townhouse</option>
                        <option value="COMMERCIAL">Commercial</option>
                        <option value="LAND">Land</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Location</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <select
                        value={propertyForm.country}
                        onChange={(e) => setPropertyForm({...propertyForm, country: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="123 Main Street"
                        value={propertyForm.address}
                        onChange={(e) => setPropertyForm({...propertyForm, address: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        placeholder="New York"
                        value={propertyForm.city}
                        onChange={(e) => setPropertyForm({...propertyForm, city: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State/Province *</label>
                      <input
                        type="text"
                        required
                        placeholder="NY"
                        value={propertyForm.state}
                        onChange={(e) => setPropertyForm({...propertyForm, state: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="10001"
                        value={propertyForm.zipCode}
                        onChange={(e) => setPropertyForm({...propertyForm, zipCode: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          required
                          placeholder="500,000"
                          value={propertyForm.purchasePrice}
                          onChange={(e) => setPropertyForm({...propertyForm, purchasePrice: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
                      <input
                        type="date"
                        required
                        value={propertyForm.purchaseDate}
                        onChange={(e) => setPropertyForm({...propertyForm, purchaseDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Current Value</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          placeholder="550,000"
                          value={propertyForm.estimatedValue}
                          onChange={(e) => setPropertyForm({...propertyForm, estimatedValue: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          placeholder="3,500"
                          value={propertyForm.monthlyRent}
                          onChange={(e) => setPropertyForm({...propertyForm, monthlyRent: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="3.5"
                        value={propertyForm.mortgageRate}
                        onChange={(e) => setPropertyForm({...propertyForm, mortgageRate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Mortgage Payment</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          placeholder="2,200"
                          value={propertyForm.mortgagePayment}
                          onChange={(e) => setPropertyForm({...propertyForm, mortgagePayment: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Annual Property Tax</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          placeholder="6,000"
                          value={propertyForm.propertyTax}
                          onChange={(e) => setPropertyForm({...propertyForm, propertyTax: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Annual Insurance</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          placeholder="1,200"
                          value={propertyForm.insurance}
                          onChange={(e) => setPropertyForm({...propertyForm, insurance: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly HOA Fees</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          placeholder="200"
                          value={propertyForm.hoaFees}
                          onChange={(e) => setPropertyForm({...propertyForm, hoaFees: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Units</label>
                      <input
                        type="number"
                        placeholder="1"
                        value={propertyForm.units}
                        onChange={(e) => setPropertyForm({...propertyForm, units: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                      <input
                        type="number"
                        placeholder="1990"
                        value={propertyForm.yearBuilt}
                        onChange={(e) => setPropertyForm({...propertyForm, yearBuilt: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
                      <input
                        type="number"
                        placeholder="2,000"
                        value={propertyForm.squareFootage}
                        onChange={(e) => setPropertyForm({...propertyForm, squareFootage: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                      <input
                        type="number"
                        placeholder="3"
                        value={propertyForm.bedrooms}
                        onChange={(e) => setPropertyForm({...propertyForm, bedrooms: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="2.5"
                        value={propertyForm.bathrooms}
                        onChange={(e) => setPropertyForm({...propertyForm, bathrooms: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parking Spaces</label>
                      <input
                        type="number"
                        placeholder="2"
                        value={propertyForm.parkingSpaces}
                        onChange={(e) => setPropertyForm({...propertyForm, parkingSpaces: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      placeholder="Additional notes about the property..."
                      value={propertyForm.description}
                      onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddPropertyModal(false)}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Add Property
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-3xl shadow-xl rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Add New Transaction</h3>
                  <p className="text-gray-600 mt-1">Track your income and expenses with detailed information</p>
                </div>
                <button
                  onClick={() => setShowAddTransactionModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddTransaction} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type *</label>
                      <select
                        value={transactionForm.type}
                        onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value as 'INCOME' | 'EXPENSE'})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="EXPENSE">Expense</option>
                        <option value="INCOME">Income</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="0.00"
                          value={transactionForm.amount}
                          onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input
                        type="date"
                        required
                        value={transactionForm.date}
                        onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        value={transactionForm.paymentMethod}
                        onChange={(e) => setTransactionForm({...transactionForm, paymentMethod: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="CASH">Cash</option>
                        <option value="CHECK">Check</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="CREDIT_CARD">Credit Card</option>
                        <option value="DEBIT_CARD">Debit Card</option>
                        <option value="PAYPAL">PayPal</option>
                        <option value="VENMO">Venmo</option>
                        <option value="ZELLE">Zelle</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description and Category */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Description & Category</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Monthly rent payment"
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        value={transactionForm.category}
                        onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="">Select Category</option>
                        <optgroup label="Income">
                          <option value="Rent">Rent</option>
                          <option value="Deposit">Security Deposit</option>
                          <option value="Late Fees">Late Fees</option>
                          <option value="Pet Fees">Pet Fees</option>
                          <option value="Other Income">Other Income</option>
                        </optgroup>
                        <optgroup label="Expenses">
                          <option value="Utilities">Utilities</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Repairs">Repairs</option>
                          <option value="Insurance">Insurance</option>
                          <option value="Property Tax">Property Tax</option>
                          <option value="HOA Fees">HOA Fees</option>
                          <option value="Property Management">Property Management</option>
                          <option value="Advertising">Advertising</option>
                          <option value="Legal Fees">Legal Fees</option>
                          <option value="Accounting Fees">Accounting Fees</option>
                          <option value="Mortgage Payment">Mortgage Payment</option>
                          <option value="Other">Other</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tax Category and Payment Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Tax & Payment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Category (CRA)</label>
                      <select
                        value={transactionForm.taxCategory || ''}
                        onChange={(e) => setTransactionForm({...transactionForm, taxCategory: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="">Select Tax Category</option>
                        <option value="Advertising">Advertising</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Interest & Bank Charges">Interest & Bank Charges</option>
                        <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                        <option value="Management & Administration Fees">Management & Administration Fees</option>
                        <option value="Motor Vehicle">Motor Vehicle</option>
                        <option value="Office Expenses">Office Expenses</option>
                        <option value="Professional Fees">Professional Fees</option>
                        <option value="Property Taxes">Property Taxes</option>
                        <option value="Salaries, Wages & Benefits">Salaries, Wages & Benefits</option>
                        <option value="Travel">Travel</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Other Expenses">Other Expenses</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Paid By</label>
                      <input
                        type="text"
                        placeholder="e.g., David, Ryan, Property Management"
                        value={transactionForm.paidBy || ''}
                        onChange={(e) => setTransactionForm({...transactionForm, paidBy: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Property and Reference */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Property & Reference</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property (Optional)</label>
                      <select
                        value={transactionForm.propertyId}
                        onChange={(e) => setTransactionForm({...transactionForm, propertyId: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="">No Specific Property</option>
                        {properties.map((property) => (
                          <option key={property.id} value={property.id}>
                            {property.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                      <input
                        type="text"
                        placeholder="e.g., Check #1234, Invoice #ABC123"
                        value={transactionForm.reference}
                        onChange={(e) => setTransactionForm({...transactionForm, reference: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Recurring Transaction */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Recurring Transaction</h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="recurring"
                        checked={transactionForm.recurring}
                        onChange={(e) => setTransactionForm({...transactionForm, recurring: e.target.checked})}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="recurring" className="ml-2 block text-sm text-gray-900">
                        This is a recurring transaction
                      </label>
                    </div>
                    
                    {transactionForm.recurring && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <select
                          value={transactionForm.recurringFrequency}
                          onChange={(e) => setTransactionForm({...transactionForm, recurringFrequency: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        >
                          <option value="WEEKLY">Weekly</option>
                          <option value="MONTHLY">Monthly</option>
                          <option value="QUARTERLY">Quarterly</option>
                          <option value="YEARLY">Yearly</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Receipt Upload */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Receipt & Notes</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (Optional)</label>
                      <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                        <div className="space-y-1 text-center">
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="receipt-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="receipt-upload"
                                name="receipt-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="sr-only"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                      {transactionForm.receiptFile && (
                        <p className="mt-2 text-sm text-gray-600">
                          Selected: {transactionForm.receiptFile.name}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        placeholder="Additional notes about this transaction..."
                        value={transactionForm.notes}
                        onChange={(e) => setTransactionForm({...transactionForm, notes: e.target.value})}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddTransactionModal(false)}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-3 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                  >
                    {uploading ? 'Adding...' : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}



      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg border ${
                        notification.read ? 'bg-gray-50 border-gray-200' : 'bg-white border-primary-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.date).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="ml-2 text-xs text-primary-600 hover:text-primary-800"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Modal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="Upgrade Required">
        <p className="mb-4">You've reached the free tier limit. Upgrade to add more properties, transactions, or documents.</p>
        <a href="/pricing" className="btn-primary w-full block text-center">See Pricing & Upgrade</a>
      </Modal>

      {/* Property Edit Modal */}
      <PropertyEditModal
        property={selectedProperty}
        isOpen={showEditPropertyModal}
        onClose={() => {
          setShowEditPropertyModal(false)
          setSelectedProperty(null)
        }}
        onSave={handlePropertyUpdate}
        onDelete={handlePropertyDelete}
      />
      <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <SidebarNavigation onOpenSettingsModal={() => setShowSettingsModal(true)} />
      <Navigation showSettingsModal={showSettingsModal} />
    </div>
  )
} 