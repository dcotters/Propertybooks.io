'use client'
// Force deployment update - ensure 'use client' is recognized

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BuildingOfficeIcon, CalculatorIcon, ChartBarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { useSession, signOut } from 'next-auth/react'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { useTabContext } from './providers/TabProvider'
import React from 'react'

interface SidebarNavigationProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const sidebarTabs = [
  { key: 'overview', label: 'Overview', href: '/dashboard' },
  { key: 'properties', label: 'Properties', href: '/dashboard' },
  { key: 'transactions', label: 'Transactions', href: '/dashboard' },
  { key: 'reports', label: 'Reports', href: '/dashboard' },
  { key: 'financial-reports', label: 'Financial Reports', href: '/dashboard' },
  { key: 'taxes', label: 'Taxes', href: '/dashboard' },
  { key: 'calculator', label: 'Calculator', href: '/calculator' },
]

export default function SidebarNavigation() {
  const { selectedTab, setSelectedTab } = useTabContext();
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Clear any local storage or session storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Sign out with NextAuth
      await signOut({ 
        callbackUrl: '/',
        redirect: false 
      })
      
      // Force a complete page reload to clear all cached data
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
      // Force redirect to home page with reload
      window.location.href = '/'
      window.location.reload()
    }
  }

  // Notify parent/layout of collapse state (optional: add a class to body)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('sidebar-collapsed', isCollapsed)
    }
  }, [isCollapsed])

  // Determine if we're on calculator page
  const isCalculatorPage = pathname === '/calculator'
  
  // For dashboard pages, use selectedTab, for calculator use pathname
  const getActiveTab = (tab: any) => {
    if (tab.key === 'calculator') {
      return isCalculatorPage
    }
    return selectedTab === tab.key && !isCalculatorPage
  }

  if (status === 'loading') {
    return (
      <aside className="flex flex-col h-screen w-64 bg-white border-r border-gray-200 shadow-sm fixed top-0 left-0 z-40">
        <div className="flex items-center h-16 px-6 border-b border-gray-100">
          <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">PropertyBooks.io</span>
        </div>
        <div className="flex-1 px-4 py-6">
          <div className="animate-pulse space-y-2">
            {sidebarTabs.map((_, index) => (
              <div key={index} className="h-10 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className={`flex flex-col h-screen ${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 shadow-sm fixed top-0 left-0 z-40 transition-all duration-200`}>
      <div className="flex items-center h-16 px-6 border-b border-gray-100">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mr-2 p-1 rounded hover:bg-gray-100 focus:outline-none"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRightIcon className="h-5 w-5 text-gray-500" /> : <ChevronLeftIcon className="h-5 w-5 text-gray-500" />}
        </button>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">PropertyBooks.io</span>
          </Link>
        )}
      </div>
      <nav className={`flex-1 ${isCollapsed ? 'px-1 py-2' : 'px-4 py-6'} space-y-2`}>
        {sidebarTabs.map(tab => {
          const isActive = getActiveTab(tab)
          return (
            <Link
              key={tab.key}
              href={tab.href}
              onClick={() => tab.key !== 'calculator' && setSelectedTab(tab.key)}
              className={`flex items-center w-full ${isCollapsed ? 'justify-center px-0 py-2' : 'px-4 py-2'} rounded-lg font-medium transition-colors duration-150 text-left ${
                isActive
                  ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {/* Show only first letter or icon when collapsed */}
              {isCollapsed ? tab.label.charAt(0) : tab.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto px-4 pb-6">
        {session?.user && (
          <Menu as="div" className="relative">
            {({ open }) => (
              <>
                <Menu.Button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="User avatar"
                      className="h-10 w-10 rounded-full border border-gray-300"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                      {session.user.name ? session.user.name.charAt(0).toUpperCase() : <UserCircleIcon className="h-7 w-7" />}
                    </div>
                  )}
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 text-gray-900 font-semibold truncate flex-1 text-left">
                        {session.user.name || session.user.email}
                      </span>
                      <svg
                        className={`ml-2 h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </Menu.Button>
                <Menu.Items className="absolute bottom-full left-0 mb-2 w-56 origin-bottom-left bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/settings"
                          className={`block px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                        >
                          Profile Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${active ? 'bg-gray-100' : ''} ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isLoggingOut ? 'Logging out...' : 'Log Out'}
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </>
            )}
          </Menu>
        )}
      </div>
    </aside>
  )
} 