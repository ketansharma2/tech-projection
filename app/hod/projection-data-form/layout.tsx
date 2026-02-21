import AppHeader from '@/components/header'

export default async function ProjectionDataFormLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to 'maven' company slug for header
  const companySlug = 'maven'

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <AppHeader companySlug={companySlug} variant="hod" />

      {/* Content */}
      {children}
    </div>
  )
}
