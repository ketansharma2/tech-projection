'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function HodDevelopmentPage() {
  const params = useParams()
  const companySlug = params.companySlug as string

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-blue-950 dark:text-blue-100 tracking-tight leading-tight mb-2">
              Development
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-500 font-normal">
              Choose a workstream to manage
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              href={`/hod/${companySlug}/development/dm`}
              className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
            >
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Digital Marketing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage DM workstreams, tasks, and ownership</p>
            </Link>

            <Link
              href={`/hod/${companySlug}/development/data`}
              className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
            >
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Data Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage data workstreams and initiatives</p>
            </Link>

            <Link
              href={`/hod/${companySlug}/development/products`}
              className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
            >
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Products</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage product development tasks</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
