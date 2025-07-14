import SidebarNavigation from '../../components/SidebarNavigation'

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SidebarNavigation />
      <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  )
} 