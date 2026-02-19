import { redirect } from 'next/navigation'

export default async function DataPage({ params }: { params: Promise<{ companySlug: string }> }) {
  const { companySlug } = await params
  redirect(`/${companySlug}/development/data`)
}
