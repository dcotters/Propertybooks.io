'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BuildingOfficeIcon, CalculatorIcon, ArrowRightIcon, CogIcon, UserIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { useSession, signOut } from 'next-auth/react'
import { Menu } from '@headlessui/react'
import { UserCircleIcon } from '@heroicons/react/24/solid'

export default function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">PropertyBooks.io</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!session?.user && (
              <>
                <Link 
                  href="/" 
                  className={`${isActive('/') ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'} py-2 px-1 font-medium`}
                >
                  Home
                </Link>
                <Link 
                  href="/pricing" 
                  className={`${isActive('/pricing') ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'} py-2 px-1 font-medium`}
                >
                  Pricing
                </Link>
                <Link 
                  href="/calculator" 
                  className={`${isActive('/calculator') ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'} py-2 px-1 font-medium flex items-center`}
                >
                  <CalculatorIcon className="h-4 w-4 mr-1" />
                  Calculator
                </Link>
                <Link 
                  href="/auth/signin" 
                  className="text-gray-600 hover:text-gray-900 py-2 px-1 font-medium"
                >
                  Log In
                </Link>
                <Link href="/auth/signup" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Right side - Go to App button or User avatar */}
          <div className="flex items-center">
            {session?.user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="btn-primary flex items-center mr-3"
                >
                  <ArrowRightIcon className="h-4 w-4 mr-1" />
                  Go to App
                </Link>
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center focus:outline-none">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt="User avatar"
                        className="h-9 w-9 rounded-full border border-gray-300"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                        {session.user.name ? session.user.name[0] : <UserCircleIcon className="h-7 w-7" />}
                      </div>
                    )}
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{session.user.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{session.user.email}</p>
                      </div>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/dashboard"
                            className={`flex items-center px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                          >
                            <ChartBarIcon className="h-4 w-4 mr-3" />
                            Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/dashboard?tab=properties"
                            className={`flex items-center px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                          >
                            <BuildingOfficeIcon className="h-4 w-4 mr-3" />
                            Properties
                          </Link>
                        )}
                      </Menu.Item>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/dashboard?tab=transactions"
                            className={`flex items-center px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                          >
                            <DocumentTextIcon className="h-4 w-4 mr-3" />
                            Transactions
                          </Link>
                        )}
                      </Menu.Item>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/dashboard?tab=reports"
                            className={`flex items-center px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                          >
                            <ChartBarIcon className="h-4 w-4 mr-3" />
                            Reports
                          </Link>
                        )}
                      </Menu.Item>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/dashboard?tab=taxes"
                            className={`flex items-center px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                          >
                            <DocumentTextIcon className="h-4 w-4 mr-3" />
                            Tax Insights
                          </Link>
                        )}
                      </Menu.Item>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/pricing"
                            className={`flex items-center px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                          >
                            <CogIcon className="h-4 w-4 mr-3" />
                            Pricing & Plans
                          </Link>
                        )}
                      </Menu.Item>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={async () => {
                              try {
                                await signOut({ 
                                  callbackUrl: '/',
                                  redirect: false 
                                })
                                // Force a hard refresh to clear any cached session data
                                window.location.href = '/'
                              } catch (error) {
                                console.error('Logout error:', error)
                                // Force redirect to home page
                                window.location.href = '/'
                              }
                            }}
                            className={`flex items-center w-full text-left px-4 py-2 text-sm text-red-600 ${active ? 'bg-gray-100' : ''}`}
                          >
                            <UserIcon className="h-4 w-4 mr-3" />
                            Log Out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Menu>
              </>
            ) : null}

            {/* Mobile menu button (not implemented) */}
            <div className="md:hidden ml-4">
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 