import React from 'react'

const faqs = [
  {
    q: 'What is PropertyBooks.io?',
    a: 'PropertyBooks.io is a modern accounting and property management platform designed specifically for landlords. It helps you track income, expenses, rent payments, and generate tax-ready reports.'
  },
  {
    q: 'How does the free tier work?',
    a: 'You can add 1 property and up to 10 transactions or documents for free. Upgrade to a paid plan to unlock unlimited properties, advanced features, and premium support.'
  },
  {
    q: 'How do I upgrade my plan?',
    a: 'Visit the Pricing page and select the plan that fits your needs. You’ll be guided through a secure checkout process powered by Stripe.'
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We use industry-standard encryption and best practices to keep your data safe. Your payment information is handled securely by Stripe.'
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. You can cancel your subscription at any time from your account settings. Your data will remain accessible until the end of your billing period.'
  },
  {
    q: 'How do I get support?',
    a: 'Email us at support@propertybooks.io or use the contact form on our website. We’re here to help!'
  }
]

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-primary-700 mb-8">Frequently Asked Questions</h1>
      <div className="space-y-8">
        {faqs.map((faq, i) => (
          <div key={i}>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{faq.q}</h2>
            <p className="text-gray-700">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 