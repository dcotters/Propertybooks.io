'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import { 
  HomeIcon, 
  CalculatorIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const [email, setEmail] = useState('')

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email signup
    console.log('Email submitted:', email)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              Accounting for Landlords, <span className="text-primary-300">Simplified</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 max-w-2xl"
            >
              PropertyBooks.io automates expense tracking, rent collection, and tax reporting—so you can focus on growing your portfolio, not your paperwork.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center"
            >
              <a href="/auth/signup" className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                Start Free Trial
              </a>
              <a href="/pricing" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-primary-600 transition-colors duration-200">
                See Pricing
              </a>
              <a href="/calculator" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-primary-600 transition-colors duration-200">
                Try Calculator
              </a>
            </motion.div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
            {/* Placeholder for product screenshot/illustration */}
            <div className="rounded-xl shadow-lg overflow-hidden bg-white">
              <img src="/product-screenshot-placeholder.png" alt="Product Screenshot" className="w-full h-72 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Properties
            </h2>
            <p className="text-lg text-gray-600">
              PropertyBooks.io provides comprehensive tools designed specifically for landlords.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<HomeIcon className="h-8 w-8 text-primary-600" />} title="Property Management" desc="Track multiple properties, mortgage details, values, and occupancy rates." />
            <FeatureCard icon={<CurrencyDollarIcon className="h-8 w-8 text-success-600" />} title="Financial Tracking" desc="Track income, expenses, and cash flow with receipt uploads and auto-categorization." />
            <FeatureCard icon={<ChartBarIcon className="h-8 w-8 text-warning-600" />} title="Advanced Reports" desc="Generate income statements, cash flow reports, and tax summaries." />
            <FeatureCard icon={<DocumentTextIcon className="h-8 w-8 text-blue-600" />} title="Document Storage" desc="Upload and organize receipts, leases, and important documents." />
            <FeatureCard icon={<StarIcon className="h-8 w-8 text-yellow-500" />} title="Tax Optimization" desc="Maximize deductions with tax-optimized reports and expense categorization." />
            <FeatureCard icon={<ClockIcon className="h-8 w-8 text-gray-500" />} title="Automated Reminders" desc="Get notified for overdue rent, high expenses, and maintenance needs." />
          </div>
        </div>
      </section>

      {/* How It Works / Product Tour */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Get started in minutes. Manage your properties with ease.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard step={1} title="Sign Up & Connect" desc="Create your account and connect your properties in seconds." />
            <StepCard step={2} title="Track & Automate" desc="Automatically import transactions, upload receipts, and categorize expenses." />
            <StepCard step={3} title="Grow & Optimize" desc="Generate reports, maximize deductions, and scale your portfolio with confidence." />
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Landlords Are Saying</h2>
            <p className="text-lg text-gray-600">Real stories from real property owners.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard name="Sarah M." quote="PropertyBooks.io saved me hours every month and made tax season a breeze!" />
            <TestimonialCard name="James L." quote="I finally have a clear view of my rental income and expenses. Highly recommend!" />
            <TestimonialCard name="Priya S." quote="The best investment I made for my rental business. The reports are gold!" />
          </div>
        </div>
      </section>

      {/* About / Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 mb-6">
            PropertyBooks.io was built by landlords, for landlords. We believe managing rental properties should be simple, transparent, and stress-free. Our mission is to empower property owners to take control of their finances and grow their investments with confidence.
          </p>
          <a href="/about" className="text-primary-600 font-semibold hover:underline">Learn more about our story &rarr;</a>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Pay for yourself the first time you avoid a late fee or save on accounting costs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Free Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card relative"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-3xl font-bold text-primary-600 mb-4">
                  $0<span className="text-lg text-gray-500">/month</span>
                </div>
                <p className="text-gray-600 mb-6">Perfect for getting started</p>
                
                <ul className="text-left space-y-2 mb-8 text-sm">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    1 Property
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    10 Transactions
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    5 Documents
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    Basic Property Management
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    Transaction Tracking
                  </li>
                </ul>
                
                <a href="/auth/signup" className="btn-primary w-full block text-center text-sm py-2">
                  Get Started Free
                </a>
              </div>
            </motion.div>

            {/* Basic Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card relative"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
                <div className="text-3xl font-bold text-primary-600 mb-4">
                  $19<span className="text-lg text-gray-500">/month</span>
                </div>
                <p className="text-gray-600 mb-6">For growing portfolios</p>
                
                <ul className="text-left space-y-2 mb-8 text-sm">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    5 Properties
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    100 Transactions
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    50 Documents
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    Basic Reports
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    Email Support
                  </li>
                </ul>
                
                <a href="/auth/signup" className="btn-primary w-full block text-center text-sm py-2">
                  Start Free Trial
                </a>
              </div>
            </motion.div>

            {/* Premium Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card relative border-2 border-primary-500"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-3xl font-bold text-primary-600 mb-4">
                  $49<span className="text-lg text-gray-500">/month</span>
                </div>
                <p className="text-gray-600 mb-6">For serious investors</p>
                
                <ul className="text-left space-y-2 mb-8 text-sm">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    25 Properties
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    1,000 Transactions
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    500 Documents
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    Advanced Reports
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    AI Analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    Tax Optimization
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    Priority Support
                  </li>
                </ul>
                
                <a href="/auth/signup" className="btn-primary w-full block text-center text-sm py-2">
                  Start Free Trial
                </a>
              </div>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card relative"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-primary-600 mb-4">
                  $99<span className="text-lg text-gray-500">/month</span>
                </div>
                <p className="text-gray-600 mb-6">For large portfolios</p>
                
                <ul className="text-left space-y-2 mb-8 text-sm">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    Unlimited Properties
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    Unlimited Transactions
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    Unlimited Documents
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    All Features
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    Custom Integrations
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    API Access
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    Dedicated Support
                  </li>
                </ul>
                
                <a href="/auth/signup" className="btn-primary w-full block text-center text-sm py-2">
                  Contact Sales
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Your Weekends Back?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of landlords who've stopped playing property management detective.
          </p>
          
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
              required
            />
            <button type="submit" className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Get Started
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BuildingOfficeIcon className="h-8 w-8 text-primary-400" />
                <span className="ml-2 text-xl font-bold">PropertyBooks.io</span>
              </div>
              <p className="text-gray-400">
                Simple accounting software designed specifically for landlords.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Calculator</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PropertyBooks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 

// FeatureCard component
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="text-center bg-white rounded-xl shadow p-8 flex flex-col items-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  )
}

// StepCard component
function StepCard({ step, title, desc }: { step: number, title: string, desc: string }) {
  return (
    <div className="bg-gray-50 rounded-xl shadow p-8 flex flex-col items-center">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 text-2xl font-bold mb-4">{step}</div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-gray-600 text-center">{desc}</p>
    </div>
  )
}

// TestimonialCard component
function TestimonialCard({ name, quote }: { name: string, quote: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center">
      <StarIcon className="h-8 w-8 text-yellow-400 mb-2" />
      <p className="text-gray-700 italic mb-4">“{quote}”</p>
      <span className="font-semibold text-primary-600">{name}</span>
    </div>
  )
} 