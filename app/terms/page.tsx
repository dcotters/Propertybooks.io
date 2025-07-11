import React from 'react'
import Navigation from '../../components/Navigation'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BuildingOfficeIcon className="h-12 w-12 text-primary-600" />
            <span className="ml-3 text-3xl font-bold text-gray-900">PropertyBooks.io</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using PropertyBooks.io, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            PropertyBooks.io provides landlord accounting and property management software designed to help property owners track income, expenses, and generate financial reports.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </p>

          <h2>4. Subscription and Billing</h2>
          <p>
            PropertyBooks.io offers subscription-based services. You agree to pay all fees associated with your chosen plan. Subscriptions are billed in advance on a monthly or annual basis.
          </p>

          <h2>5. Data and Privacy</h2>
          <p>
            We are committed to protecting your data. Please review our Privacy Policy for details on how we collect, use, and protect your information.
          </p>

          <h2>6. Acceptable Use</h2>
          <p>
            You agree to use PropertyBooks.io only for lawful purposes and in accordance with these Terms. You may not use the service to store or transmit malicious code or violate any applicable laws.
          </p>

          <h2>7. Termination</h2>
          <p>
            You may cancel your subscription at any time. We reserve the right to terminate accounts that violate these terms or for extended periods of inactivity.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            PropertyBooks.io is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
          </p>

          <h2>10. Contact Information</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at support@propertybooks.io.
          </p>
        </div>
      </div>
    </div>
  )
} 