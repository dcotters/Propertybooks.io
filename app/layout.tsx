import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '../components/providers/SessionProvider'
import { TabProvider } from '../components/providers/TabProvider'
import LayoutWithFooter from '../components/LayoutWithFooter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PropertyBooks.io - Simple Accounting for Landlords',
  description: 'Stop playing property management detective. PropertyBooks.io automatically categorizes expenses, tracks rent payments, and generates clean tax reports designed specifically for landlords.',
  keywords: 'landlord accounting, property management, rent collection, real estate software, PropertyBooks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <TabProvider>
            <LayoutWithFooter>{children}</LayoutWithFooter>
          </TabProvider>
        </SessionProvider>
      </body>
    </html>
  )
} 