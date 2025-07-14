import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-lg font-bold text-primary-600">PropertyBooks.io</span>
          <span className="ml-2 text-gray-500 text-sm">&copy; {new Date().getFullYear()}</span>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm text-gray-600">
          <Link href="/pricing" className="hover:text-primary-600">Pricing</Link>
          <Link href="/calculator" className="hover:text-primary-600">Calculator</Link>
          <Link href="/terms" className="hover:text-primary-600">Terms</Link>
          <Link href="/privacy" className="hover:text-primary-600">Privacy</Link>
          <Link href="/about" className="hover:text-primary-600">About</Link>
          <Link href="/faq" className="hover:text-primary-600">FAQ</Link>
          <Link href="/contact" className="hover:text-primary-600">Contact</Link>
        </nav>
      </div>
    </footer>
  )
} 