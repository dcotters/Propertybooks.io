import React from 'react'
import Navigation from '@/components/Navigation'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BuildingOfficeIcon className="h-12 w-12 text-primary-600" />
            <span className="ml-3 text-3xl font-bold text-gray-900">PropertyBooks.io</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, upload documents, or contact us for support. This includes:
          </p>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Property and transaction data</li>
            <li>Documents and receipts you upload</li>
            <li>Communication with our support team</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process your transactions and send related information</li>
            <li>Send technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Improve our services and develop new features</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your data at any time.
          </p>

          <h2>6. Third-Party Services</h2>
          <p>
            We use third-party services for:
          </p>
          <ul>
            <li>Payment processing (Stripe)</li>
            <li>File storage (AWS S3)</li>
            <li>Email services (SendGrid)</li>
            <li>Authentication (Google OAuth)</li>
          </ul>

          <h2>7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience and analyze usage patterns. You can control cookie settings through your browser.
          </p>

          <h2>8. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>9. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at privacy@propertybooks.io.
          </p>
        </div>
      </div>
    </div>
  )
} 