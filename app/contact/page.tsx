import React, { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-primary-700 mb-6">Contact Us</h1>
      <p className="text-lg text-gray-700 mb-8">
        Have a question, feature request, or need help? Fill out the form below or email us at <a href="mailto:support@propertybooks.io" className="text-primary-600 underline">support@propertybooks.io</a>.
      </p>
      {submitted ? (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-6">Thank you! We’ve received your message and will get back to you soon.</div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input id="name" name="name" type="text" required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" name="email" type="email" required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea id="message" name="message" rows={4} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <button type="submit" className="btn-primary w-full">Send Message</button>
        </form>
      )}
    </div>
  )
} 