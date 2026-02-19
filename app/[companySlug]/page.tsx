'use client'

import { use } from 'react'
import Link from 'next/link'
import { getCompanyTheme } from '@/lib/company-config'

export default function CompanyHomePage({ params }: { params: Promise<{ companySlug: string }> }) {
  const { companySlug } = use(params)
  const theme = getCompanyTheme(companySlug)

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4" style={{ color: theme.headingColor }}>
            {theme.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Welcome to the {theme.name} dashboard. Select a section below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link href={`/${companySlug}/dm`}>
            <div
              className="p-8 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{
                borderColor: theme.primaryColor,
                backgroundColor: theme.slug === 'profit-pathshala' ? 'rgba(217, 119, 6, 0.05)' : 'rgba(16, 60, 127, 0.05)',
              }}
            >
              <h2 className="text-2xl font-bold mb-2" style={{ color: theme.headingColor }}>
                Digital Marketing
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your digital marketing workstreams and tasks</p>
            </div>
          </Link>

          <Link href={`/${companySlug}/data`}>
            <div
              className="p-8 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{
                borderColor: theme.primaryColor,
                backgroundColor: theme.slug === 'profit-pathshala' ? 'rgba(217, 119, 6, 0.05)' : 'rgba(16, 60, 127, 0.05)',
              }}
            >
              <h2 className="text-2xl font-bold mb-2" style={{ color: theme.headingColor }}>
                Data Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Handle your data-related tasks and workflows</p>
            </div>
          </Link>

          <Link href={`/${companySlug}/products`}>
            <div
              className="p-8 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{
                borderColor: theme.primaryColor,
                backgroundColor: theme.slug === 'profit-pathshala' ? 'rgba(217, 119, 6, 0.05)' : 'rgba(16, 60, 127, 0.05)',
              }}
            >
              <h2 className="text-2xl font-bold mb-2" style={{ color: theme.headingColor }}>
                Products
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your products and related operations</p>
            </div>
          </Link>

          <Link href={`/${companySlug}/development`}>
            <div
              className="p-8 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 opacity-60"
              style={{
                borderColor: theme.primaryColor,
                backgroundColor: theme.slug === 'profit-pathshala' ? 'rgba(217, 119, 6, 0.05)' : 'rgba(16, 60, 127, 0.05)',
              }}
            >
              <h2 className="text-2xl font-bold mb-2" style={{ color: theme.headingColor }}>
                Development
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
