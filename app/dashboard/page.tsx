'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  XMarkIcon
} from '@heroicons/react/24/outline'
import AIAnalysisPanel from '../../components/ai/AIAnalysisPanel'

interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  propertyType: string
  purchasePrice: number
  purchaseDate: string
  units?: number
  occupiedUnits?: number
  monthlyRent?: number
  totalValue?: number
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
  propertyType: string
  purchasePrice: string
  purchaseDate: string
  units: string
  monthlyRent: string
}

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [propertyForm, setPropertyForm] = useState<AddPropertyForm>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'SINGLE_FAMILY',
    purchasePrice: '',
    purchaseDate: '',
    units: '1',
    monthlyRent: ''
  })

  // Fetch real data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch properties and transactions from your API
      const [propertiesRes, transactionsRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/transactions')
      ])
      
      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json()
        setProperties(propertiesData)
      }
      
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
          propertyType: 'SINGLE_FAMILY',
          purchasePrice: '',
          purchaseDate: '',
          units: '1',
          monthlyRent: ''
        })
      }
    } catch (error) {
      console.error('Error adding property:', error)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <HomeIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">PropertyBooks.io</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <CogIcon className="h-6 w-6" />
              </button>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
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

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {['overview', 'properties', 'transactions', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  selectedTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status || 'active')}`}>
                          {property.status || 'active'}
                        </span>
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

            {/* Recent Transactions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                <button className="btn-primary flex items-center">
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
        )}

        {selectedTab === 'transactions' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">All Transactions</h2>
              <button className="btn-primary flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Transaction
              </button>
            </div>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-600 mb-4">Start tracking your income and expenses</p>
                <button className="btn-primary">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'reports' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Reports</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Income Statement</h3>
                  <p className="text-gray-600">Monthly and annual income reports</p>
                </button>
                
                <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash Flow</h3>
                  <p className="text-gray-600">Track money in and out</p>
                </button>
                
                <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Reports</h3>
                  <p className="text-gray-600">Year-end tax documentation</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}
        <AIAnalysisPanel />
      </div>

      {/* Add Property Modal */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Property</h3>
                <button
                  onClick={() => setShowAddPropertyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddProperty} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Name</label>
                  <input
                    type="text"
                    required
                    value={propertyForm.name}
                    onChange={(e) => setPropertyForm({...propertyForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    required
                    value={propertyForm.address}
                    onChange={(e) => setPropertyForm({...propertyForm, address: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      required
                      value={propertyForm.city}
                      onChange={(e) => setPropertyForm({...propertyForm, city: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      required
                      value={propertyForm.state}
                      onChange={(e) => setPropertyForm({...propertyForm, state: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZIP</label>
                    <input
                      type="text"
                      required
                      value={propertyForm.zipCode}
                      onChange={(e) => setPropertyForm({...propertyForm, zipCode: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Type</label>
                  <select
                    value={propertyForm.propertyType}
                    onChange={(e) => setPropertyForm({...propertyForm, propertyType: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="SINGLE_FAMILY">Single Family</option>
                    <option value="MULTI_FAMILY">Multi Family</option>
                    <option value="CONDO">Condo</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="LAND">Land</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
                    <input
                      type="number"
                      required
                      value={propertyForm.purchasePrice}
                      onChange={(e) => setPropertyForm({...propertyForm, purchasePrice: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                    <input
                      type="date"
                      required
                      value={propertyForm.purchaseDate}
                      onChange={(e) => setPropertyForm({...propertyForm, purchaseDate: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Units</label>
                    <input
                      type="number"
                      value={propertyForm.units}
                      onChange={(e) => setPropertyForm({...propertyForm, units: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
                    <input
                      type="number"
                      value={propertyForm.monthlyRent}
                      onChange={(e) => setPropertyForm({...propertyForm, monthlyRent: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddPropertyModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Add Property
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 