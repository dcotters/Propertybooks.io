'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9,
    period: 'month',
    features: [
      'Up to 5 properties',
      'Basic expense tracking',
      'Monthly reports',
      'Email support',
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19,
    period: 'month',
    features: [
      'Unlimited properties',
      'Advanced analytics',
      'Document storage',
      'Priority support',
      'Tax preparation tools',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49,
    period: 'month',
    features: [
      'Everything in Premium',
      'Multi-user access',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
    ],
    popular: false,
  },
]

export default function SubscriptionPlans() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
        }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        })

        if (error) {
          console.error('Stripe error:', error)
        }
      }
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Pricing Plans
          </h1>
          <p className="mt-4 text-lg text-gray-500 sm:text-xl max-w-2xl mx-auto">
            Choose the perfect plan for your property management needs
          </p>
        </div>

        <div className="mt-12 space-y-6 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-8 lg:max-w-5xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border border-gray-200 rounded-xl shadow-lg divide-y divide-gray-200 bg-white transition-all duration-200 hover:shadow-xl ${
                plan.popular ? 'border-primary-500 ring-2 ring-primary-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex rounded-full bg-primary-600 px-4 py-1 text-sm font-semibold tracking-wide uppercase text-white shadow-lg">
                    Most popular
                  </span>
                </div>
              )}
              <div className="p-6">

                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  {plan.name}
                </h2>
                <p className="mt-4 text-sm text-gray-500">
                  Perfect for {plan.name.toLowerCase()} landlords
                </p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    /{plan.period}
                  </span>
                </p>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`mt-8 block w-full border border-transparent rounded-lg py-3 text-sm font-semibold text-white text-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  {loading === plan.id ? 'Processing...' : 'Subscribe'}
                </button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 