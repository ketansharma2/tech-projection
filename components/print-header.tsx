import { Printer, Building2, User } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface PrintHeaderProps {
  title: string
  reportMonth?: string
}

export default function PrintHeader({ title, reportMonth }: PrintHeaderProps) {
  const [userName, setUserName] = useState('User')
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    // Get user info on client side
    const user = getUser()
    setUserName(user?.name || 'User')
  }, [])

  // Determine which background to use based on URL path
  const getBgSrc = () => {
    const path = pathname?.toLowerCase() || ''
    if (path.includes('/mks')) return '/mks-bg.png'
    if (path.includes('/savvi')) return '/savvi-bg.png'
    if (path.includes('/profit-pathshala')) return '/profit-pathshala-bg.png'
    return '/maven-bg.png'
  }
  const bgSrc = getBgSrc()
  
  // Determine which logo to use based on URL path
  const getLogoSrc = () => {
    const path = pathname?.toLowerCase() || ''
    if (path.includes('/mks')) return '/mks-logo.webp'
    if (path.includes('/savvi')) return '/savvi-logo.webp'
    if (path.includes('/profit-pathshala')) return '/profit-pathshala-logo.webp'
    return '/maven-logo.webp'
  }
  const logoSrc = getLogoSrc()
   
  // Return placeholder content during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <>
        <div className="hidden print-header w-full">
          <div className="flex items-center justify-between py-4 w-full">
            {/* Left: Company Logo */}
            <div className="flex-1">
              <img 
                src="/maven-logo.webp" 
                alt="Company Logo" 
                style={{ height: '40px', width: 'auto' }}
              />
            </div>

            {/* Center: Page Heading */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {reportMonth && (
                <p className="text-xs text-gray-500 mt-0.5">Report Month: {reportMonth}</p>
              )}
            </div>

            {/* Right: User Name */}
            <div className="flex-1 text-right">
              <p className="text-lg font-bold text-gray-900">User</p>
            </div>
          </div>
          {/* Divider with shadow */}
          <div className="border-b border-gray-200" style={{ boxShadow: '0 1px 3px 0 rgb(128 128 128)', marginBottom: '15px' }}></div>
        </div>

        {/* Background Page for Print - also needed for SSR */}
        <div 
          className="Print-bg-page"
          style={{ backgroundImage: 'url(/maven-bg.png)' }}
        />
      </>
    )
  }
  
  return (
    <>
      {/* Print Header - Only visible during print - Full width, Portrait */}
      <div className="hidden print-header w-full">
        <div className="flex items-center justify-between py-4 w-full">
          {/* Left: Company Logo */}
          <div className="flex-1">
            <img 
              src={logoSrc}
              alt="Company Logo" 
              style={{ height: '40px', width: 'auto' }}
            />
          </div>

          {/* Center: Page Heading */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {reportMonth && (
              <p className="text-xs text-gray-500 mt-0.5">Report Month: {reportMonth}</p>
            )}
          </div>

          {/* Right: User Name */}
          <div className="flex-1 text-right">
            <p className="text-lg font-bold text-gray-900">{userName}</p>
          </div>
        </div>
        {/* Divider with shadow */}
        <div className="border-b border-gray-200" style={{ boxShadow: '0 1px 3px 0 rgb(128 128 128)', marginBottom: '15px' }}></div>
      </div>

      {/* Background Page for Print - Full Page A4 - Shows as first page with background */}
      <div 
        className="print-bg-page"
        style={{ backgroundImage: `url(${bgSrc})` }}
      />
    </>
  )
}
