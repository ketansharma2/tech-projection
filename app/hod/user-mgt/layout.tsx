import AppHeader from '@/components/header'

export default async function HodUserMgtLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - use default company (maven) for this page */}
      <AppHeader companySlug="maven" variant="hod" />

      {/* Content */}
      {children}
    </div>
  )
}
