import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BuildingOfficeIcon, CalculatorIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { useSession, signOut } from 'next-auth/react'
import { UserCircleIcon } from '@heroicons/react/24/solid'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { href: '/calculator', label: 'Calculator', icon: CalculatorIcon },
  // Add more links as needed
]

export default function SidebarNavigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="flex flex-col h-screen w-64 bg-white border-r border-gray-200 shadow-sm fixed top-0 left-0 z-40">
      <div className="flex items-center h-16 px-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center">
          <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">PropertyBooks.io</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${
              pathname.startsWith(link.href)
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <link.icon className="h-5 w-5 mr-3" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-4 pb-6">
        {session?.user && (
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center w-full focus:outline-none">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt="User avatar"
                  className="h-10 w-10 rounded-full border border-gray-300"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                  {session.user.name ? session.user.name[0] : <UserCircleIcon className="h-7 w-7" />}
                </div>
              )}
              <span className="ml-3 text-gray-900 font-semibold truncate">{session.user.name || session.user.email}</span>
            </Menu.Button>
            <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
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
        )}
      </div>
    </aside>
  )
} 