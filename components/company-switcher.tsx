'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { allCompanies, getCompanyTheme } from '@/lib/company-config'

interface CompanySwitcherProps {
  currentCompanySlug: string
}

export default function CompanySwitcher({ currentCompanySlug }: CompanySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const currentTheme = getCompanyTheme(currentCompanySlug)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCompanyChange = (companySlug: string) => {
    setIsOpen(false)
    
    // Extract the role (user/admin) and subpage from current path
    const pathParts = pathname.split('/')
    // path structure: /user|admin/companySlug/development/dm or /companySlug/dm
    const role = pathParts[1] === 'user' || pathParts[1] === 'admin' ? pathParts[1] : null
    
    let currentSubpage = ''
    if (role) {
      // For user/admin routes: /user/companySlug/development/dm
      currentSubpage = pathParts[3] || '' // development, operations, etc.
    } else {
      // For direct routes: /companySlug/dm
      currentSubpage = pathParts[2] || ''
    }
    
    // Check if the subpage exists in the new company
    const validSubpages = ['development', 'dm', 'data', 'products', 'operations']
    const targetSubpage = validSubpages.includes(currentSubpage) ? currentSubpage : 'development'
    
    // Preserve role if exists, otherwise just use company slug
    const newPath = role ? `/${role}/${companySlug}/${targetSubpage}` : `/${companySlug}/${targetSubpage}`
    router.push(newPath)
  }

  return (
    <div className="relative" ref={switcherRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center gap-2"
      >
        <span>Switch Company</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {allCompanies.map((company) => (
            <button
              key={company.slug}
              onClick={() => handleCompanyChange(company.slug)}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                currentCompanySlug === company.slug
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border-l-2'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {company.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
