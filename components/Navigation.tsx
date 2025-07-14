'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BuildingOfficeIcon, CalculatorIcon } from '@heroicons/react/24/outline'
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
          <Link href="/" className="flex items-center">
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
            {session?.user && (
              <></> // No extra links for logged-in users; all app navigation is in sidebar
            )}
          </div>

          {/* User avatar and dropdown for logged-in users */}
          {session?.user ? (
            <Menu as="div" className="relative ml-4">
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
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/settings"
                        className={`block px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                      >
                        Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${active ? 'bg-gray-100' : ''}`}
                      >
                        Log Out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          ) : null}

          {/* Mobile menu button (not implemented) */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 