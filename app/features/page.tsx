import Link from 'next/link'
import { BuildingOfficeIcon, ChartBarIcon, CalculatorIcon, DocumentTextIcon, CogIcon, ShieldCheckIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export default function FeaturesPage() {
  const features = [
    {
      icon: BuildingOfficeIcon,
      title: 'Property Management',
      description: 'Comprehensive property tracking with detailed information, photos, and maintenance history.',
      benefits: ['Track multiple properties', 'Store property documents', 'Monitor property performance', 'Maintenance scheduling']
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Income & Expense Tracking',
      description: 'Automated transaction categorization and real-time financial monitoring.',
      benefits: ['Automatic categorization', 'Real-time cash flow', 'Expense tracking', 'Income monitoring']
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Reporting',
      description: 'Generate comprehensive financial reports with AI-powered insights and recommendations.',
      benefits: ['Portfolio summary', 'Cash flow analysis', 'Tax summaries', 'Performance metrics']
    },
    {
      icon: CalculatorIcon,
      title: 'Rent Collection Efficiency Calculator',
      description: 'AI-powered calculator to identify revenue leaks and optimize rental income.',
      benefits: ['Late payment analysis', 'Vacancy loss tracking', 'Management fee optimization', 'Efficiency scoring']
    },
    {
      icon: DocumentTextIcon,
      title: 'Tax Management',
      description: 'AI-powered tax insights with country-specific guidance and deduction optimization.',
      benefits: ['Tax deduction tracking', 'Filing requirements', 'Deadline reminders', 'Country-specific guidance']
    },
    {
      icon: CogIcon,
      title: 'Smart Automation',
      description: 'Automated workflows and AI-powered analysis to save time and improve accuracy.',
      benefits: ['Automated categorization', 'AI insights', 'Smart notifications', 'Predictive analytics']
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Compliant',
      description: 'Bank-level security with data encryption and compliance with financial regulations.',
      benefits: ['Data encryption', 'Secure backups', 'GDPR compliant', 'Regular security audits']
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-User Access',
      description: 'Collaborate with your team, accountants, and property managers with role-based access.',
      benefits: ['Role-based permissions', 'Team collaboration', 'Accountant access', 'Audit trails']
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">PropertyBooks.io</span>
            </Link>
            <nav className="flex space-x-8">
              <Link href="/pricing" className="text-gray-500 hover:text-gray-900">Pricing</Link>
              <Link href="/contact" className="text-gray-500 hover:text-gray-900">Contact</Link>
              <Link href="/auth/signin" className="text-gray-500 hover:text-gray-900">Sign In</Link>
              <Link href="/auth/signup" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Everything You Need to Manage Your Rental Properties
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            PropertyBooks.io is the complete accounting and management solution designed specifically for landlords. 
            Track income, manage expenses, generate reports, and optimize your rental business with AI-powered insights.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signup" className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold">
              Start Free Trial
            </Link>
            <Link href="/calculator" className="border border-primary-600 text-primary-600 px-8 py-3 rounded-lg hover:bg-primary-50 font-semibold">
              Try Calculator
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Landlords
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From basic accounting to advanced AI insights, we've built everything you need to run a successful rental business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                  <h3 className="ml-3 text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Rental Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of landlords who are already using PropertyBooks.io to streamline their operations and increase their profits.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signup" className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold">
              Start Free Trial
            </Link>
            <Link href="/contact" className="border border-white text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 