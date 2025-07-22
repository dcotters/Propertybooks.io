import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '../components/providers/SessionProvider'
import { TabProvider } from '../components/providers/TabProvider'
import Footer from '../components/Footer'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PropertyBooks.io - Simple Accounting for Landlords',
  description: 'Stop playing property management detective. PropertyBooks.io automatically categorizes expenses, tracks rent payments, and generates clean tax reports designed specifically for landlords.',
  keywords: 'landlord accounting, property management, rent collection, real estate software, PropertyBooks',
}

function LayoutWithFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // List of routes where the footer should be shown
  const showFooterRoutes = [
    '/', '/pricing', '/calculator', '/about', '/faq', '/contact', '/terms', '/privacy'
  ];
  const showFooter = showFooterRoutes.includes(pathname);
  return (
    <>
      {children}
      {showFooter && <Footer />}
    </>
  );
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