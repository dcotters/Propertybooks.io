export interface Property {
  id: string
  name: string
  address: string
  units: number
  occupiedUnits: number
  monthlyRent: number
  totalValue: number
  status: 'active' | 'maintenance' | 'vacant'
  propertyType: 'apartment' | 'house' | 'condo' | 'commercial'
  yearBuilt: number
  squareFootage: number
  amenities: string[]
}

export interface Tenant {
  id: string
  propertyId: string
  unitNumber: string
  name: string
  email: string
  phone: string
  rentAmount: number
  leaseStart: string
  leaseEnd: string
  status: 'active' | 'overdue' | 'vacating' | 'evicted'
  paymentHistory: Payment[]
}

export interface Payment {
  id: string
  tenantId: string
  amount: number
  date: string
  type: 'rent' | 'late_fee' | 'deposit' | 'other'
  status: 'completed' | 'pending' | 'failed'
}

export interface Transaction {
  id: string
  propertyId: string
  type: 'rent' | 'expense' | 'late_fee' | 'deposit'
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending' | 'overdue'
  category: string
  receipt?: string
}

export interface Expense {
  id: string
  propertyId: string
  amount: number
  description: string
  date: string
  category: 'maintenance' | 'utilities' | 'insurance' | 'taxes' | 'repairs' | 'other'
  status: 'paid' | 'pending' | 'overdue'
  receipt?: string
}

// Demo Properties
export const demoProperties: Property[] = [
  {
    id: '1',
    name: 'Sunset Apartments',
    address: '123 Main St, Downtown, CA 90210',
    units: 8,
    occupiedUnits: 7,
    monthlyRent: 12000,
    totalValue: 850000,
    status: 'active',
    propertyType: 'apartment',
    yearBuilt: 1995,
    squareFootage: 8000,
    amenities: ['Parking', 'Laundry', 'Gym', 'Pool']
  },
  {
    id: '2',
    name: 'Downtown Lofts',
    address: '456 Oak Ave, Midtown, CA 90211',
    units: 4,
    occupiedUnits: 3,
    monthlyRent: 8000,
    totalValue: 650000,
    status: 'maintenance',
    propertyType: 'condo',
    yearBuilt: 2010,
    squareFootage: 4000,
    amenities: ['Parking', 'Balcony', 'Modern Appliances']
  },
  {
    id: '3',
    name: 'Riverside Houses',
    address: '789 River Rd, Suburbs, CA 90212',
    units: 3,
    occupiedUnits: 2,
    monthlyRent: 6000,
    totalValue: 750000,
    status: 'active',
    propertyType: 'house',
    yearBuilt: 1980,
    squareFootage: 4500,
    amenities: ['Backyard', 'Garage', 'Fireplace']
  }
]

// Demo Tenants
export const demoTenants: Tenant[] = [
  {
    id: '1',
    propertyId: '1',
    unitNumber: '1A',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    rentAmount: 1500,
    leaseStart: '2023-01-01',
    leaseEnd: '2024-12-31',
    status: 'active',
    paymentHistory: [
      {
        id: 'p1',
        tenantId: '1',
        amount: 1500,
        date: '2024-01-01',
        type: 'rent',
        status: 'completed'
      }
    ]
  },
  {
    id: '2',
    propertyId: '1',
    unitNumber: '2B',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 234-5678',
    rentAmount: 1600,
    leaseStart: '2023-03-01',
    leaseEnd: '2024-02-28',
    status: 'overdue',
    paymentHistory: [
      {
        id: 'p2',
        tenantId: '2',
        amount: 1600,
        date: '2024-01-01',
        type: 'rent',
        status: 'pending'
      }
    ]
  },
  {
    id: '3',
    propertyId: '2',
    unitNumber: '1',
    name: 'Mike Davis',
    email: 'mike.davis@email.com',
    phone: '(555) 345-6789',
    rentAmount: 2000,
    leaseStart: '2023-06-01',
    leaseEnd: '2024-05-31',
    status: 'active',
    paymentHistory: [
      {
        id: 'p3',
        tenantId: '3',
        amount: 2000,
        date: '2024-01-01',
        type: 'rent',
        status: 'completed'
      }
    ]
  }
]

