'use client'

import TitleBlock from '@/components/title-block'

export default function OperationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TitleBlock title="Operations" />

          <div className="mt-12 text-center">
            <div className="inline-block p-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">Coming soon</h2>
              <p className="text-gray-600 dark:text-gray-400">Operations page is under construction. Check back soon!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
