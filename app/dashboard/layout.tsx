"use client";
import SidebarNavigation from '../../components/SidebarNavigation'
import React, { useEffect, useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const handle = () => {
      setSidebarCollapsed(document.body.classList.contains('sidebar-collapsed'))
    }
    handle()
    window.addEventListener('sidebar-toggle', handle)
    // Also listen for DOM changes
    const observer = new MutationObserver(handle)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => {
      window.removeEventListener('sidebar-toggle', handle)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="flex min-h-screen">
      <SidebarNavigation />
      <main className={`flex-1 bg-gray-50 min-h-screen transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  )
} 