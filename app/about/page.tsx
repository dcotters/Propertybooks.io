import React from 'react'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-primary-700 mb-6">About PropertyBooks.io</h1>
      <p className="text-lg text-gray-700 mb-6">
        PropertyBooks.io was founded by landlords who were tired of juggling spreadsheets, receipts, and tax headaches. We believe that managing rental properties should be simple, transparent, and stress-free.
      </p>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
      <p className="mb-6 text-gray-700">
        Our mission is to empower property owners to take control of their finances, maximize their investments, and spend less time on paperwork. We’re building the tools we wish we had when we started.
      </p>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Transparency and trust</li>
        <li>Empowering landlords of all sizes</li>
        <li>Modern, intuitive design</li>
        <li>Continuous improvement</li>
        <li>Customer-first support</li>
      </ul>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Meet the Founder</h2>
      <p className="mb-6 text-gray-700">
        Hi, I’m David Cottingham. I built PropertyBooks.io after years of managing my own rentals and realizing there had to be a better way. If you have feedback or want to share your story, <a href="mailto:david@propertybooks.io" className="text-primary-600 underline">email me directly</a>.
      </p>
    </div>
  )
} 