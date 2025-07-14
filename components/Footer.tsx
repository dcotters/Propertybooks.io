import Link from 'next/link'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <BuildingOfficeIcon className="h-8 w-8 text-primary-400" />
              <span className="ml-2 text-2xl font-bold">PropertyBooks.io</span>
            </div>
            <p className="text-gray-400">
              Simple accounting software designed specifically for landlords.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/features" className="hover:underline">Features</Link></li>
              <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
              <li><Link href="/calculator" className="hover:underline">Calculator</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:underline">About</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms</Link></li>
              <li><Link href="/privacy" className="hover:underline">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400 text-sm border-t border-gray-800 pt-8">
          &copy; {new Date().getFullYear()} PropertyBooks.io. All rights reserved.
        </div>
      </div>
    </footer>
  )
} 