// Demo Transactions
export const demoTransactions: Transaction[] = [
  {
    id: '1',
    propertyId: '1',
    type: 'rent',
    amount: 1500,
    description: 'Unit 1A - January Rent',
    date: '2024-01-01',
    status: 'completed',
    category: 'rent'
  },
  {
    id: '2',
    propertyId: '1',
    type: 'expense',
    amount: -250,
    description: 'Plumbing repair - Unit 2B',
    date: '2024-01-05',
    status: 'completed',
    category: 'maintenance'
  },
  {
    id: '3',
    propertyId: '2',
    type: 'rent',
    amount: 2000,
    description: 'Unit 1 - January Rent',
    date: '2024-01-01',
    status: 'overdue',
    category: 'rent'
  },
  {
    id: '4',
    propertyId: '1',
    type: 'rent',
    amount: 1600,
    description: 'Unit 2B - January Rent',
    date: '2024-01-01',
    status: 'pending',
    category: 'rent'
  },
  {
    id: '5',
    propertyId: '3',
    type: 'rent',
    amount: 2000,
    description: 'Unit 1 - January Rent',
    date: '2024-01-01',
    status: 'completed',
    category: 'rent'
  },
  {
    id: '6',
    propertyId: '2',
    type: 'expense',
    amount: -500,
    description: 'HVAC maintenance',
    date: '2024-01-10',
    status: 'completed',
    category: 'maintenance'
  }
]

// Demo Expenses
export const demoExpenses: Expense[] = [
  {
    id: '1',
    propertyId: '1',
    amount: 250,
    description: 'Plumbing repair - Unit 2B',
    date: '2024-01-05',
    category: 'maintenance',
    status: 'paid'
  },
  {
    id: '2',
    propertyId: '2',
    amount: 500,
    description: 'HVAC maintenance',
    date: '2024-01-10',
    category: 'maintenance',
    status: 'paid'
  },
  {
    id: '3',
    propertyId: '1',
    amount: 1200,
    description: 'Property insurance - Q1 2024',
    date: '2024-01-15',
    category: 'insurance',
    status: 'pending'
  },
  {
    id: '4',
    propertyId: '3',
    amount: 800,
    description: 'Property taxes',
    date: '2024-01-20',
    category: 'taxes',
    status: 'paid'
  }
]

// Analytics Data
export const getAnalyticsData = () => {
  const totalProperties = demoProperties.length
  const totalUnits = demoProperties.reduce((sum, prop) => sum + prop.units, 0)
  const occupiedUnits = demoProperties.reduce((sum, prop) => sum + prop.occupiedUnits, 0)
  const occupancyRate = (occupiedUnits / totalUnits) * 100
  const totalMonthlyRent = demoProperties.reduce((sum, prop) => sum + prop.monthlyRent, 0)
  const totalValue = demoProperties.reduce((sum, prop) => sum + prop.totalValue, 0)

  const monthlyIncome = demoTransactions
    .filter(t => t.type === 'rent' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = demoExpenses
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0)

  const netIncome = monthlyIncome - monthlyExpenses

  return {
    totalProperties,
    totalUnits,
    occupiedUnits,
    occupancyRate,
    totalMonthlyRent,
    totalValue,
    monthlyIncome,
    monthlyExpenses,
    netIncome
  }
}

// Monthly Revenue Data for Charts
export const getMonthlyRevenueData = () => {
  return [
    { month: 'Jan', income: 5500, expenses: 750, net: 4750 },
    { month: 'Feb', income: 5500, expenses: 1200, net: 4300 },
    { month: 'Mar', income: 5500, expenses: 900, net: 4600 },
    { month: 'Apr', income: 5500, expenses: 600, net: 4900 },
    { month: 'May', income: 5500, expenses: 1100, net: 4400 },
    { month: 'Jun', income: 5500, expenses: 800, net: 4700 }
  ]
}

// Property Performance Data
export const getPropertyPerformance = () => {
  return demoProperties.map(property => {
    const propertyTransactions = demoTransactions.filter(t => t.propertyId === property.id)
    const propertyExpenses = demoExpenses.filter(e => e.propertyId === property.id)
    
    const income = propertyTransactions
      .filter(t => t.type === 'rent' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = propertyExpenses
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0)
    
    return {
      name: property.name,
      income,
      expenses,
      netIncome: income - expenses,
      occupancyRate: (property.occupiedUnits / property.units) * 100
    }
  })
} 