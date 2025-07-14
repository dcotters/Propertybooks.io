'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BuildingOfficeIcon,
  CalculatorIcon,
  HomeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useSession, signOut } from 'next-auth/react'

export default function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">PropertyBooks.io</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`${
                isActive('/') 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'
              } py-2 px-1 font-medium`}
            >
              Home
            </Link>
            <Link 
              href="/calculator" 
              className={`${
                isActive('/calculator') 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'
              } py-2 px-1 font-medium flex items-center`}
            >
              <CalculatorIcon className="h-4 w-4 mr-1" />
              Calculator
            </Link>
            <Link 
              href="/dashboard" 
              className={`${
                isActive('/dashboard') 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'
              } py-2 px-1 font-medium flex items-center`}
            >
              <ChartBarIcon className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
            {session?.user ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className="text-gray-600 hover:text-gray-900 py-2 px-1 font-medium"
                >
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
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