'use client'

import React, { useState } from 'react'
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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface Property {
  id: string
  name: string
  address: string
  units: number
  occupiedUnits: number
  monthlyRent: number
  totalValue: number
  status: 'active' | 'maintenance' | 'vacant'
}

interface Transaction {
  id: string
  propertyId: string
  type: 'rent' | 'expense' | 'late_fee'
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending' | 'overdue'
}

const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Sunset Apartments',
    address: '123 Main St, City, State',
    units: 8,
    occupiedUnits: 7,
    monthlyRent: 12000,
    totalValue: 850000,
    status: 'active'
  },
  {
    id: '2',
    name: 'Downtown Lofts',
    address: '456 Oak Ave, City, State',
    units: 4,
    occupiedUnits: 3,
    monthlyRent: 8000,
    totalValue: 650000,
    status: 'maintenance'
  }
]

const mockTransactions: Transaction[] = [
  {
    id: '1',
    propertyId: '1',
    type: 'rent',
    amount: 1500,
    description: 'Unit 1A - January Rent',
    date: '2024-01-01',
    status: 'completed'
  },
  {
    id: '2',
    propertyId: '1',
    type: 'expense',
    amount: -250,
    description: 'Plumbing repair - Unit 2B',
    date: '2024-01-05',
    status: 'completed'
  },
  {
    id: '3',
    propertyId: '2',
    type: 'rent',
    amount: 2000,
    description: 'Unit 1 - January Rent',
    date: '2024-01-01',
    status: 'overdue'
  }
]

export default function Dashboard() {
  const [properties] = useState<Property[]>(mockProperties)
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [selectedTab, setSelectedTab] = useState('overview')

  const totalProperties = properties.length
  const totalUnits = properties.reduce((sum, prop) => sum + prop.units, 0)
  const occupiedUnits = properties.reduce((sum, prop) => sum + prop.occupiedUnits, 0)
  const occupancyRate = (occupiedUnits / totalUnits) * 100
  const totalMonthlyRent = properties.reduce((sum, prop) => sum + prop.monthlyRent, 0)
  const totalValue = properties.reduce((sum, prop) => sum + prop.totalValue, 0)

  const monthlyIncome = transactions
    .filter(t => t.type === 'rent' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
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
      case 'rent': return <CurrencyDollarIcon className="h-5 w-5 text-success-500" />
      case 'expense': return <DocumentTextIcon className="h-5 w-5 text-red-500" />
      case 'late_fee': return <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />
    }
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
              <div className="bg-red-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(netIncome)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                { id: 'properties', name: 'Properties', icon: HomeIcon },
                { id: 'transactions', name: 'Transactions', icon: DocumentTextIcon },
                { id: 'reports', name: 'Reports', icon: DocumentTextIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    selectedTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Properties Overview */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Properties</h2>
                <button className="btn-primary flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Property
                </button>
              </div>
              
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{property.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                        {property.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {property.occupiedUnits}/{property.units} units occupied
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(property.monthlyRent)}/month
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                <button className="text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      {getTransactionIcon(transaction.type)}
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 ? 'text-success-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'completed' ? 'bg-success-100 text-success-600' :
                        transaction.status === 'pending' ? 'bg-warning-100 text-warning-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
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
              <button className="btn-primary flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Property
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Rent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                        {property.occupiedUnits}/{property.units}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(property.monthlyRent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(property.totalValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                          {property.status}
                        </span>
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
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                        {properties.find(p => p.id === transaction.propertyId)?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.type)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {transaction.type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.amount > 0 ? 'text-success-600' : 'text-red-600'}>
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' ? 'bg-success-100 text-success-600' :
                          transaction.status === 'pending' ? 'bg-warning-100 text-warning-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
      </div>
    </div>
  )
} 