import { ChevronLeft } from 'lucide-react'
import CompanySwitcher from '@/components/company-switcher'
import { getCompanyTheme } from '@/lib/company-config'
import LogoutButton from '@/components/logout-button'

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ companySlug: string }>
}) {
  const { companySlug } = await params
  const theme = getCompanyTheme(companySlug)

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.slug === 'profit-pathshala' ? '#1f2937' : 'white' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Company Name */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {theme.name.charAt(0)}
              </div>
              <span className="hidden sm:inline text-base font-semibold" style={{ color: theme.headingColor }}>
                {theme.name}
              </span>
            </div>

            {/* Right: Navigation + Switcher */}
            <div className="flex items-center gap-2">
              <LogoutButton />
              <nav className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 group"
                  style={{
                    color: theme.primaryColor,
                    backgroundColor: theme.slug === 'profit-pathshala' ? 'rgba(217, 119, 6, 0.1)' : '#e0e7ff',
                    border: `1px solid ${theme.slug === 'profit-pathshala' ? 'rgba(217, 119, 6, 0.3)' : '#e0d5ff'}`,
                  }}
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back</span>
                </button>
                <a href={`/user/${companySlug}/development/dm`} className="px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{
                    color: theme.primaryColor,
                    backgroundColor: theme.slug === 'profit-pathshala' ? 'rgba(217, 119, 6, 0.1)' : '#e0e7ff',
                    border: `1px solid ${theme.slug === 'profit-pathshala' ? 'rgba(217, 119, 6, 0.3)' : '#e0d5ff'}`,
                  }}
                >
                  DM
                </a>
                <a href={`/user/${companySlug}/development/data`} className="px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{
                    color: theme.primaryColor,
                    backgroundColor: theme.slug === 'profit-pathshala' ? 'rgba(217, 119, 6, 0.1)' : '#e0e7ff',
                    border: `1px solid ${theme.slug === 'profit-pathshala' ? 'rgba(217, 119, 6, 0.3)' : '#e0d5ff'}`,
                  }}
                >
                  Data Mgmt
                </a>
                <a href={`/user/${companySlug}/development/products`} className="px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{
                    color: theme.primaryColor,
                    backgroundColor: theme.slug === 'profit-pathshala' ? 'rgba(217, 119, 6, 0.1)' : '#e0e7ff',
                    border: `1px solid ${theme.slug === 'profit-pathshala' ? 'rgba(217, 119, 6, 0.3)' : '#e0d5ff'}`,
                  }}
                >
                  Products
                </a>
              </nav>
              <CompanySwitcher currentCompanySlug={companySlug} />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      {children}
    </div>
  )
}
